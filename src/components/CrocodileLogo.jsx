import React from "react";
import { useTheme } from "../context/ThemeContext";

export function CrocodileLogo({ size = "md", className = "", withText = false, subtitle = "" }) {
  const { isDark } = useTheme();

  // Size mapping
  const sizeMap = {
    xs: { icon: 20, text: "text-sm", sub: "text-[10px]" },
    sm: { icon: 24, text: "text-base", sub: "text-[10px]" },
    md: { icon: 32, text: "text-lg", sub: "text-xs" },
    lg: { icon: 42, text: "text-xl", sub: "text-xs" },
    xl: { icon: 54, text: "text-2xl", sub: "text-sm" },
  };

  const currentSize = typeof size === "string" ? (sizeMap[size] || sizeMap.md) : { icon: size, text: "text-base", sub: "text-xs" };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Modern Geometric Crocodile Mascot SVG */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            {/* Dark Mode Gradient: Neon Emerald to Electric Cyan */}
            <linearGradient id="crocDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#d3ff00" />
            </linearGradient>

            {/* Light Mode Gradient: Deep Luxury Emerald to Midnight Teal */}
            <linearGradient id="crocLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="50%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Eye Glow Filter */}
            <filter id="crocGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Crocodile Silhouette & Angular Armor Plates */}
          {/* Main Head Base */}
          <path
            d="M8 58 L24 38 L54 30 L84 38 L94 48 L86 56 L64 56 L46 64 L22 66 Z"
            fill={isDark ? "url(#crocDarkGrad)" : "url(#crocLightGrad)"}
            fillOpacity={isDark ? "0.95" : "1"}
          />

          {/* Powerful Upper Snout Ridge */}
          <path
            d="M54 30 L66 22 L76 26 L84 38 L68 40 Z"
            fill={isDark ? "#34d399" : "#047857"}
          />

          {/* Crest Scutes (Dorsal Scales) */}
          <path
            d="M24 38 L20 28 L32 34 L38 24 L48 31 L54 30 Z"
            fill={isDark ? "#10b981" : "#065f46"}
          />

          {/* Lower Jaw Section */}
          <path
            d="M46 64 L64 56 L86 56 L80 68 L58 72 L32 72 Z"
            fill={isDark ? "url(#crocDarkGrad)" : "url(#crocLightGrad)"}
            fillOpacity="0.85"
          />

          {/* Sharp Jaw Teeth Accents */}
          <polygon points="66,56 70,52 74,56" fill={isDark ? "#ffffff" : "#f3f4f6"} />
          <polygon points="76,56 80,52 84,56" fill={isDark ? "#ffffff" : "#f3f4f6"} />
          <polygon points="56,58 60,63 64,58" fill={isDark ? "#ffffff" : "#f3f4f6"} />

          {/* Reptilian Intelligent Eye */}
          <circle
            cx="48"
            cy="40"
            r="4.5"
            fill={isDark ? "#d3ff00" : "#fbbf24"}
            filter={isDark ? "url(#crocGlow)" : undefined}
          />
          <ellipse cx="48" cy="40" rx="1.5" ry="3.5" fill={isDark ? "#0f172a" : "#1e293b"} />

          {/* Modern Geometric Accent Lines */}
          <path
            d="M28 48 L46 48 L56 42"
            stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.3)"}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Optional Brand Text */}
      {withText && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight leading-none ${currentSize.text} text-text-primary`}>
            <span className="text-cherry dark:text-lime font-black">HR RAG</span>{" "}
            <span className="text-text-primary">Assistant</span>
          </div>
          {subtitle && (
            <span className={`text-text-secondary font-medium tracking-wide mt-0.5 ${currentSize.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
