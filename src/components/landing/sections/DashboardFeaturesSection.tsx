"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ShoppingBag, Users, Tag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { StackedSection } from "../ui/StackedSection";

export function DashboardFeaturesSection() {
    return (
        <StackedSection title="Controls" color="bg-white" index={0.6}>
            <div className="relative w-full h-full flex flex-col justify-center">

                {/* Header Area - Top Aligned & Consistent */}
                <div className="w-full max-w-7xl mx-auto mb-8 z-20 px-6 md:px-12 pt-8 md:pt-0">
                    <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-black leading-[1.1]">
                        Everything you need to <span className="font-normal">run your business</span>.
                    </h2>
                    <p className="mt-6 text-xl text-black/70 font-light leading-relaxed max-w-2xl">
                        Manage your orders, inventory, discounts, and customer campaigns all in one place.
                        A powerful dashboard designed for growth.
                    </p>
                </div>

                {/* Full Width Split Grid */}
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center flex-1 pb-12">

                    {/* Left: Feature List & CTA - Padding from left edge */}
                    <div className="flex flex-col gap-10 justify-start pt-4 order-2 lg:order-1 px-6 md:px-12 lg:pl-20 lg:pr-12">

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {[
                                { icon: ShoppingBag, label: "Orders", desc: "Track & fulfill orders instantly." },
                                { icon: BarChart3, label: "Inventory", desc: "Real-time stock synchronization." },
                                { icon: Tag, label: "Discounts", desc: "Auto-apply logic for sales." },
                                { icon: Users, label: "Customers", desc: "CRM & deep insights." },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                                    className="flex flex-col gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-black/5 group/item"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-black group-hover/item:bg-black group-hover/item:text-white transition-colors duration-300">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-black leading-tight mb-1">{feature.label}</h3>
                                        <p className="text-sm text-black/50 group-hover/item:text-black/70 transition-colors">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2">
                            <Link href="/signup">
                                <button className="px-10 py-4 bg-black text-white text-lg rounded-full font-medium hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                    Start for free
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Dashboard Image - Edge to Edge */}
                    <div className="relative flex items-center justify-end order-1 lg:order-2 w-full">
                        <div className="w-full h-auto lg:pl-12">
                            <motion.img
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                src="/images/dashboard.png"
                                alt="Huzilerz Admin Dashboard"
                                className="w-full h-auto object-contain shadow-2xl lg:rounded-l-2xl lg:rounded-r-none border-y border-l border-black/5"
                            />
                        </div>
                    </div>

                </div>

            </div>
        </StackedSection>
    );
}
