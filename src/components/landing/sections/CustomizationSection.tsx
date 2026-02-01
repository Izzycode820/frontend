"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { StackedSection } from "../ui/StackedSection";

export function CustomizationSection() {
    return (
        <StackedSection title="Customization" color="bg-[#faf5ff]" index={0}>
            <div className="relative w-full h-full flex flex-col justify-center">

                {/* Header Area - Centered Wrapper */}
                <div className="w-full max-w-7xl mx-auto mb-8 z-20 px-6 md:px-12 pt-8 md:pt-0">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-thin tracking-tight text-black leading-none whitespace-normal">
                        Start today with one of <span className="font-normal font-serif text-purple-800 italic">our themes</span>.
                    </h2>
                </div>

                {/* Full Width Split Grid */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center flex-1 pb-12">

                    {/* Left: Text Content - Padding from left edge */}
                    <div className="flex flex-col gap-8 justify-start pt-4 order-2 lg:order-1 px-6 md:px-12 lg:pl-20 lg:pr-16">
                        <div className="space-y-6">
                            <h3 className="text-3xl md:text-5xl font-light text-black leading-tight">
                                Make the theme your own by <span className="font-normal">Customizing it</span>.
                            </h3>

                            <div className="space-y-6 text-lg text-black/70 font-light leading-relaxed max-w-xl">
                                <p>
                                    Use our theme editor to make the website reflect your brand.
                                </p>
                                <p>
                                    Adjust colors, fonts, and layouts with drag-and-drop simplicity.
                                    No coding required—just pure creative freedom.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="px-8 py-4 bg-transparent border border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all flex items-center gap-3 group">
                                Start Customizing
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Right: Editor Preview Image - Edge to Edge */}
                    <div className="relative flex items-center justify-end order-1 lg:order-2 w-full">
                        <div className="w-full h-auto lg:pl-12">
                            <img
                                src="/images/themes/editor_preview.png"
                                alt="Theme Customization Editor"
                                className="w-full h-auto object-contain shadow-2xl lg:rounded-l-2xl lg:rounded-r-none border-y border-l border-black/5"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </StackedSection>
    );
}
