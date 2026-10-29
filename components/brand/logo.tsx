import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withSubtitle?: boolean;
}

export function Logo({ className = "", size = "md", withSubtitle = true }: LogoProps) {
  const sizeMap = {
    sm: "h-10 w-auto",
    md: "h-14 w-auto",
    lg: "h-20 w-auto",
    xl: "h-28 w-auto",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${sizeMap[size]} flex items-center shrink-0`}>
        <Image
          src="/images/brand/logo-gh.png"
          alt="GH Camiseteria - Uniformes em Geral"
          width={625}
          height={465}
          priority
          className="h-full w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.35)]"
        />
      </div>
    </div>
  );
}
