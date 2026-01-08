import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';

export const HolographicWidgets: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-10 p-6 flex flex-col justify-between">
            {/* Top Left: Date/Time */}
            <div className="flex justify-between items-start">
                <GlassCard className="p-4 border-l-2 border-cyan-500/50 rounded-none bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-cyan-400/70 font-mono tracking-widest">SYSTEM.TIME</span>
                        <span className="text-3xl font-light text-white font-mono">
                            {time.toLocaleTimeString([], { hour12: false })}
                        </span>
                        <span className="text-sm text-cyan-200/50 font-sans tracking-wide">
                            {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                        </span>
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Left: Network/Lat/Long */}
            <div className="flex justify-between items-end">
                <GlassCard className="p-3 border-b-2 border-cyan-500/50 rounded-none bg-black/40 backdrop-blur-sm">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-xs text-cyan-300 font-mono">NET: SECURE</span>
                        </div>
                        <div className="text-[10px] text-cyan-500/40 font-mono space-y-0.5">
                            <div>LAT: 34.0522 N</div>
                            <div>LON: 118.2437 W</div>
                            <div>UPLINK: 840 MBPS</div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
