"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { StackedSection } from "../ui/StackedSection";

const TIERS = [
    {
        title: "Start a Hustle",
        description: "Get started with a hustle",
        image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop", // Diverse woman working
        role: "Huzilerz",
    },
    {
        title: "Grow Business",
        description: "Grow into a business",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Diverse team meeting
        role: "Entrepreneurs",
    },
    {
        title: "Scale Up",
        description: "Climb up the scales",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", // Corporate
        role: "Enterprises",
    }
];

export function PricingGallery() {
    return (
        <StackedSection title="Pricing & Plans" color="bg-[#dcfce7]" index={0} className="rounded-t-none">
            {/* bg-lime-100 equivalent */}

            <div className="flex flex-col h-full px-6 md:px-12 py-8 max-w-7xl mx-auto">

                {/* Header - Left Aligned & Compact */}
                <div className="mb-8 md:mb-12 w-full">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal text-black leading-[1.1] tracking-tight max-w-5xl text-left">
                        Build for everyone from <span className="italic font-serif text-emerald-700">huzilerz</span> to upcoming <span className="italic font-serif text-teal-700">entrepreneurs</span> to <span className="italic font-serif text-blue-700">enterprises</span>.
                    </h2>
                </div>

                {/* Gallery Grid - Fits remaining space */}
                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
                    {TIERS.map((tier, i) => (
                        <div key={i} className="group relative flex flex-col w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                            {/* Image Background */}
                            <div className="absolute inset-0">
                                <img src={tier.image} alt={tier.role} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            </div>

                            {/* Content - Bottom aligned */}
                            <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
                                <span className="text-xs font-bold uppercase tracking-widest mb-1 opacity-90">{tier.role}</span>
                                <h3 className="text-2xl md:text-3xl font-medium leading-none">{tier.description}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button - Compact */}
                <div className="flex justify-start pb-8 shrink-0">
                    <Link href="/billing" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-lg rounded-full overflow-hidden transition-all hover:bg-huzilerz-black">
                        <span className="relative z-10 font-medium">View All Plans</span>
                        <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

            </div>
        </StackedSection>
    );
}
