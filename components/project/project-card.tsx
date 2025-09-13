"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { DotsVerticalIcon, PersonIcon, CalendarIcon } from "@radix-ui/react-icons";
import { type ProjectType } from "./index";

type ProjectCardProps = {
  project: ProjectType;
  onSelect: (projectKey: string) => void;
  onEdit?: (project: ProjectType) => void;
  onDelete?: (project: ProjectType) => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getProjectInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div 
          className="flex items-center gap-3 flex-1"
          onClick={() => onSelect(project.key)}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">
              {getProjectInitials(project.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500">{project.key.toUpperCase()}</p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm">
            <DotsVerticalIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4" />
          <span>Updated {formatDate(project.updatedAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PersonIcon className="h-4 w-4" />
          <span>{project.defaultAssignee || "No lead assigned"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Software project</span>
        </div>
      </div>
    </div>
  );
};

export { ProjectCard };
