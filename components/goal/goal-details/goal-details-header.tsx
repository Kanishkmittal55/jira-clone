"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BiX } from "react-icons/bi";
import { type Goal } from "@prisma/client";

const GoalDetailsHeader: React.FC<{
  goal: Goal;
  setGoalId: React.Dispatch<React.SetStateAction<Goal["id"] | null>>;
  isInViewport: boolean;
}> = ({ goal, setGoalId, isInViewport }) => {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between bg-white py-3">
      <div className="flex items-center gap-x-2">
        <span className="text-sm text-gray-500">Goal #{goal.id.slice(0, 8)}</span>
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
          {goal.channel}
        </span>
      </div>
      <Button
        onClick={() => setGoalId(null)}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <BiX className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { GoalDetailsHeader };
