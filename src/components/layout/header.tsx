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
      setIsScrolled(window.scrollY > 40);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isScrolled 
          ? "bg-transparent backdrop-blur-none border-transparent pointer-events-none" 
          : "border-b border-[var(--border)]/80 bg-white/95 backdrop-blur-xl shadow-2xs pointer-events-auto",
        className
      )}
    >
      <div 
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled 
            ? "h-14 w-[95%] max-w-[800px] translate-y-3 rounded-full border border-white/40 bg-white/75 backdrop-blur-2xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] px-5 sm:px-8 pointer-events-auto" 
            : "h-16 w-full max-w-[1600px] translate-y-0 rounded-none border-transparent bg-transparent px-4 sm:px-6 lg:px-8 xl:px-10 pointer-events-auto"
        )}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-4 transition-transform duration-500">
          <Logo href="/app" />
        </div>

        {/* Right Action Icons & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 transition-transform duration-500">
          <NotificationsPopover />
          {/* User Profile Menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
