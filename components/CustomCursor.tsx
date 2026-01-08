import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Optimized Spring configuration for snappier, less laggy feel
    // Higher stiffness = faster response
    // Lower damping = more oscillation (too low is bad)
    // Mass = weight (lower is faster)
    const springConfig = { damping: 25, stiffness: 450, mass: 0.2 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            // Use requestAnimationFrame for smoother updates if not already handled by motion value
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleHoverStart = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Improved hover detection logic
            const isInteractive =
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.closest('button') ||
                target.closest('a') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(!!isInteractive);
        };

        window.addEventListener('mousemove', moveCursor, { passive: true });
        window.addEventListener('mouseover', handleHoverStart, { passive: true });

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHoverStart);
            document.body.style.cursor = 'auto';
        };
    }, [cursorX, cursorY]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* Central Point - Immediate Follower */}
            <motion.div
                className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    // Force hardware acceleration
                    transform: 'translateZ(0)',
                    willChange: 'transform'
                }}
            />

            {/* Outer Ring - Lagging Follower */}
            <motion.div
                className="absolute border border-cyan-500/50 rounded-full"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%',
                    width: isHovering ? 48 : 24,
                    height: isHovering ? 48 : 24,
                    transform: 'translateZ(0)',
                    willChange: 'transform, width, height'
                }}
                animate={{
                    scale: isHovering ? 1.2 : 1,
                    rotate: isHovering ? 45 : 0,
                    opacity: isHovering ? 0.8 : 0.5
                }}
                transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                }}
            >
                {/* Decorative accents on the ring */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-200 rounded-full opacity-50" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-200 rounded-full opacity-50" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-200 rounded-full opacity-50" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-200 rounded-full opacity-50" />
            </motion.div>
        </div>
    );
};
