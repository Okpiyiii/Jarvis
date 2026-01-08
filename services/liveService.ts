import { ai, LIVE_MODEL, AUDIO_SAMPLE_RATE_INPUT, AUDIO_SAMPLE_RATE_OUTPUT } from '../constants';
import { createPcmBlob, decodeBase64ToBytes, decodeAudioData } from './audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';
import { AssistantState } from '../types';

export class LiveService {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private sessionPromise: Promise<any> | null = null;
  private onStateChange: (state: AssistantState) => void;
  private onAudioLevel: (level: number) => void;
  private onTranscription: (text: string, isUser: boolean) => void;
  private analyser: AnalyserNode | null = null;

  constructor(
    onStateChange: (state: AssistantState) => void,
    onAudioLevel: (level: number) => void,
    onTranscription: (text: string, isUser: boolean) => void
  ) {
    this.onStateChange = onStateChange;
    this.onAudioLevel = onAudioLevel;
    this.onTranscription = onTranscription;
  }

  public async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: AUDIO_SAMPLE_RATE_INPUT,
    });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: AUDIO_SAMPLE_RATE_OUTPUT,
    });

    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);
    
    // Analyser for visualization
    this.analyser = this.outputAudioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.outputNode.connect(this.analyser);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.onStateChange(AssistantState.IDLE);

    this.sessionPromise = ai.live.connect({
      model: LIVE_MODEL,
      callbacks: {
        onopen: () => {
          console.log('Gemini Live Connected');
          this.onStateChange(AssistantState.LISTENING);
          this.startAudioInput(stream);
        },
        onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
        onclose: () => {
            console.log('Gemini Live Closed');
            this.onStateChange(AssistantState.IDLE);
        },
        onerror: (err) => {
            console.error('Gemini Live Error', err);
            this.onStateChange(AssistantState.ERROR);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        systemInstruction: `You are Aurora, a futuristic, highly intelligent, and helpful AI assistant. 
        Your interface is a crystalline, glass-like 3D orb. 
        Be concise, professional, yet warm. 
        You are inspired by sleek, sci-fi aesthetics.`,
        inputAudioTranscription: { model: 'gemini-2.5-flash-native-audio-preview-12-2025' }, 
        // Note: model field in transcription config is sometimes required/implied depending on SDK version, empty object usually suffices if not specific
      }
    });
    
    // Start visualization loop
    this.visualize();
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      // Calculate input volume for local feedback
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      // Only trigger visualizer if we aren't currently speaking (to avoid double noise)
      // Ideally we mix both, but simplified here.
      
      if (this.sessionPromise) {
        this.sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputAudioContext && this.outputNode) {
        this.onStateChange(AssistantState.SPEAKING);
        
        const bytes = decodeBase64ToBytes(audioData);
        const audioBuffer = await decodeAudioData(
            bytes,
            this.outputAudioContext,
            AUDIO_SAMPLE_RATE_OUTPUT,
            1
        );
        
        this.nextStartTime = Math.max(this.outputAudioContext.currentTime, this.nextStartTime);
        
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        source.start(this.nextStartTime);
        
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
        
        source.onended = () => {
            this.sources.delete(source);
            if (this.sources.size === 0) {
                // Determine next state based on turn completion? 
                // For now, if audio ends, we go back to listening usually, 
                // but the socket is full duplex so we are technically always listening.
                this.onStateChange(AssistantState.LISTENING);
            }
        };
    }

    // Handle Transcription
    if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
        // sometimes text comes through directly
         this.onTranscription(message.serverContent.modelTurn.parts[0].text, false);
    }
    
    // Explicit transcription fields
    /* Note: The SDK typings might be strict, so we access safely */
    const anyMsg = message as any;
    if (anyMsg.serverContent?.outputTranscription?.text) {
         this.onTranscription(anyMsg.serverContent.outputTranscription.text, false);
    }
    if (anyMsg.serverContent?.inputTranscription?.text) {
         this.onTranscription(anyMsg.serverContent.inputTranscription.text, true);
    }

    // Handle Turn Complete
    if (message.serverContent?.turnComplete) {
        // Defines end of a logical turn
        if (this.sources.size === 0) {
             this.onStateChange(AssistantState.LISTENING);
        }
    }
    
    // Handle Interruption
    if (message.serverContent?.interrupted) {
        this.stopAudioOutput();
        this.nextStartTime = 0;
        this.onStateChange(AssistantState.LISTENING);
    }
  }

  private stopAudioOutput() {
      this.sources.forEach(source => {
          try { source.stop(); } catch(e) {}
      });
      this.sources.clear();
  }

  private visualize() {
    if (!this.analyser) return;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const update = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        this.onAudioLevel(average / 255); // Normalize 0-1

        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  public async disconnect() {
    if (this.sessionPromise) {
        const session = await this.sessionPromise;
        // There isn't a direct .close() on session in all versions, 
        // usually closing the client or just stopping streams is enough.
        // We will assume simply cutting local streams and reloading is acceptable for now.
    }
    
    if (this.processor) {
        this.processor.disconnect();
        this.processor.onaudioprocess = null;
    }
    if (this.inputSource) this.inputSource.disconnect();
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
    
    this.inputAudioContext = null;
    this.outputAudioContext = null;
  }
}
