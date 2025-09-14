"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useGoals } from "@/hooks/query-hooks/use-goals";
import { useIsInViewport } from "@/hooks/use-is-in-viewport";
import { GoalDetailsHeader } from "./goal-details-header";
import { GoalDetailsInfo } from "./goal-details-info";
import { type Goal } from "@prisma/client";

const GoalDetails: React.FC<{
  goalId: string | null;
  setGoalId: React.Dispatch<React.SetStateAction<Goal["id"] | null>>;
}> = ({ goalId, setGoalId }) => {
  const { goals } = useGoals();
  const renderContainerRef = React.useRef<HTMLDivElement>(null);
  const [isInViewport, viewportRef] = useIsInViewport({ threshold: 1 });

  const getGoal = useCallback(
    (goalId: string | null) => {
      return goals?.find((goal) => goal.id === goalId);
    },
    [goals]
  );
  const [goalInfo, setGoalInfo] = useState(() => getGoal(goalId));

  useEffect(() => {
    setGoalInfo(() => getGoal(goalId));
    if (renderContainerRef.current) {
      renderContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [goalId, getGoal]);

  if (!goalInfo || !goals) return <div />;

  return (
    <div
      ref={renderContainerRef}
      data-state={goalId ? "open" : "closed"}
      className="relative z-10 flex w-full flex-col overflow-y-auto pl-4 pr-2 [&[data-state=closed]]:hidden"
    >
      <GoalDetailsHeader
        goal={goalInfo}
        setGoalId={setGoalId}
        isInViewport={isInViewport}
      />
      <GoalDetailsInfo goal={goalInfo} ref={viewportRef} />
    </div>
  );
};

export { GoalDetails };
