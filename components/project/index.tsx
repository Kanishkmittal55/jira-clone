"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useProject } from "@/hooks/query-hooks/use-project";
import { useIsInViewport } from "@/hooks/use-is-in-viewport";
import { ProjectDetailsHeader } from "./project-details/project-header";
import { ProjectDetailsInfo } from "./project-details";
import { type ProjectKey } from "@/context/use-selected-project-context";

// Mock project type based on existing schema
export type ProjectType = {
  id: string;
  key: string;
  name: string;
  defaultAssignee: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

const ProjectDetails: React.FC<{
  projectKey: ProjectKey | null;
  setProjectKey: React.Dispatch<React.SetStateAction<ProjectKey | null>>;
}> = ({ projectKey, setProjectKey }) => {
  const { project } = useProject();
  const renderContainerRef = React.useRef<HTMLDivElement>(null);
  const [isInViewport, viewportRef] = useIsInViewport({ threshold: 1 });

  const getProject = useCallback(
    (projectKey: ProjectKey | null) => {
      // Mock project data - in real app this would come from API
      if (projectKey === "jira-clone") {
        return {
          id: "1",
          key: "jira-clone",
          name: "Jira Clone Project",
          defaultAssignee: null,
          imageUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
      }
      return null;
    },
    []
  );
  
  const [projectInfo, setProjectInfo] = useState(() => getProject(projectKey));

  useEffect(() => {
    setProjectInfo(() => getProject(projectKey));
    if (renderContainerRef.current) {
      renderContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [projectKey, getProject]);

  if (!projectInfo) return <div />;

  return (
    <div
      ref={renderContainerRef}
      data-state={projectKey ? "open" : "closed"}
      className="relative z-10 flex w-full flex-col overflow-y-auto pl-4 pr-2 [&[data-state=closed]]:hidden"
    >
      <ProjectDetailsHeader
        project={projectInfo}
        setProjectKey={setProjectKey}
        isInViewport={isInViewport}
      />
      <ProjectDetailsInfo project={projectInfo} ref={viewportRef} />
    </div>
  );
};

export { ProjectDetails };
export type { ProjectType };
