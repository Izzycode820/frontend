"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface StackedSectionProps {
    children: React.ReactNode;
    title: string;
    color: string; // e.g. "bg-lime-100"
    className?: string;
    index: number;
}

export function StackedSection({ children, title, color, className, index }: StackedSectionProps) {
    return (
        <div
            className={cn(
                "sticky top-0 h-screen w-full flex flex-col overflow-hidden rounded-t-[40px] shadow-negative",
                color,
                className
            )}
            style={{ top: index * 80 }} // Increased to 80px so headers are fully visible (not cut off)
        >
            <div className="w-full px-6 md:px-12 py-6 border-b border-black/5 flex items-center justify-between">
                <span className="text-xl font-medium tracking-wide text-black/40 uppercase">{title}</span>
                {/* Decorative "Tab" look or number */}
                <span className="text-sm font-bold text-black/20">0{index + 1}</span>
            </div>

            {/* Removed overflow-y-auto to avoid internal scroll. Content must fit or be handled by parent. */}
            <div className="flex-1 w-full h-full overflow-hidden">
                {children}
            </div>
        </div>
    );
}
