"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { StackedSection } from "../ui/StackedSection";

const HUSTLES = [
    {
        title: "Digital Products",
        description: "Sell e-books, templates, or courses. Low overhead, high margin."
    },
    {
        title: "Affiliate Marketing",
        description: "Promote products you love and earn a commission on every sale."
    },
    {
        title: "Print on Demand",
        description: "Custom designs on t-shirts, mugs, and more. No inventory needed."
    },
    {
        title: "Freelancing",
        description: "Offer your skills as a service. Writing, design, coding, and more."
    },
    {
        title: "Man in the middle",
        description: "Be the bridge between buyer and whole sellers without even owning the product."
    }
];

export default function StageInspiration() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % HUSTLES.length);
        }, 6000); // Change every 6 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-20 bg-[#Fdfbf7] overflow-hidden">
            <div className="relative w-full h-full flex flex-col justify-center max-w-7xl mx-auto">

                {/* Header Area: Relative Flow */}
                <div className="w-full mb-12 z-20">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-thin tracking-tight text-black leading-none whitespace-normal md:whitespace-nowrap">
                        Or choose from the <span className="font-normal font-serif text-amber-700 italic">different hustles</span> we offer
                    </h2>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-12">

                    {/* LEFT: Text Content - Synced with Card */}
                    <div className="flex flex-col justify-center min-h-[200px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="space-y-4"
                            >
                                <span className="text-sm font-bold text-black/40 uppercase tracking-widest">
                                    Option {index + 1} of {HUSTLES.length}
                                </span>
                                <h3 className="text-4xl md:text-5xl font-medium text-black">
                                    {HUSTLES[index].title}
                                </h3>
                                <p className="text-xl md:text-2xl font-light text-black/60 max-w-md leading-relaxed">
                                    {HUSTLES[index].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: Card Deck Animation - Clean Horizontal Slide */}
                    <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden rounded-3xl">
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.div
                                key={index}
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{
                                    x: { type: "spring", stiffness: 45, damping: 18 },
                                    opacity: { duration: 0.8 }
                                }}
                                className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10"
                            >
                                <Image
                                    src="/landing/vector/dropshipping-large.jpg"
                                    alt={HUSTLES[index].title}
                                    fill
                                    className="object-cover"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                                    <p className="text-white font-medium text-2xl tracking-wide">{HUSTLES[index].title}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}
