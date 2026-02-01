"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
    { id: "capital", label: "Make money with 0 FCFA capital" },
    { id: "brand", label: "How to start any brand" },
    { id: "huzil", label: "How to choose a Huzil" },
];

const CONTENT = {
    capital: {
        title: "Start dropshipping today.",
        subtitle: "Launch a business without holding inventory. The modern way to retail.",
        steps: [
            { title: "Find a Supplier", desc: "Connect with reliable suppliers who stock the products you want to sell." },
            { title: "List Products", desc: "Import products to your Huzilerz store with one click. Set your own prices." },
            { title: "Make a Sale", desc: "Market your store. When a customer buys, you get paid instant cash flow." },
            { title: "Supplier Ships", desc: "The supplier handles packaging and shipping directly to your customer." },
            { title: "Keep the Profit", desc: "You keep the difference between the retail price and the wholesale cost." },
        ]
    },
    brand: {
        title: "Build your legacy.",
        subtitle: "From a simple idea to a fully functioning online brand empire.",
        steps: [
            { title: "Choose a Niche", desc: "Identify a specific market segment with passionate customers." },
            { title: "Define Target Market", desc: "Understand who your customers are, what they need, and where they hang out." },
            { title: "Plan Your Products", desc: "Curate or design a product line that solves a problem for your niche." },
            { title: "Get a Website", desc: "Use Huzilerz Camp to build a stunning, professional store in minutes." },
            { title: "Launch & Scale", desc: "Publish your store, run ads, and get your first orders rolling in." },
        ]
    },
    huzil: {
        title: "Choosing your path.",
        subtitle: "Select the right Huziler plan that fits your ambition.",
        steps: [] // User requested to leave detailed content blank
    }
};

export function EducationalGuideSection() {
    const [activeTab, setActiveTab] = useState("capital");

    return (
        <section className="relative w-full z-30 min-h-screen flex flex-col justify-center bg-gray-50 border-t border-black/5 py-12">
            <div className="container mx-auto px-6 md:px-12 flex flex-col gap-12 md:gap-16">

                {/* Tab Navigation (Hollow Chips) */}
                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-3 rounded-full border border-black/20 text-lg font-medium transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-black text-white border-black shadow-lg"
                                    : "bg-transparent text-black/60 hover:border-black/50 hover:text-black"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start min-h-[500px]">

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-black leading-[1.1]">
                                {CONTENT[activeTab as keyof typeof CONTENT].title}
                            </h2>

                            <p className="text-xl text-black/70 font-light leading-relaxed max-w-md">
                                {CONTENT[activeTab as keyof typeof CONTENT].subtitle}
                            </p>

                            <div className="pt-4">
                                <button className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-huzilerz-black transition-all flex items-center gap-3 group shadow-xl">
                                    Get Started
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Steps List (Right Side) */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + "-list"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="space-y-6"
                        >
                            {CONTENT[activeTab as keyof typeof CONTENT].steps.length > 0 ? (
                                CONTENT[activeTab as keyof typeof CONTENT].steps.map((step, i) => (
                                    <div key={i} className="flex gap-6 group border-b border-black/5 last:border-0 pb-6 last:pb-0">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-sm font-bold text-black/50 group-hover:border-black group-hover:text-black transition-colors">
                                            {i + 1}
                                        </span>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-medium text-black">{step.title}</h3>
                                            <p className="text-black/60 leading-relaxed font-light">{step.desc}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Empty State for "Choose a Huzil" tab vertical spacer
                                <div className="h-full flex items-center justify-center border-l border-black/5 pl-8 text-black/30 italic">
                                    Content coming soon...
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                </div>

            </div>
        </section>
    );
}
