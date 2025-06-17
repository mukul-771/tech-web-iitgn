"use client";
import React from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { Mail, MapPin } from "lucide-react";

export function ContactHero() {
  return (
    <div className="h-[500px] relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
      
      <div className="relative z-20 text-center space-y-6 px-4">
        <h1 className={cn("md:text-5xl text-3xl font-bold text-white font-space-grotesk")}>
          Get In <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
        </h1>
        <p className="text-center mt-2 text-neutral-300 max-w-2xl mx-auto text-lg">
          Connect with the Technical Council of IIT Gandhinagar. We're here to help, collaborate, and innovate together.
        </p>
        
        {/* Quick Contact Info */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
          <div className="flex items-center gap-2 text-blue-400">
            <Mail className="h-5 w-5" />
            <span className="text-sm">technical.secretary@iitgn.ac.in</span>
          </div>
          
          <div className="flex items-center gap-2 text-purple-400">
            <MapPin className="h-5 w-5" />
            <span className="text-sm">IIT Gandhinagar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
