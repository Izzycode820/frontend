import React from 'react';

export const MorphingBubble = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
      <style>
        {`
          @keyframes morph {
            0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
            50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg) translateZ(0); }
            100% { transform: rotate(360deg) translateZ(0); }
          }
          .blob-1 {
            animation: morph 12s ease-in-out infinite, spin-slow 20s linear infinite;
            will-change: width, height, border-radius, transform;
          }
          .blob-2 {
            animation: morph 15s ease-in-out infinite reverse, spin-slow 25s linear infinite reverse;
            will-change: width, height, border-radius, transform;
          }
        `}
      </style>
      
      {/* 
        CRITICAL PERFORMANCE OPTIMIZATIONS 
        - Removed mix-blend-screen (expensive rendering on overlapping divs)
        - Reduced intense blur parameters (switched from tailwind abstract blur to specific px or soft dropshadow logic)
        - Added translateZ(0) to force GPU composite layer
      */}
      <div 
        className="blob-1 absolute w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/10 to-purple-600/10 blur-[80px]"
      />
      <div 
        className="blob-2 absolute w-[500px] h-[500px] bg-gradient-to-bl from-cyan-500/10 to-emerald-500/10 blur-[80px]"
      />
    </div>
  );
};
