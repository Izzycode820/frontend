import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const HUSTLES = [
    {
        title: "Digital Products",
        description: "Sell e-books, templates, or courses. Low overhead, high margin."
    },
    {
        title: "Affiliate Marketing",
        description: "Promote products you love and earn a commission on every sale."
    },
    {
        title: "Print on Demand",
        description: "Custom designs on t-shirts, mugs, and more. No inventory needed."
    },
    {
        title: "Freelancing",
        description: "Offer your skills as a service. Writing, design, coding, and more."
    },
    {
        title: "Content Creation",
        description: "Build an audience on YouTube or TikTok and monetize through ads."
    }
];

export default function StageInspiration() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % HUSTLES.length);
        }, 4000); // Change every 4 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full min-h-screen flex items-center justify-center p-6 md:p-20 bg-[#Fdfbf7] dark:bg-zinc-950 overflow-hidden">

            {/* Header Area */}
            <div className="absolute top-10 left-6 md:top-12 md:left-12 z-20 w-full pointer-events-none">
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-thin tracking-tight text-black dark:text-white leading-none">
                    Choose from the <span className="font-normal font-serif text-amber-700 italic">different hustles</span> we offer
                </h2>
            </div>

            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center mt-32">

                {/* LEFT: Text Content - Synced with Card */}
                <div className="flex flex-col justify-center min-h-[200px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-4"
                        >
                            <span className="text-sm font-bold text-black/40 uppercase tracking-widest">
                                Option {index + 1} of {HUSTLES.length}
                            </span>
                            <h3 className="text-4xl md:text-5xl font-medium text-black dark:text-white">
                                {HUSTLES[index].title}
                            </h3>
                            <p className="text-xl md:text-2xl font-light text-black/60 dark:text-zinc-400 max-w-md leading-relaxed">
                                {HUSTLES[index].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* RIGHT: Card Deck Animation */}
                <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center perspective-1000">
                    <AnimatePresence mode="popLayout">
                        {HUSTLES.map((hustle, i) => {
                            const isCurrent = i === index;
                            const isNext = i === (index + 1) % HUSTLES.length;

                            if (!isCurrent && !isNext) return null;

                            return (
                                <motion.div
                                    key={hustle.title}
                                    layout
                                    initial={isCurrent
                                        ? { scale: 0.95, opacity: 0, z: -50 }
                                        : { scale: 0.85, opacity: 0, z: -100 }
                                    }
                                    animate={isCurrent
                                        ? { scale: 1, opacity: 1, z: 0, y: 0 }
                                        : { scale: 0.9, opacity: 0.5, z: -50, y: -30 }
                                    }
                                    exit={{
                                        scale: 1.1,
                                        opacity: 0,
                                        zIndex: 0,
                                        transition: { duration: 0.5 }
                                    }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                    className={`absolute w-[400px] md:w-[600px] aspect-video rounded-3xl shadow-2xl overflow-hidden border-4 border-white ${isCurrent ? 'z-20' : 'z-10'}`}
                                >
                                    <Image
                                        src="/landing/vector/dropshipping-large.jpg"
                                        alt={hustle.title}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8">
                                        <p className="text-white font-medium text-2xl tracking-wide">{hustle.title}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

            </div>
        </section>
    );
}
