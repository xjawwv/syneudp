"use client";

import { DotLottiePlayer } from "@dotlottie/react-player";
import React from "react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const getStatusStyles = () => {
    switch (normalizedStatus) {
      case "running":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "suspended":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "terminated":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "provisioning":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "error":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider shadow-sm border ${getStatusStyles()}`}
    >
      {normalizedStatus === "running" ? (
        <div className="w-4 h-4 -ml-1">
          <DotLottiePlayer
            src="/assets/Dot.lottie"
            autoplay
            loop
          />
        </div>
      ) : (
        <div className={`w-1.5 h-1.5 rounded-full ${normalizedStatus === 'provisioning' ? 'bg-blue-500 animate-pulse' : 'bg-current opacity-50'}`}></div>
      )}
      {status}
    </span>
  );
}
