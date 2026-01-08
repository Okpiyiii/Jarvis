import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { SystemStats as SystemStatsType } from '../types';

interface SystemStatsProps {
    stats: SystemStatsType | null;
}

export const SystemStats: React.FC<SystemStatsProps> = ({ stats }) => {
    if (!stats) return null;

    return (
        <GlassCard className="absolute top-6 right-6 p-4 w-48 flex flex-col gap-3 font-mono text-xs border-cyan-500/20 bg-black/60 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]">
            <div className="flex justify-between items-center text-cyan-400 border-b border-cyan-500/30 pb-2 mb-1">
                <span className="tracking-[0.2em]">SYSTEM.MONITOR</span>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            </div>

            {/* CPU */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-cyan-100/70">
                    <span>CPU_CORE</span>
                    <span>{stats.cpu}</span>
                </div>
                <div className="w-full h-1 bg-cyan-900/40 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-cyan-500 shadow-[0_0_5px_cyan]"
                        initial={{ width: 0 }}
                        animate={{ width: stats.cpu }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* RAM */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-cyan-100/70">
                    <span>MEM_ALLOC</span>
                    <span>{stats.ram}</span>
                </div>
                <div className="w-full h-1 bg-cyan-900/40 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-blue-500 shadow-[0_0_5px_blue]"
                        initial={{ width: 0 }}
                        animate={{ width: stats.ram }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* BATTERY */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-cyan-100/70">
                    <span>PWR_CELL</span>
                    <span>{stats.battery}</span>
                </div>
                <div className="w-full h-1 bg-cyan-900/40 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-green-500 shadow-[0_0_5px_green]"
                        initial={{ width: 0 }}
                        animate={{ width: stats.battery }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500" />

        </GlassCard>
    );
};
