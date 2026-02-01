"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { StackedSection } from "../ui/StackedSection";

const ROLES = ["an entrepreneur", "an online business", "a brand"];

export function HowToStartSection() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % ROLES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <StackedSection title="Process" color="bg-[#e0e7ff]" index={0.2}>
            {/* bg-indigo-100 equivalent */}

            <div className="flex flex-col h-full px-6 md:px-12 py-8 max-w-7xl mx-auto">

                {/* Animated One-Line Headline */}
                <div className="w-full">
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-thin tracking-tight text-black/90 leading-[1.1] whitespace-nowrap">
                        How to become
                        <span className="inline-block relative h-[1.1em] min-w-[300px] md:min-w-[500px] align-bottom overflow-visible mx-2 md:mx-4">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={ROLES[index]}
                                    initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                    exit={{ y: -20, opacity: 0, filter: "blur(10px)" }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    className="absolute left-0 top-0 italic text-indigo-600 whitespace-nowrap"
                                >
                                    {ROLES[index]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        today.
                    </h2>
                </div>


                <div className="relative w-full max-w-7xl mx-auto mt-16 pb-20">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 pl-4 md:pl-0">

                        {/* 1. SIDE HUSTLE */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center gap-8 p-4 rounded-3xl hover:bg-black/5 transition-colors cursor-default text-center"
                        >
                            {/* Profile Picture */}
                            <div className="relative w-48 h-48 shrink-0 rounded-full overflow-hidden border-2 border-black/10 shadow-md bg-white">
                                <img src="/landing/vector/vector-side-hustle.png" alt="Side Hustle" className="w-full h-full object-cover" />
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col">
                                <p className="text-3xl md:text-4xl font-light text-black/90 leading-tight">
                                    Looking for an <span className="font-semibold text-indigo-600">online side hustle</span> to earn extra cash?
                                </p>
                            </div>
                        </motion.div>

                        {/* 2. ENTREPRENEUR */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col items-center gap-8 p-4 rounded-3xl hover:bg-black/5 transition-colors cursor-default text-center"
                        >
                            <div className="relative w-48 h-48 shrink-0 rounded-full overflow-hidden border-2 border-black/10 shadow-md bg-white">
                                <img src="/landing/vector/vector-entrepreneur.png" alt="Entrepreneur" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex flex-col">
                                <p className="text-3xl md:text-4xl font-light text-black/90 leading-tight">
                                    Or thoughts on being an <span className="font-semibold text-emerald-600">upcoming entrepreneur</span> in a niche?
                                </p>
                            </div>
                        </motion.div>

                        {/* 3. CURIOUS */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col items-center gap-8 p-4 rounded-3xl hover:bg-black/5 transition-colors cursor-default text-center"
                        >
                            <div className="relative w-48 h-48 shrink-0 rounded-full overflow-hidden border-2 border-black/10 shadow-md bg-white">
                                <img src="/landing/vector/vector-curious.png" alt="Curious" className="w-full h-full object-cover" />
                            </div>

                            <div className="flex flex-col">
                                <p className="text-3xl md:text-4xl font-light text-black/90 leading-tight">
                                    Or just <span className="font-semibold text-amber-600">curious</span> about new ways to make money online?
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>

        </StackedSection >
    );
}
