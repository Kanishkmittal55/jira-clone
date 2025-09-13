"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PencilIcon, CalendarIcon, UserIcon } from "@radix-ui/react-icons";
import { type ProjectType } from "../index";

type ProjectOverviewProps = {
  project: ProjectType;
};

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(
    "This is a Jira clone project built with Next.js, focusing on modern project management and issue tracking capabilities."
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Overview</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingDescription(!isEditingDescription)}
            className="gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
        </div>
        
        {isEditingDescription ? (
          <div className="space-y-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a project description..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setIsEditingDescription(false)}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDescription(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Created</span>
          </div>
          <span className="text-sm text-gray-600">{formatDate(project.createdAt)}</span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Last Updated</span>
          </div>
          <span className="text-sm text-gray-600">{formatDate(project.updatedAt)}</span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Project Lead</span>
          </div>
          <span className="text-sm text-gray-600">
            {project.defaultAssignee || "Unassigned"}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Actions</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Create Issue
          </Button>
          <Button size="sm" variant="outline">
            Start Sprint
          </Button>
          <Button size="sm" variant="outline">
            View Reports
          </Button>
        </div>
      </div>
    </div>
  );
};

export { ProjectOverview };
