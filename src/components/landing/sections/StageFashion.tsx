"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { StackedSection } from "../ui/StackedSection";

const STEPS = [
    "Find Your Niche: Sustainable, streetwear, or luxury.",
    "Select Business Model: Print On Demand, dropshipping, or inventory.",
    "Build Brand Identity: Unique voice, logo, and style.",
    "Source & Logistics: Ethical suppliers and shipping.",
    "Launch & Scale: Optimize for conversion and drive traffic.",
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

export default function StageFashion() {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-20 bg-[#ffe4e9] dark:bg-zinc-950 overflow-hidden">
            <div className="relative w-full h-full flex flex-col justify-center max-w-7xl mx-auto">

                {/* 1. Header Area: Relative Flow */}
                <div className="w-full mb-12 md:mb-0 z-20">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-thin tracking-tight text-black dark:text-white leading-none whitespace-normal md:whitespace-nowrap">
                        Ever wanted to start a <span className="font-normal font-serif text-emerald-800 italic">fashion brand?</span>
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-xl md:text-2xl lg:text-3xl font-light text-zinc-600 dark:text-zinc-400 leading-none tracking-tight max-w-lg"
                    >
                        It gets easy here at <strong className="font-semibold text-black dark:text-white">huzilerz</strong>.
                    </motion.p>
                </div>

                {/* Main Content Area: Steps (Left) + Circular Image (Right) */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-12 md:mt-20">

                    {/* LEFT: Steps Guide - Strict EducationalGuide Style */}
                    <motion.div
                        className="flex flex-col space-y-8 md:pl-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="space-y-6">
                            {STEPS.map((step, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    className="flex gap-6 group border-b border-black/5 last:border-0 pb-6 last:pb-0"
                                >
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-sm font-bold text-black/50 group-hover:border-black group-hover:text-black transition-colors bg-white/50">
                                        {i + 1}
                                    </span>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-medium text-black">{step.split(":")[0]}</h3>
                                        <p className="text-black/70 leading-relaxed font-light">{step.split(":")[1]}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT: Circular Image Container */}
                    <div className="flex justify-center md:justify-end relative">
                        {/* Decorative Elements behind circle */}
                        <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl scale-110 -z-10" />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative w-80 h-80 md:w-[500px] md:h-[500px] rounded-full bg-white dark:bg-zinc-900 border-[6px] border-white shadow-2xl overflow-hidden flex items-center justify-center"
                        >
                            <div className="relative w-full h-full p-8 md:p-12">
                                <Image
                                    src="/landing/vector/fashion-merchant.png"
                                    alt="Fashion Merchant"
                                    fill
                                    className="object-contain p-4 hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
