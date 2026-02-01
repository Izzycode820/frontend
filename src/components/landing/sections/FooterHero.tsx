"use client";

import { motion } from "framer-motion";
import { AmoebaBackground } from "./AmoebaBackground";
import Link from "next/link";

export function FooterHero() {
    return (
        // Fixed position for Curtain Reveal effect.
        <div className="fixed bottom-0 left-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center z-0">
            {/* 1. BACKGROUND: Reused Amoeba */}
            <AmoebaBackground />

            {/* 2. CONTENT */}
            <div className="relative z-20 flex flex-col justify-center items-center px-6 text-center max-w-7xl mx-auto w-full h-full">
                <div className="max-w-5xl space-y-10 flex flex-col items-center">
                    {/* MAIN HEADLINE */}
                    <h2 className="text-5xl md:text-7xl lg:text-9xl font-thin leading-[0.9] tracking-tighter text-white/90">
                        Your ambition.<br />
                        Your rules.<br />
                        <span className="text-huzilerz-lime italic">Your empire.</span>
                    </h2>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="pt-12"
                    >
                        <Link href="/signup">
                            <button className="h-20 px-12 bg-white text-black font-medium text-2xl rounded-full hover:bg-huzilerz-lime hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                Get Started
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
