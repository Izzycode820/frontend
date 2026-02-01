"use client";

import React, { useRef } from 'react';
import { Card } from "@/components/shadcn-ui/card";
import { motion, useScroll, useTransform } from "framer-motion";

const BrandSection = () => {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Horizontal Scroll Logic:
    // 0% - 15%: Start Delay (Lock)
    // 15% - 75%: Horizontal Scroll (Finishes earlier to allow for curtain overlap)
    // 75% - 100%: End Delay (Lock) + Curtain Overlap

    // ADJUSTMENTS:
    // Start at "0%" to be flush with left edge.
    // End at "-75%" to scroll through all cards without empty space.
    // Timeline ends at 0.75 so cards stop moving BEFORE the next section covers them.
    const x = useTransform(scrollYProgress, [0.15, 0.75], ["0%", "-75%"]);

    // Video Data (Duplicated to 6)
    const videos = [
        { id: 1, brand: "Gemaura", desc: "Gemaura vous dit Bonjour", video: "/vidoes/gemaura.mp4" },
        { id: 2, brand: "Urban Fit", desc: "From local gym to global brand", video: "/vidoes/gemaura.mp4" },
        { id: 3, brand: "EcoLife", desc: "Sustainable dropshipping success", video: "/vidoes/gemaura.mp4" },
        { id: 4, brand: "Velvet Home", desc: "Luxury decor on a budget", video: "/vidoes/gemaura.mp4" },
        { id: 5, brand: "TechZone", desc: "Electronics niche domination", video: "/vidoes/gemaura.mp4" },
        { id: 6, brand: "PureSkin", desc: "Organic beauty revolution", video: "/vidoes/gemaura.mp4" },
    ];

    return (
        // 1. TALL CONTAINER (The Scroll Track) - 400vh
        // -mb-[100vh]: Negates the last viewport of height, allowing the Next Section flows UP 
        // to overlap this section for the final 100vh of the scroll.
        // This creates the "Stacked/Curtain" effect where Pricing slides over BrandSection.
        <section ref={targetRef} className="relative h-[400vh] -mb-[100vh] bg-orange-400">

            {/* 2. STICKY INTERFACE (The Viewport) */}
            <div className="sticky top-0 h-screen overflow-hidden flex flex-col pt-12">
                <div className="container mx-auto px-6 md:px-12 h-full flex flex-col">

                    {/* Header Section (Customization Style) */}
                    <div className="flex flex-col gap-6 mb-12 shrink-0">
                        <div className="w-full h-px bg-white/30" /> {/* Thin separator line */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-white leading-[1.1] max-w-4xl">
                                Huzilers building
                                <span className="font-normal italic"> succeeding brands.</span>
                            </h2>
                            <p className="text-white/80 max-w-sm text-lg font-medium leading-relaxed">
                                Watch how everyday entrepreneurs are turning simple ideas into profitable empires using our tools.
                            </p>
                        </div>
                    </div>

                    {/* Horizontal Scroll Window */}
                    <div className="flex-1 flex items-center w-full overflow-hidden">
                        <motion.div
                            style={{ x }}
                            className="flex gap-8 px-6 md:px-12 w-max" // w-max ensures container width fits content
                        >
                            {videos.map((item) => (
                                <Card
                                    key={item.id}
                                    className="group relative border-none shadow-2xl rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-500 h-[60vh] w-[80vw] md:w-[40vw] lg:w-[30vw] flex-shrink-0 bg-black"
                                >
                                    {/* Video Container */}
                                    <div className="relative flex-1 w-full h-full bg-gray-900 overflow-hidden">
                                        {/* HTML Video Element */}
                                        <video
                                            src={item.video}
                                            className="w-full h-full object-cover"
                                            muted
                                            loop
                                            playsInline
                                            autoPlay
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    </div>

                                    {/* Card Content */}
                                    <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/90 to-transparent pt-20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold">
                                                {item.brand[0]}
                                            </div>
                                            <span className="font-bold text-lg tracking-wide">{item.brand}</span>
                                        </div>
                                        <p className="text-white/70 text-sm font-medium pl-11 border-l-2 border-white/20">
                                            {item.desc}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandSection;
