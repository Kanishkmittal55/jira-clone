"use client";
import React, { Fragment, useLayoutEffect } from "react";
import { PlannerHeader } from "./header";
import { PlannerGoals } from "./goals";
import { useSelectedProjectContext } from "@/context/use-selected-project-context";
import clsx from "clsx";

const Planner: React.FC = () => {
  const { projectKey } = useSelectedProjectContext();
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
        <div className="flex max-h-full w-full">
          <PlannerGoals className={clsx("pb-5 pr-4 w-full")} />
        </div>
      </div>
    </Fragment>
  );
};

export { Planner };