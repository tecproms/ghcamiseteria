import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withSubtitle?: boolean;
}

export function Logo({ className = "", size = "md", withSubtitle = true }: LogoProps) {
  const sizeMap = {
    sm: "h-9",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Golden Fan / Crown Crest Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]}`}>
        <svg
          viewBox="0 0 100 100"
          className="h-full w-auto aspect-square drop-shadow-[0_2px_12px_rgba(229,169,60,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE08A" />
              <stop offset="45%" stopColor="#E5A93C" />
              <stop offset="85%" stopColor="#B3781A" />
              <stop offset="100%" stopColor="#784B0A" />
            </linearGradient>
            <linearGradient id="goldLight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D49024" />
              <stop offset="60%" stopColor="#FBD576" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>
          </defs>

          {/* Radiating Fan Petals */}
          <path
            d="M50 78 C35 70 20 58 16 38 C15 32 20 28 25 32 C32 38 42 55 50 78 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M50 78 C38 62 25 42 28 24 C29 18 36 17 40 22 C45 31 48 52 50 78 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M50 78 C44 58 38 32 46 16 C48 11 56 12 58 18 C60 28 56 50 50 78 Z"
            fill="url(#goldLight)"
          />
          <path
            d="M50 78 C52 52 56 26 68 15 C72 11 79 16 78 22 C74 34 62 56 50 78 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M50 78 C58 58 72 36 84 30 C90 27 94 34 90 39 C80 50 64 66 50 78 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M50 78 C65 68 82 54 94 50 C100 48 101 56 97 60 C86 68 70 74 50 78 Z"
            fill="url(#goldGrad)"
          />

          {/* Central GH Monogram Overlay */}
          <circle cx="50" cy="72" r="22" fill="#0C0D12" stroke="url(#goldGrad)" strokeWidth="2.5" />
          <text
            x="50"
            y="79"
            textAnchor="middle"
            fill="url(#goldLight)"
            fontWeight="900"
            fontSize="18"
            fontFamily="system-ui, sans-serif"
            letterSpacing="-0.5"
          >
            GH
          </text>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            GH
          </span>
          <span className="text-xl sm:text-2xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent font-sans">
            CAMISETERIA
          </span>
        </div>
        {withSubtitle && (
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.26em] uppercase text-amber-400/90 mt-1 pl-0.5">
            UNIFORMES EM GERAL
          </span>
        )}
      </div>
    </div>
  );
}
