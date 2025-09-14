// Assessment Progress Component - Shows progress bar and stats
"use client";

import React from "react";
import clsx from "clsx";
import { FiClock, FiCheckCircle } from "react-icons/fi";

interface AssessmentProgressProps {
  current: number;
  total: number;
  percentComplete: number;
  estimatedTime: number;
  className?: string;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  current,
  total,
  percentComplete,
  estimatedTime,
  className,
}) => {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Progress Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <FiCheckCircle className="h-4 w-4" />
          <span>
            Question <span className="font-semibold text-gray-900">{current}</span> of{" "}
            <span className="font-semibold text-gray-900">{total}</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <FiClock className="h-4 w-4" />
            <span>Est. time remaining: {formatTime(estimatedTime)}</span>
          </div>
          
          <div className="text-blue-600 font-semibold">
            {Math.round(percentComplete)}% Complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        
        {/* Milestone Markers */}
        <div className="absolute top-0 left-0 w-full h-2 flex">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="absolute h-2"
              style={{ left: `${milestone}%` }}
            >
              <div
                className={clsx(
                  "w-0.5 h-2",
                  percentComplete >= milestone ? "bg-blue-600" : "bg-gray-400"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div
          className={clsx(
            "text-center py-1 rounded",
            percentComplete >= 25 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          )}
        >
          Foundation
        </div>
        <div
          className={clsx(
            "text-center py-1 rounded",
            percentComplete >= 50 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          )}
        >
          Core Skills
        </div>
        <div
          className={clsx(
            "text-center py-1 rounded",
            percentComplete >= 75 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
          )}
        >
          Advanced
        </div>
        <div
          className={clsx(
            "text-center py-1 rounded",
            percentComplete >= 100 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          )}
        >
          Complete
        </div>
      </div>
    </div>
  );
};
