"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
    {
        question: "Is it easy to build a store?",
        answer: "Yes. Huzilerz offers a simplified setup process. You can choose from our professionally designed themes, customize them with our visual editor, and start selling in minutes without any coding knowledge."
    },
    {
        question: "Can I use my own domain name?",
        answer: "Absolutely. We provide a free .huzilerz.com subdomain to get you started, but you can connect your own custom domain (e.g., yourbrand.com) at any time from the dashboard settings."
    },
    {
        question: "How do I get paid?",
        answer: "You can connect your preferred payment gateway (like Fapshi for M.T.N and Orange Mo.Mo) directly in the dashboard. Payments from your customers go straight to your account, minus standard processing fees."
    },
    {
        question: "Do I need to worry about hosting?",
        answer: "No. All Huzilerz plans include secure, unlimited cloud hosting. We handle the technical details, security updates, and daily backups so you can focus on growing your business."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative w-full z-30 min-h-screen flex flex-col justify-center bg-white border-t border-black/5 rounded-b-[80px] shadow-[0_10px_50px_rgba(0,0,0,0.5)] mb-[20px] py-12">
            <div className="container mx-auto px-6 md:px-12">

                <h2 className="text-4xl md:text-5xl font-thin tracking-tight text-black mb-16">
                    Frequently Asked Questions
                </h2>

                <div className="max-w-4xl border-t border-black/10">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="border-b border-black/10">
                            <button
                                onClick={() => toggleFAQ(i)}
                                className="w-full py-8 flex items-start justify-between text-left group"
                            >
                                <span className="text-xl md:text-2xl font-light text-black pr-8">
                                    {faq.question}
                                </span>
                                <span className="flex-shrink-0 pt-1">
                                    {openIndex === i ? (
                                        <X className="w-6 h-6 font-thin text-black/60 group-hover:text-black transition-colors" />
                                    ) : (
                                        <Plus className="w-6 h-6 font-thin text-black/60 group-hover:text-black transition-colors" />
                                    )}
                                </span>
                            </button>

                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-lg text-black/60 font-light leading-relaxed pb-8 max-w-2xl">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
