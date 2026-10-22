import { useState, useCallback, useRef, useEffect } from 'react';

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
  threshold = 75,
  velocityThreshold = 0.25,
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
  const dragOccurredRef = useRef(false);
  const currentTargetRef = useRef<HTMLElement | null>(null);
  const animTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) {
        clearTimeout(animTimeoutRef.current);
      }
    };
  }, []);

  const resetState = useCallback(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setIsAnimatingOut(false);
    setSwipeDirection(null);
    isHorizontalLock.current = false;
    isVerticalLock.current = false;
    dragOccurredRef.current = false;
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || isAnimatingOut) return;
    
    // Ignore multi-touch or right clicks
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;

    // Do NOT capture pointer or initiate drag if touching interactive controls
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea, [data-prevent-swipe]')) {
      return;
    }

    const targetEl = e.currentTarget;
    currentTargetRef.current = targetEl;

    try {
      targetEl.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    
    dragOccurredRef.current = false;
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
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > 6 || absY > 6) {
      dragOccurredRef.current = true;
    }

    // Direction locking: lock horizontal once movement starts or horizontal >= vertical
    if (!isHorizontalLock.current && !isVerticalLock.current) {
      if (absX > 6 || absY > 6) {
        if (absX >= absY * 0.75) {
          isHorizontalLock.current = true;
        } else if (absY > 25 && absX < 8) {
          isVerticalLock.current = true;
        }
      }
    }

    if (isVerticalLock.current) {
      // Yield to vertical page scrolling
      return;
    }

    if (isHorizontalLock.current || absX > 8) {
      isHorizontalLock.current = true;
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
      if (currentTargetRef.current?.hasPointerCapture?.(e.pointerId)) {
        currentTargetRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    setIsDragging(false);

    const deltaX = Math.abs(e.clientX - startPos.current.x);
    const deltaY = Math.abs(e.clientY - startPos.current.y);

    // If movement is negligible and no drag occurred, it was a tap
    if (!dragOccurredRef.current && deltaX < 12 && deltaY < 12) {
      resetState();
      onTap?.();
      return;
    }

    const absX = Math.abs(dragOffset.x);
    const absVelocityX = Math.abs(velocity.current.x);
    const isFlick = absVelocityX > velocityThreshold && absX > 30;
    const isPastThreshold = absX > threshold;

    if (isPastThreshold || isFlick) {
      // Commit swipe
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setIsAnimatingOut(true);
      
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 500;
      // Animate off screen with generous clearance
      setDragOffset({
        x: direction === 'right' ? screenW * 1.4 : -screenW * 1.4,
        y: dragOffset.y + velocity.current.y * 150
      });

      // Wait for CSS transition to finish before triggering handler.
      // Do NOT call resetState() here: the card stays off-screen until unmounted by the parent.
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = setTimeout(() => {
        if (direction === 'right') {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }, 250); // Matches CSS transition duration
    } else {
      // Cancel swipe - return smoothly to center
      setDragOffset({ x: 0, y: 0 });
      onSwipeCancel?.();
    }
  }, [isDragging, isAnimatingOut, dragOffset, threshold, velocityThreshold, onSwipeRight, onSwipeLeft, onSwipeCancel, onTap, resetState]);

  const onPointerCancel = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    onSwipeCancel?.();
  }, [isDragging, onSwipeCancel]);

  // Programmatic swipe triggers (e.g. for action buttons)
  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimatingOut) return;
    
    setSwipeDirection(direction);
    setIsAnimatingOut(true);
    
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 500;
    setDragOffset({
      x: direction === 'right' ? screenW * 1.4 : -screenW * 1.4,
      y: 0
    });

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }, 250);
  }, [isAnimatingOut, onSwipeRight, onSwipeLeft]);

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
    triggerSwipe,
    dragOccurred: dragOccurredRef.current,
  };
}
