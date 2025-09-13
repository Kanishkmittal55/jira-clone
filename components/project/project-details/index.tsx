"use client";
import React from "react";
import { ProjectOverview } from "./project-overview";
import { ProjectMembers } from "./project-members";
import { ProjectSettings } from "./project-settings";
import { type ProjectType } from "../index";

type ProjectDetailsInfoProps = {
  project: ProjectType;
};

const ProjectDetailsInfo = React.forwardRef<
  HTMLDivElement,
  ProjectDetailsInfoProps
>(({ project }, ref) => {
  return (
    <div ref={ref} className="flex flex-col gap-6 pb-8 pt-6">
      <ProjectOverview project={project} />
      <ProjectMembers project={project} />
      <ProjectSettings project={project} />
    </div>
  );
});

ProjectDetailsInfo.displayName = "ProjectDetailsInfo";

export { ProjectDetailsInfo };
