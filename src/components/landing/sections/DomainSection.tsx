"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { StackedSection } from "../ui/StackedSection";

const TYPING_SEQUENCES = ["mystore", "myshop", "babara"];

export function DomainSection() {
    const [text, setText] = useState("");
    const [seqIndex, setSeqIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Typing Effect Logic
    useEffect(() => {
        const currentWord = TYPING_SEQUENCES[seqIndex];
        const typeSpeed = isDeleting ? 50 : 150;
        const pauseTime = 1500;

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                // Typing
                setText(currentWord.substring(0, text.length + 1));

                // Finished typing word
                if (text.length === currentWord.length - 1) {
                    // Wait then delete
                    setTimeout(() => setIsDeleting(true), pauseTime);
                }
            } else {
                // Deleting
                setText(currentWord.substring(0, text.length - 1));

                // Finished deleting
                if (text.length === 0) {
                    setIsDeleting(false);
                    setSeqIndex((prev) => (prev + 1) % TYPING_SEQUENCES.length);
                }
            }
        }, typeSpeed);

        return () => clearTimeout(timeout);
    }, [text, isDeleting, seqIndex]);

    // Specific check for "babara" to show success state
    const isFinalSuccess = seqIndex === TYPING_SEQUENCES.length - 1 && text === "babara";

    return (
        <StackedSection title="Domain" color="bg-[#fffbeb]" index={0.4}>
            {/* bg-amber-50 (Pastel Yellow/Warm) */}

            <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 py-12 md:py-0 h-full">

                {/* Left: Content */}
                <div className="flex-1 space-y-8">
                    <h2 className="text-4xl md:text-6xl font-thin tracking-tight text-black leading-[1.1]">
                        We provide a <span className="font-normal border-b-2 border-[#fbbf24]">free domain</span> for your store.
                    </h2>

                    <p className="text-xl text-black/70 font-light leading-relaxed max-w-lg">
                        Customize it to your need or Connect your own domain so your customers can find you easily.
                    </p>

                    <div>
                        <button className="px-8 py-4 bg-black text-white rounded-full font-medium hover:bg-huzilerz-black transition-all flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1">
                            Claim your domain
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Animation Visual */}
                <div className="flex-1 w-full max-w-xl">
                    {/* Browser Bar Mockup */}
                    <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/5 ring-4 ring-black/5">
                        {/* Browser Header */}
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex gap-2 items-center">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                <div className="w-3 h-3 rounded-full bg-green-400/80" />
                            </div>
                            <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 flex items-center justify-center text-xs text-gray-400 font-mono shadow-sm">
                                <span className="mr-1">🔒</span> secure.huzilerz.com/claim
                            </div>
                        </div>

                        {/* Browser Body (Search Center) */}
                        <div className="p-12 md:p-16 flex flex-col items-center justify-center bg-white min-h-[300px]">

                            <div className="mb-8 text-center space-y-2">
                                <h3 className="text-2xl font-bold text-black">Find your address</h3>
                            </div>

                            {/* The Input Animation */}
                            <div className={cn(
                                "relative w-full max-w-md border-2 rounded-xl px-4 py-4 md:px-6 md:py-6 flex items-center justify-center shadow-inner transition-colors duration-500 pr-14",
                                isFinalSuccess ? "border-green-500 bg-green-50/50" : "border-gray-200 bg-gray-50/50"
                            )}>
                                <div className="flex items-center">
                                    <span className="text-xl md:text-3xl text-gray-400 font-light select-none">www.</span>

                                    <div className="relative">
                                        <span className="text-xl md:text-3xl text-black font-medium tracking-tight">
                                            {text}
                                        </span>
                                        {/* Blinking Cursor */}
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                            className="inline-block w-[2px] h-6 md:h-8 bg-black ml-0.5 align-middle"
                                        />
                                    </div>

                                    <span className="text-xl md:text-3xl text-gray-400 font-light select-none">.huzilerz.com</span>
                                </div>

                                {/* Success Icon */}
                                <div className={cn(
                                    "absolute right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white transition-all duration-500 transform",
                                    isFinalSuccess ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                )}>
                                    <Check className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Result Text */}
                            <div className="h-8 mt-4 flex items-center justify-center">
                                {isFinalSuccess && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-green-600 font-medium flex items-center gap-2"
                                    >
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Available!
                                    </motion.span>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </StackedSection>
    );
}
