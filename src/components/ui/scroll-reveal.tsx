'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  animationClass?: string;
  staggerClass?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function ScrollReveal({
  children,
  className,
  animationClass = 'animate-content-appear',
  staggerClass,
  threshold = 0.1,
  triggerOnce = true,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px', // trigger slightly before it comes into view fully, or adjust as needed. 
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold, triggerOnce]);

  return (
    <div
      ref={ref}
      className={cn(
        className,
        isVisible ? cn(animationClass, staggerClass) : 'opacity-0'
      )}
      {...props}
    >
      {children}
    </div>
  );
}
