"use client";

import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import StageFashion from "./StageFashion";
import StageDropshipping from "./StageDropshipping";
import StageInspiration from "./StageInspiration";

import SectionFashion from "./StageFashion";
import SectionDropshipping from "./StageDropshipping";
import SectionInspiration from "./StageInspiration";

export default function ScrollyJourney() {
    return (
        <div className="w-full bg-white dark:bg-black">
            <SectionFashion />
            <SectionDropshipping />
            <SectionInspiration />
        </div>
    );
}
