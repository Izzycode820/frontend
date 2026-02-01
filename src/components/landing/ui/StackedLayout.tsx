import { cn } from "@/lib/utils";
import React from "react";

interface StackedLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function StackedLayout({ children, className }: StackedLayoutProps) {
    return (
        // Removed mb-[100vh] since FooterHero is no longer fixed/revealed.
        // Removed bg-white so the rounded corners of children reveal the content behind (BrandSection).
        <div className={cn("relative z-10 w-full shadow-[0_40px_60px_-15px_rgba(0,0,0,0.5)]", className)}>
            {children}
            {/* 
                "Push Pause" Spacer: 
                Extends the height of the stack with a white background.
                This allows the user to scroll for a bit (pausing on the last card)
                before the next section physically pushes the stack up.
            */}
            <div className="w-full h-[40vh] bg-white" />
        </div>
    );
}
