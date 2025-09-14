"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BiBullseye } from "react-icons/bi";
import clsx from "clsx";
import { useGoals } from "@/hooks/query-hooks/use-goals";
import { useSelectedGoalContext } from "@/context/use-selected-goal-context";

const PlannerGoals: React.FC<{ className?: string }> = ({ className }) => {
  const { goals, isLoading } = useGoals();
  const { goalId, setGoalId } = useSelectedGoalContext();

  const handleGeneratePlan = (goalId: string) => {
    console.log("Generating plan for goal:", goalId);
  };

  const handleUnderstandGoal = (goalId: string) => {
    console.log("Understanding goal:", goalId);
  };

  return (
    <div className={clsx("flex flex-col h-full w-full", className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Project Goals</h2>
      </div>

      {/* Goals List - Full Width */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading goals...</div>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600">Create your first goal to get started!</p>
            </div>
          </div>
        ) : (
          goals.map((goal) => (
            <div 
              key={goal.id} 
              role="button"
              data-state={goalId === goal.id ? "selected" : "not-selected"}
              onClick={() => setGoalId(goal.id)}
              className={clsx(
                "w-full p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow cursor-pointer",
                "[&[data-state=selected]]:bg-blue-100 [&[data-state=selected]]:border-blue-300"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{goal.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{goal.description || "No description provided"}</p>
                </div>
                <div className="flex gap-x-2 ml-4">
                  <span className={clsx("px-2 py-1 text-xs rounded-full", "bg-blue-100 text-blue-600")}>
                    {goal.channel}
                  </span>
                  <span className={clsx("px-2 py-1 text-xs rounded-full", "bg-green-100 text-green-600")}>
                    READY
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2 text-sm text-gray-500">
                  <BiBullseye className="h-4 w-4" />
                  <span>Goal #{goal.id.slice(0, 8)}</span>
                </div>
                
                <div className="flex gap-x-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnderstandGoal(goal.id);
                    }}
                    className="bg-blue-600 text-gray-900 hover:bg-purple-700 text-sm"
                  >
                    Understand Goal
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneratePlan(goal.id);
                    }}
                    className="bbg-blue-600 text-gray-900 hover:bg-blue-700 text-sm"
                  >
                    Generate Plan
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { PlannerGoals };