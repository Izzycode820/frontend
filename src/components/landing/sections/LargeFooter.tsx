"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function LargeFooter() {
    return (
        <footer className="relative z-20 w-full bg-black text-white py-20 border-t border-white/10 min-h-screen flex flex-col justify-center rounded-t-[80px]">
            <div className="container mx-auto px-6 md:px-12 flex flex-col items-center gap-16">

                {/* Large Brand Text */}
                <h1 className="text-[15vw] leading-[0.8] font-bold tracking-tighter opacity-30 select-none text-white/20">
                    HUZILERZ
                </h1>

                <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/10">
                    {/* Links */}
                    <div className="flex gap-6 text-sm font-medium text-white/60">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Cookies</Link>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-8 text-white/60">
                        <Link href="#" className="hover:text-white hover:scale-110 transition-all"><Twitter className="w-6 h-6" /></Link>
                        <Link href="#" className="hover:text-white hover:scale-110 transition-all"><Instagram className="w-6 h-6" /></Link>
                        <Link href="#" className="hover:text-white hover:scale-110 transition-all"><Linkedin className="w-6 h-6" /></Link>
                        <Link href="#" className="hover:text-white hover:scale-110 transition-all"><Github className="w-6 h-6" /></Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
