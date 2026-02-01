"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function AmoebaBackground() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for the blob following the mouse
    const springConfig = { damping: 30, stiffness: 150, mass: 2 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Random wandering state
    const [wander, setWander] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const targetX = clientX - window.innerWidth / 2;
            const targetY = clientY - window.innerHeight / 2;
            mouseX.set(targetX);
            mouseY.set(targetY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    useEffect(() => {
        // Wandering effect when idle or mixing with mouse movement
        const interval = setInterval(() => {
            setWander({
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-huzilerz-black">
            {/* Base gradient background for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-huzilerz-black via-fuchsia-950/20 to-emerald-950/20" />

            {/* The Amoeba Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center pointer-events-none">
                <motion.div
                    style={{
                        x: springX,
                        y: springY,
                    }}
                    animate={{
                        scale: [1, 1.1, 0.9, 1],
                        rotate: [0, 10, -10, 0],
                        x: springX.get() + wander.x, // Simplified mix, ideally spring handles main movement
                        y: springY.get() + wander.y,
                    }}
                    transition={{
                        scale: { duration: 5, repeat: Infinity, repeatType: "mirror" },
                        rotate: { duration: 8, repeat: Infinity, repeatType: "mirror" },
                        // Allow spring to control x/y primarily, wander is additive in a real implementation 
                        // but here stick to style-based physics for mouse and animate for blobs.
                    }}
                    className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full blur-[100px] opacity-60 mix-blend-screen"
                />

                {/* Secondary Blob for "Oil in Water" effect */}
                <motion.div
                    animate={{
                        x: wander.x * -1.5,
                        y: wander.y * -1.5,
                        scale: [1.2, 0.8, 1.2],
                    }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-huzilerz-lime via-yellow-400 to-orange-500 rounded-full blur-[120px] opacity-40 mix-blend-overlay"
                />
            </div>

            {/* Glassmorphism Overlay Texture */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[50px] z-10" />

            {/* Noise texture for premium feel (Optional) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-10 pointer-events-none" />
        </div>
    );
}
