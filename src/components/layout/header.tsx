"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";
import { NotificationsPopover } from "./notifications-popover";
import { cn } from "@/lib/cn";

export interface HeaderProps {
  user?: any;
  className?: string;
}

export function Header({
  user,
  className,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      setIsScrolled(scrollY > 20);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-out",
        isScrolled 
          ? "bg-transparent backdrop-blur-none border-transparent pointer-events-none pt-2 sm:pt-2.5 pb-1" 
          : "border-b border-[var(--border)]/80 bg-white/95 backdrop-blur-xl shadow-2xs pointer-events-auto",
        className
      )}
    >
      <div 
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-300 ease-out",
          isScrolled 
            ? "h-13 sm:h-14 w-[92%] sm:w-[95%] max-w-[840px] rounded-full border border-[var(--border)]/80 bg-white/95 backdrop-blur-2xl shadow-[0_12px_36px_rgba(20,10,15,0.14)] px-4 sm:px-6 pointer-events-auto" 
            : "h-16 w-full max-w-[1600px] rounded-none border-transparent bg-transparent px-4 sm:px-6 lg:px-8 xl:px-10 pointer-events-auto"
        )}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-4 transition-transform duration-300">
          <Logo href="/app" blurredBg={!isScrolled} />
        </div>

        {/* Right Action Icons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 transition-transform duration-300">
          <NotificationsPopover />
          {/* User Profile Menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
