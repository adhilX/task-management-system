"use client";

import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine initial theme on client mount
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    
    const initialTheme = savedTheme || (systemPrefersLight ? "light" : "dark");
    setTheme(initialTheme);
    
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    
    setMounted(true);
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLInputElement>) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const doc = document as any;

    if (!doc.startViewTransition) {
      setTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      setTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    });

    transition.ready.then(() => {
      // Create expanding glow drop shadow ripple
      const ripple = document.createElement("div");
      ripple.style.position = "fixed";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.style.width = "2px";
      ripple.style.height = "2px";
      ripple.style.borderRadius = "50%";
      ripple.style.pointerEvents = "none";
      ripple.style.zIndex = "999999";
      
      // Dynamic drop shadow colors based on the theme being switched to
      ripple.style.boxShadow =
        nextTheme === "light"
          ? "0 0 50px 25px rgba(99, 102, 241, 0.5), 0 0 100px 50px rgba(168, 85, 247, 0.25)"
          : "0 0 50px 25px rgba(168, 85, 247, 0.5), 0 0 100px 50px rgba(99, 102, 241, 0.25)";
      ripple.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      
      document.body.appendChild(ripple);

      const anim = ripple.animate(
        [
          { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
          { transform: `translate(-50%, -50%) scale(${endRadius})`, opacity: 0 }
        ],
        {
          duration: 600,
          easing: "ease-in-out"
        }
      );

      anim.onfinish = () => {
        ripple.remove();
      };

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  if (!mounted) {
    return <div className="w-24 h-8" />; // Placeholder to prevent layout shift
  }

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      {/* Moon Icon (Dark Mode Indicator) */}
      <svg
        className={`w-4 h-4 transition-colors duration-300 ${
          theme === "dark" ? "text-indigo-400" : "text-slate-500"
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>

      {/* iOS Toggle Switch */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={theme === "light"}
          onClick={toggleTheme}
          onChange={() => {}}
          className="sr-only peer"
          aria-label="Toggle Theme"
        />
        {/* Switch track */}
        <div className="w-11 h-6 bg-slate-950 border border-slate-850 rounded-full transition-all duration-300 peer-focus:outline-none peer-checked:bg-indigo-600 peer-checked:border-indigo-500"></div>
        {/* Switch knob */}
        <div className="absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-slate-400 border border-slate-700 rounded-full transition-all duration-300 peer-checked:translate-x-[20px] peer-checked:bg-white peer-checked:border-white"></div>
      </label>

      {/* Sun Icon (Light Mode Indicator) */}
      <svg
        className={`w-4.5 h-4.5 transition-colors duration-300 ${
          theme === "light" ? "text-amber-400" : "text-slate-500"
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
        <path
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707"
        />
      </svg>
    </div>
  );
}
