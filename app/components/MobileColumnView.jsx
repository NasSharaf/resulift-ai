"use client";
import React from "react";
import ColumnCard from "./ColumnCard";
import { useSwipe } from "../hooks/useSwipe";

const STEP_LABELS = ["Step 1", "Step 2", "Step 3"];

const MobileColumnView = ({
  leftChildren,
  centerChildren,
  rightChildren,
  currentStep,
  onNext,
  onPrev,
  onDotClick,
}) => {
  const swipeHandlers = useSwipe({
    onSwipeLeft: onNext,
    onSwipeRight: onPrev,
  });

  const panels = [leftChildren, centerChildren, rightChildren];

  return (
    <div className="flex flex-col h-full pb-2">
      {/* Swipe area */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <div
          className="absolute inset-0 flex"
          style={{
            width: "300%",
            transform: `translateX(-${currentStep * (100 / 3)}%)`,
            transition: "transform 300ms ease-in-out",
          }}
          {...swipeHandlers}
        >
          {panels.map((panel, i) => (
            <div key={i} className="h-full" style={{ width: "33.333%" }}>
              <ColumnCard>{panel}</ColumnCard>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-3 py-2">
        {STEP_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            aria-label={`Go to ${label}`}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
              i === currentStep ? "bg-gray-900" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileColumnView;
