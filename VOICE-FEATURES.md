# 🎤 Voice Features Guide

## ✅ What's Been Added

Your Jarvis assistant now has **full voice capabilities**:

1. **Voice Input** - Speak to Jarvis using your microphone
2. **Voice Output** - Jarvis speaks responses back to you
3. **Auto-listening** - Automatically listens after speaking

## 🎯 How to Use

### First Time Setup

1. **Open the app** at http://localhost:3001/
2. **Click "INITIALIZE SYSTEM"**
3. **Allow microphone access** when browser asks (important!)
4. You'll see a **red pulsing microphone button** at the bottom

### Voice Input

**Method 1: Voice Button (Recommended)**
- Click the **red pulsing microphone button** at the bottom
- Wait for "LISTENING..." indicator
- Speak your command clearly
- Jarvis will automatically process your speech

**Method 2: Auto-listening**
- After Jarvis finishes speaking, it automatically starts listening again
- Just wait 1 second and speak

**Method 3: Text Input (Backup)**
- Click the small keyboard icon
- Type your message
- Press Enter

### Voice Output

- Jarvis automatically speaks all responses
- You'll see the text with typewriter effect
- The orb pulses while speaking
- Audio level visualization shows speaking activity

## 🎙️ Voice Commands to Try

```
Hello Jarvis
What's the weather in New York?
Show system stats
Open Chrome
Play music
What did we talk about?
Tell me a joke
What time is it?
```

## 🔊 Voice Settings

### Browser Compatibility

**Best Support:**
- ✅ Chrome/Edge (Chromium) - Full support
- ✅ Safari - Full support
- ⚠️ Firefox - Limited support

**Required Permissions:**
- Microphone access (browser will ask)
- Audio playback (usually allowed by default)

### Troubleshooting Voice Input

**"Microphone button not showing"**
- Your browser doesn't support speech recognition
- Use Chrome or Edge for best results
- Check browser console for errors

**"Not detecting my voice"**
- Check microphone permissions in browser settings
- Make sure microphone is not muted
- Try speaking louder or closer to mic
- Check if another app is using the microphone

**"Stops listening too quickly"**
- This is normal - it waits for you to finish speaking
- Click the mic button again to restart
- Or wait for auto-restart after response

### Troubleshooting Voice Output

**"Jarvis not speaking"**
- Check browser audio is not muted
- Check system volume
- Try refreshing the page
- Check browser console for TTS errors

**"Voice sounds robotic"**
- This is the browser's built-in text-to-speech
- Different browsers have different voices
- Chrome usually has the best quality

**"Can't hear Jarvis"**
- Check system volume
- Check browser tab is not muted (look for speaker icon on tab)
- Try a different browser

## 🎨 Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🔴 Red pulsing mic button | Ready to listen |
| "LISTENING..." badge | Currently listening to your voice |
| Blue orb | Idle/Ready |
| Pulsing orb | Processing your request |
| Animated orb | Speaking response |
| Typewriter text | Current response being spoken |

## ⚙️ Advanced Configuration

### Change Voice Settings

Edit `hooks/useTextToSpeech.ts`:

```typescript
// Customize voice properties
utterance.pitch = 1;    // 0.1 to 2 (lower = deeper)
utterance.rate = 1;     // 0.1 to 10 (higher = faster)
utterance.volume = 1;   // 0 to 1
```

### Change Recognition Language

Edit `hooks/useSpeechRecognition.ts`:

```typescript
recognition.lang = 'en-US';  // Change to your language
// Examples: 'en-GB', 'es-ES', 'fr-FR', 'de-DE'
```

### Disable Auto-listening

Edit `App.tsx`, remove this section:

```typescript
// Auto-restart listening after speaking ends
React.useEffect(() => {
  if (!isSpeaking && hasStarted && state === AssistantState.LISTENING && !isListening) {
    const timeout = setTimeout(() => {
      if (hasRecognitionSupport) {
        startListening();
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }
}, [isSpeaking, hasStarted, state, isListening, hasRecognitionSupport, startListening]);
```

## 🔐 Privacy & Security

### Microphone Access
- Voice input is processed by your browser's built-in speech recognition
- Audio is sent to Google's speech recognition API (if using Chrome)
- No audio is stored by the Jarvis app
- You can revoke microphone permission anytime in browser settings

### Voice Output
- Text-to-speech is processed locally by your browser
- No data is sent to external servers for TTS
- Completely private and offline

## 📊 Performance Tips

### Reduce Latency
1. Use a wired internet connection
2. Close other tabs/apps using microphone
3. Speak clearly and at normal pace
4. Use Chrome for best performance

### Battery Saving
- Voice recognition uses more battery
- Use text input on battery power
- Disable auto-listening if not needed

## 🎯 Best Practices

1. **Speak clearly** - Enunciate words
2. **Wait for indicator** - Look for "LISTENING..." before speaking
3. **One command at a time** - Wait for response before next command
4. **Use wake word** - Say "Jarvis" first (optional, helps context)
5. **Check connection** - Make sure backend is running

## 🐛 Common Issues

### Issue: "Speech recognition not available"
**Solution:** Use Chrome or Edge browser

### Issue: "Microphone blocked"
**Solution:** 
1. Click the lock icon in address bar
2. Allow microphone access
3. Refresh the page

### Issue: "Voice cuts off mid-sentence"
**Solution:** 
- This is a browser limitation
- Speak in shorter sentences
- Or use text input for long messages

### Issue: "Response not speaking"
**Solution:**
1. Check browser console for errors
2. Try clicking anywhere on page first (browser audio policy)
3. Refresh the page

## 🎉 Tips for Best Experience

1. **Use headphones** - Prevents echo and feedback
2. **Quiet environment** - Reduces background noise
3. **Good microphone** - Better recognition accuracy
4. **Chrome browser** - Best overall support
5. **Allow permissions** - Don't block microphone access

## 🚀 What's Next

Possible enhancements:
- Custom wake word detection ("Hey Jarvis")
- Voice activity detection (continuous listening)
- Multiple language support
- Custom voice selection
- Voice commands for UI control
- Offline speech recognition

---

**Enjoy talking to your Jarvis AI assistant! 🎤🤖**
