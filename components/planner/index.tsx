"use client";
import React, { Fragment, useLayoutEffect } from "react";
import Split from "react-split";
import { PlannerHeader } from "./header";
import { PlannerGoals } from "./goals";
import { PlannerResults } from "./results";
import { useSelectedProjectContext } from "@/context/use-selected-project-context";
import "@/styles/split.css";
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
        <Split
          sizes={[50, 50]}
          gutterSize={2}
          className="flex max-h-full w-full"
          minSize={400}
        >
          <PlannerGoals className={clsx("pb-5 pr-4")} />
          <PlannerResults className={clsx("pb-5 pl-4")} />
        </Split>
      </div>
    </Fragment>
  );
};

export { Planner };