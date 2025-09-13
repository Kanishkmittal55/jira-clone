"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { BiGitBranch, BiRefresh } from "react-icons/bi";

const PlannerHeader: React.FC<{ projectKey: string | null }> = ({ projectKey }) => {
  return (
    <div className="flex h-fit flex-col">
      <div className="text-sm text-gray-500">Projects / {projectKey}</div>
      <h1>Project Planner</h1>
      <div className="my-3 flex items-center justify-between">
        <div className="flex items-center gap-x-5">
          <div className="text-sm text-gray-600">
            AI-powered project planning and ticket generation
          </div>
        </div>
        <div className="flex items-center gap-x-2">
          <Button className="flex items-center gap-x-2">
            <BiRefresh className="text-gray-900" />
            <span className="text-sm text-gray-900">Refresh Analysis</span>
          </Button>
          <Button className="flex items-center gap-x-2">
            <BiGitBranch className="text-gray-900" />
            <span className="text-sm text-gray-900">Connect Repository</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export { PlannerHeader };