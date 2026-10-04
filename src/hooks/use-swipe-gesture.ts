import { useState, useCallback, useRef } from 'react';

interface SwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeCancel?: () => void;
  onTap?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  enabled?: boolean;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeCancel,
  onTap,
  threshold = 120,
  velocityThreshold = 0.5,
  enabled = true,
}: SwipeGestureProps = {}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTime = useRef(0);
  const velocity = useRef({ x: 0, y: 0 });
  const isHorizontalLock = useRef(false);
  const isVerticalLock = useRef(false);

  const resetState = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setIsAnimatingOut(false);
    setSwipeDirection(null);
    isHorizontalLock.current = false;
    isVerticalLock.current = false;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || isAnimatingOut) return;
    
    // Ignore multi-touch or right clicks
    if (!e.isPrimary || e.button !== 0) return;

    // Do NOT capture pointer or initiate drag if touching interactive controls
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) {
      return;
    }

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    lastPos.current = { x: e.clientX, y: e.clientY };
    lastTime.current = performance.now();
    velocity.current = { x: 0, y: 0 };
    isHorizontalLock.current = false;
    isVerticalLock.current = false;
  }, [enabled, isAnimatingOut]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isAnimatingOut) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    const currentTime = performance.now();
    
    const deltaX = currentPos.x - startPos.current.x;
    const deltaY = currentPos.y - startPos.current.y;

    // Lock direction on initial movement
    if (!isHorizontalLock.current && !isVerticalLock.current) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
          isHorizontalLock.current = true;
        } else {
          isVerticalLock.current = true;
        }
      }
    }

    if (isVerticalLock.current) {
      // Yield to vertical scrolling
      return;
    }

    if (isHorizontalLock.current) {
      const dt = currentTime - lastTime.current;
      if (dt > 0) {
        velocity.current.x = (currentPos.x - lastPos.current.x) / dt;
        velocity.current.y = (currentPos.y - lastPos.current.y) / dt;
      }

      setDragOffset({ x: deltaX, y: deltaY });
      lastPos.current = currentPos;
      lastTime.current = currentTime;
    }
  }, [isDragging, isAnimatingOut]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || isAnimatingOut) return;

    try {
      if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    setIsDragging(false);

    const deltaX = Math.abs(e.clientX - startPos.current.x);
    const deltaY = Math.abs(e.clientY - startPos.current.y);

    // If movement is negligible and no horizontal lock, it was a tap
    if (!isHorizontalLock.current && deltaX < 15 && deltaY < 15) {
      resetState();
      onTap?.();
      return;
    }

    if (!isHorizontalLock.current) {
      // Was a vertical scroll gesture
      resetState();
      return;
    }

    const absX = Math.abs(dragOffset.x);
    const absVelocityX = Math.abs(velocity.current.x);
    const isFlick = absVelocityX > velocityThreshold && absX > 40;
    const isPastThreshold = absX > threshold;

    if (isPastThreshold || isFlick) {
      // Commit swipe
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setIsAnimatingOut(true);
      
      // Animate off screen
      setDragOffset({
        x: direction === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2,
        y: dragOffset.y + velocity.current.y * 200 // Continue trajectory slightly
      });

      // Wait for animation to finish before calling handler
      setTimeout(() => {
        if (direction === 'right') {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
        resetState();
      }, 250); // Matches CSS transition duration
    } else {
      // Cancel swipe
      setDragOffset({ x: 0, y: 0 });
      onSwipeCancel?.();
    }
  }, [isDragging, isAnimatingOut, dragOffset, threshold, velocityThreshold, onSwipeRight, onSwipeLeft, onSwipeCancel, resetState]);

  const onPointerCancel = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    onSwipeCancel?.();
  }, [isDragging, onSwipeCancel]);

  // Programmatic swipe triggers (e.g. for buttons)
  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimatingOut) return;
    
    setSwipeDirection(direction);
    setIsAnimatingOut(true);
    
    setDragOffset({
      x: direction === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2,
      y: 0
    });

    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
      resetState();
    }, 250);
  }, [isAnimatingOut, onSwipeRight, onSwipeLeft, resetState]);

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
    dragOffset,
    isDragging,
    isAnimatingOut,
    swipeDirection,
    triggerSwipe
  };
}
