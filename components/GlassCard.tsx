import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'accent';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'dark',
  ...props 
}) => {
  const variants = {
    dark: "bg-black/40 border-white/10 text-slate-200",
    light: "bg-white/10 border-white/20 text-white",
    accent: "bg-cyan-900/30 border-cyan-500/30 text-cyan-50"
  };

  return (
    <motion.div
      className={`backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Glossy overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
