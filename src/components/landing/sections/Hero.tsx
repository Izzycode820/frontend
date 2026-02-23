"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";
import Link from 'next/link';
import { Header } from "../common";
import { AmoebaBackground } from "./AmoebaBackground";

const ROLES = ["Entrepreneurs", "Solopreneurs", "Hustlers"];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="sticky top-0 z-0 h-screen w-full overflow-hidden">
      {/* 1. BACKGROUND: Oil-in-water Amoeba */}
      <AmoebaBackground />

      {/* 2. FLOATING HEADER */}
      <Header />

      {/* 3. CONTENT CONTAINER (Centered) */}
      <div className="relative z-20 flex h-full flex-col justify-center items-center px-6 md:px-12 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl space-y-8 flex flex-col items-center">
          {/* MAIN HEADLINE */}
          <div className="w-full max-w-6xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-thin leading-[1.1] tracking-tight text-white/90">
              Huzilerz Camp, for all <br className="hidden md:block" />
              <span className="block md:inline relative mt-2 md:mt-0">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROLES[index]}
                    initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(10px)" }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="inline-block italic text-huzilerz-lime"
                  >
                    {ROLES[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </div>

          {/* SLOGAN */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-3xl text-white/80 font-light max-w-2xl tracking-wide"
          >
            Many different ways to start an online business and Scale up your Brand.
          </motion.p>

          {/* CIRCULAR BUTTONS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 pt-8 items-center justify-center"
          >
            {/* Primary Button - Circular/Pill style */}
            <Link 
              href="/auth/signup"
              className="h-16 px-10 bg-white text-black font-medium text-xl rounded-full hover:bg-huzilerz-lime hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center"
            >
              Start Your Empire
            </Link>

            {/* Secondary Button */}
            <button className="h-16 px-10 flex items-center gap-3 border border-white/30 bg-white/5 text-white font-medium text-xl rounded-full hover:bg-white/10 hover:scale-105 transition-all backdrop-blur-md">
              <Play size={20} fill="currentColor" />
              Watch the Vision
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}