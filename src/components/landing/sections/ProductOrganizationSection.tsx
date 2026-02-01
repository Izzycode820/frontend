"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { StackedSection } from "../ui/StackedSection";

export function ProductOrganizationSection() {
    return (
        <StackedSection title="Product Organization" color="bg-white" index={0.2}>
            <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center h-full py-12 md:py-0">

                {/* Left: Text Content - Similar to previous section but updated copy */}
                <div className="flex flex-col gap-8 order-2 lg:order-1">
                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-black leading-[1.1]">
                            Organize your <span className="font-normal">merchandise</span> for sale.
                        </h2>

                        <div className="space-y-6 text-lg md:text-xl text-black/70 font-light leading-relaxed max-w-xl">
                            <p>
                                Add products, manage variants, and track incoming orders with ease.
                            </p>
                            <p>
                                Our intuitive dashboard gives you full control over your product lineup,
                                allowing you to focus on what matters most—your brand.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="px-8 py-4 bg-transparent border border-black text-black rounded-full font-medium hover:bg-black hover:text-white transition-all flex items-center gap-3 group">
                            Manage Inventory
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Right: Visual Composition (Product Details + Sales Card) */}
                <div className="relative order-1 lg:order-2 perspective-1000">
                    {/* Base Layer: Product Details Page */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative rounded-xl overflow-hidden shadow-xl border border-black/5 bg-white z-10"
                    >
                        <img
                            src="/images/themes/product_details_babara.png"
                            alt="Product Details Interface"
                            className="w-full h-auto object-cover"
                        />
                    </motion.div>

                    {/* Top Layer: Order Summary Card (Overlapping/Floating) */}
                    <motion.div
                        initial={{ opacity: 0, x: 40, y: 40 }}
                        whileInView={{ opacity: 1, x: -20, y: 20 }} // Move into position overlapping the bottom right
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        className="absolute -bottom-10 -right-4 md:-right-10 w-2/3 md:w-3/5 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-20"
                    >
                        <img
                            src="/images/themes/order_summary_card.png"
                            alt="Order Summary Sales Card"
                            className="w-full h-auto object-cover"
                        />
                    </motion.div>

                </div>

            </div>
        </StackedSection>
    );
}
