import React from 'react';
import { IconHeart } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

interface PageLoaderProps {
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function PageLoader({ className, text = "Loading...", fullScreen = false }: PageLoaderProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-5",
        fullScreen ? "fixed inset-0 z-50 bg-[var(--background)]" : "min-h-[400px] w-full",
        className
      )}
    >
      <div className="relative flex items-center justify-center h-16 w-16">
        {/* Outer pulsing glow */}
        <div 
          className="absolute inset-0 rounded-full bg-[var(--primary)]/20 animate-ping" 
          style={{ animationDuration: '2s' }} 
        />
        
        {/* Inner spinner ring */}
        <div 
          className="absolute -inset-2 rounded-full border-2 border-transparent border-t-[var(--primary)] border-r-[var(--primary)]/40 animate-spin" 
          style={{ animationDuration: '1.2s' }} 
        />
        
        {/* Center Heart Icon */}
        <div className="h-12 w-12 rounded-full bg-white/80 backdrop-blur-md border border-[var(--primary)]/10 shadow-[0_4px_12px_var(--primary-shadow)] flex items-center justify-center relative z-10">
          <IconHeart className="h-5 w-5 text-[var(--primary)]" fill="currentColor" />
        </div>
      </div>
      
      {text && (
        <span className="text-sm font-medium tracking-wide text-[var(--muted)] animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
