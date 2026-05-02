"use client";

import React, { FC } from "react";
import {
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useThreadRuntime,
} from "@assistant-ui/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownText = ({ text }: { text: string }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
};
import { ArrowUpIcon } from "@radix-ui/react-icons";
import { MorphingBubble } from "./MorphingBubble";
import { PromptCapsule } from "./PromptCapsule";
import { WorkmanToolRegistry } from "../../workman-ui/tool-registry";

export const WorkmanGuestChatUI: FC = () => {
  const runtime = useThreadRuntime();

  const handlePromptClick = (text: string) => {
    runtime.append({
      role: "user",
      content: [{ type: "text", text }],
    });
  };

  return (
    <ThreadPrimitive.Root className="relative flex h-screen w-full flex-col items-center bg-[#050505] text-white overflow-hidden">
      {/* 1. Optimized background bubble with minimal CSS recalculations */}
      <MorphingBubble />
      
      {/* 2. Main Scrolling Viewport */}
      <ThreadPrimitive.Viewport className="z-10 flex w-full max-w-4xl grow flex-col gap-8 overflow-y-auto overflow-x-hidden pt-12 md:pt-24 px-4 scrollbar-hide">
        
        {/* Dynamic Empty State for Landing */}
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <div className="flex flex-col items-center justify-center mt-8 md:mt-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 text-center px-4">
              Hey, I am Workman.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-light text-center px-4">
              Your conversational online store assistant.
            </p>
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl mt-12 px-2">
              <PromptCapsule label="How to make money online?" onClick={handlePromptClick} />
              <PromptCapsule label="How to start my brand in Cameroon?" onClick={handlePromptClick} />
              <PromptCapsule label="How to start an online business?" onClick={handlePromptClick} />
              <PromptCapsule label="How to convert my physical store?" onClick={handlePromptClick} />
            </div>
          </div>
        </AuiIf>

        <ThreadPrimitive.Messages>
          {({ message }) => {
            if (message.role === "user") return <UserMessage />;
            return <AssistantMessage />;
          }}
        </ThreadPrimitive.Messages>

        {/* 3. Composer without extreme backdrop-blur to heavily optimize scrolling fps */}
        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mx-auto mt-auto flex w-full max-w-3xl flex-col gap-4 overflow-visible bg-transparent pb-6 pt-4">
          
          <ComposerPrimitive.Root className="w-full flex items-end rounded-[2rem] border border-white/10 bg-[#141414] transition-all focus-within:border-white/30 focus-within:bg-[#1a1a1a] shadow-2xl pr-2">
            
            <ComposerPrimitive.Input
              placeholder="Ask Workman anything..."
              className="flex-grow max-h-40 resize-none bg-transparent py-4 pl-6 text-white text-[15px] font-light outline-none placeholder:text-gray-500 disabled:opacity-50"
            />
            
            <AuiIf condition={(s) => !s.thread.isRunning}>
              <ComposerPrimitive.Send className="m-2 flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-black transition-opacity hover:opacity-80 disabled:opacity-20 disabled:bg-white/20 disabled:text-white pointer-events-auto">
                <ArrowUpIcon className="size-5" />
              </ComposerPrimitive.Send>
            </AuiIf>
            
            <AuiIf condition={(s) => s.thread.isRunning}>
              <ComposerPrimitive.Cancel className="m-2 flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80">
                <div className="size-3 bg-black rounded-sm animate-pulse" />
              </ComposerPrimitive.Cancel>
            </AuiIf>
            
          </ComposerPrimitive.Root>
          
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};


const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative mx-auto flex w-full max-w-3xl flex-col items-end gap-1 mb-2">
      <div className="flex items-start gap-4">
        {/* Adjusted Glassmorphism: Reduced blur intensity for 60fps scrolling lock */}
        <div className="rounded-3xl rounded-br-md bg-white/10 border border-white/5 backdrop-blur-sm px-6 py-3 text-white shadow-lg text-[15px] md:text-base leading-relaxed">
          <MessagePrimitive.Parts />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="relative mx-auto flex w-full max-w-3xl gap-4 mb-4">
      {/* Bot Avatar */}
      <div className="flex size-8 mt-1 shrink-0 items-center justify-center rounded-full border border-white/10 shadow-lg text-[10px] sm:text-xs font-bold text-white bg-[#222]">
        W
      </div>

      <div className="flex-1 w-full pt-1 overflow-visible">
        {/* 4. FREE FLOWING MARKDOWN TEXT - No Bubble! Hardcoded styling hierarchy so no Tailwind typography plugin is needed */}
        <div className="text-gray-200 text-[15px] md:text-base leading-relaxed font-light w-full 
          [&_p]:mb-4 last:[&_p]:mb-0 
          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-white 
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-white 
          [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:text-white 
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 
          [&_strong]:font-semibold [&_strong]:text-white
          [&_a]:text-blue-400 [&_a]:underline
          [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md"
        >
          <MessagePrimitive.Content components={{ Text: MarkdownText, tools: WorkmanToolRegistry }} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};
