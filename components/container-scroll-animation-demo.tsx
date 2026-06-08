"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden bg-transparent">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-3xl md:text-5xl font-semibold text-zinc-100 font-display">
              La piattaforma che <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-2 leading-none text-zinc-100 bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-200 bg-clip-text text-transparent">
                Vinci Appalti
              </span>
            </h1>
          </>
        }
      >
        <img
          src="/localhost_3000_dashboard%20(1).png"
          alt="TenderFlow Dashboard - Real-time tender management"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl object-cover w-full h-full object-left-top shadow-2xl"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
