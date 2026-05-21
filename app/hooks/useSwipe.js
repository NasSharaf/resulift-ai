import { useRef } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const touchStart = useRef(null);
  return {
    onTouchStart: (e) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    onTouchEnd: (e) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      if (Math.abs(dy) > Math.abs(dx)) return; // vertical scroll wins
      if (dx < -threshold) onSwipeLeft?.();
      if (dx > threshold) onSwipeRight?.();
      touchStart.current = null;
    },
  };
}
