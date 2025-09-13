"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Cross1Icon, GearIcon, Share1Icon } from "@radix-ui/react-icons";
import { type ProjectType } from "../index";
import { type ProjectKey } from "@/context/use-selected-project-context";

type ProjectDetailsHeaderProps = {
  project: ProjectType;
  setProjectKey: React.Dispatch<React.SetStateAction<ProjectKey | null>>;
  isInViewport: boolean;
};

const ProjectDetailsHeader: React.FC<ProjectDetailsHeaderProps> = ({
  project,
  setProjectKey,
  isInViewport,
}) => {
  const getProjectInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b pb-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {getProjectInitials(project.name)}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">Software project • {project.key.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Share1Icon className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <GearIcon className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProjectKey(null)}
          >
            <Cross1Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        data-in-viewport={isInViewport}
        className="sticky top-0 z-20 hidden w-full items-center justify-between border-b bg-white py-2 [&[data-in-viewport=false]]:flex"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {getProjectInitials(project.name)}
            </span>
          </div>
          <span className="text-sm font-medium">{project.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setProjectKey(null)}
        >
          <Cross1Icon className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export { ProjectDetailsHeader };
