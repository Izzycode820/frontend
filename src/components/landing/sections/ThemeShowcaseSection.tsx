"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const THEMES = [
    { name: "Minimalist", description: "Clean lines for modern brands", color: "bg-stone-100" },
    { name: "Vanguard", description: "Bold aesthetics for rule breakers", color: "bg-zinc-100" },
    { name: "Elegance", description: "Sophisticated luxury style", color: "bg-orange-50" },
    { name: "Urban", description: "Streetwear & excessive visuals", color: "bg-blue-50" },
];

export function ThemeShowcaseSection() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Map vertical scroll (0 to 1) to horizontal movement
    // Tuned to -55% to prevent over-scrolling into empty space
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-55%"]);

    return (
        // Outer Container: Defines the scroll distance (400vh -> 300vh for faster scroll)
        <section ref={targetRef} className="relative h-[300vh] z-20">
            {/* Sticky Viewport: The "Stacked" Card Appearance */}
            <div className="sticky top-0 h-screen flex flex-col overflow-hidden rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] bg-[#fdf4ff]">

                {/* Header: Title Left, Button Right */}
                <div className="absolute top-0 left-0 right-0 w-full px-6 md:px-12 py-10 z-30 flex justify-between items-end pointer-events-none fade-in">
                    <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-black max-w-2xl pointer-events-auto leading-[1.1]">
                        Pick a theme from our showcase.
                    </h2>

                    <Link href="/showcase" className="pointer-events-auto hidden md:block">
                        <button className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-huzilerz-black transition-colors flex items-center gap-2 group shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            View All Themes
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                {/* Decorative Stack Number */}
                <div className="absolute top-6 right-6 md:right-12 z-20 opacity-50">
                    <span className="text-sm font-bold text-black/20">03</span>
                </div>

                <div className="flex-1 flex flex-col justify-center relative overflow-hidden">
                    {/* Horizontal Scroll Track */}
                    <div className="flex items-center h-full pt-32 w-full overflow-hidden">
                        <motion.div
                            style={{ x }}
                            className="flex gap-6 md:gap-10 px-6 md:px-12 w-max h-[55vh] md:h-[60vh] items-center"
                        >
                            {THEMES.map((theme, i) => (
                                <Link
                                    href={`/showcase/${theme.name.toLowerCase()}`}
                                    key={i}
                                    className={cn(
                                        "relative w-[80vw] md:w-[45vw] lg:w-[30vw] h-full rounded-[2.5rem] overflow-hidden shadow-sm border border-black/5 shrink-0 group transition-transform duration-500 hover:scale-[1.01] hover:shadow-2xl",
                                        theme.color
                                    )}
                                >
                                    {/* Image Area - Centered & Clean */}
                                    <div className="absolute inset-0 p-8 md:p-12 flex items-center justify-center">
                                        <div className="w-full aspect-[4/5] md:aspect-square shadow-2xl rounded-2xl overflow-hidden relative transform transition-transform duration-700 group-hover:scale-105">
                                            <img
                                                src="/images/themes/placeholder_theme.png"
                                                alt={theme.name}
                                                className="absolute inset-0 w-full h-full object-cover object-top"
                                            />
                                        </div>
                                    </div>

                                    {/* Hover Overlay: Name Only */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                                        <div className="overflow-hidden">
                                            <span className="inline-block text-black text-4xl font-light tracking-wide opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out border-b-2 border-black pb-1">
                                                {theme.name}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </div>

            </div>
        </section>
    );
}
