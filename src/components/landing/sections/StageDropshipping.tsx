"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { StackedSection } from "../ui/StackedSection";

const STEPS = [
    "Choose a Niche: Tech gadgets, home decor, or beauty.",
    "Find Suppliers: Connect with AliExpress, CJ Dropshipping, or local.",
    "Organize Products: Add products to your Huzilerz store.",
    "Set Pricing: Add your margin and automate updates.",
    "Start Selling: Drive traffic by advertising your products and get your first sale.",
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

export default function StageDropshipping() {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-20 bg-[#E6F3F9] overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">

                {/* Header Area: Top Left (Consistent with Fashion Stage) */}
                <div className="absolute top-4 left-6 md:top-12 md:left-12 z-20 w-full max-w-full pointer-events-none">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-thin tracking-tight text-black leading-none whitespace-nowrap">
                        What about <span className="font-normal font-serif text-sky-800 italic">Dropshipping?</span>
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 text-xl md:text-2xl lg:text-3xl font-light text-zinc-600 leading-none tracking-tight max-w-lg"
                    >
                        Zero inventory. <strong className="font-semibold text-black">Infinite possibilities</strong>.
                    </motion.p>
                </div>

                {/* Main Content Area */}
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-40 md:mt-20">

                    {/* LEFT: Steps Guide */}
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

                    {/* RIGHT: Large Borderless Image */}
                    <div className="flex justify-center md:justify-end relative h-full w-full">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative w-full h-[500px] md:h-[700px] flex items-center justify-end"
                        >
                            {/* Image set to cover/contain without borders to blend */}
                            <Image
                                src="/landing/vector/dropshipping-large.jpg"
                                alt="Dropshipping Business"
                                fill
                                className="object-contain object-right"
                            />
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
