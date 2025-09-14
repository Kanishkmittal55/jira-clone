"use client";
import React, { Fragment, useLayoutEffect } from "react";
import Split from "react-split";
import { PlannerHeader } from "./header";
import { PlannerGoals } from "./goals";
import { GoalDetails } from "../goal/goal-details";
import { useSelectedProjectContext } from "@/context/use-selected-project-context";
import { useSelectedGoalContext } from "@/context/use-selected-goal-context";
import "@/styles/split.css";
import clsx from "clsx";

const Planner: React.FC = () => {
  const { projectKey } = useSelectedProjectContext();
  const { goalId, setGoalId } = useSelectedGoalContext();
  const renderContainerRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!renderContainerRef.current) return;
    const calculatedHeight = renderContainerRef.current.offsetTop;
    renderContainerRef.current.style.height = `calc(100vh - ${calculatedHeight}px)`;
  }, []);

  return (
    <Fragment>
      <PlannerHeader projectKey={projectKey} />
      <div ref={renderContainerRef} className="min-w-full max-w-max">
        <Split
          sizes={goalId ? [60, 40] : [100, 0]}
          gutterSize={goalId ? 2 : 0}
          className="flex max-h-full w-full"
          minSize={goalId ? 400 : 0}
        >
          <PlannerGoals className={clsx(goalId && "pb-5 pr-4")} />
          <GoalDetails setGoalId={setGoalId} goalId={goalId} />
        </Split>
      </div>
    </Fragment>
  );
};

export { Planner };