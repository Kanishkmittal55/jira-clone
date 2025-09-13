"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  GearIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  CheckIcon,
  Cross1Icon 
} from "@radix-ui/react-icons";
import { type ProjectType } from "../index";

type ProjectSettingsProps = {
  project: ProjectType;
};

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const handleArchiveProject = () => {
    setIsArchived(!isArchived);
    // Mock archive functionality
    console.log(isArchived ? "Unarchiving project" : "Archiving project");
  };

  const handleDeleteProject = () => {
    // Mock delete functionality
    console.log("Deleting project:", project.key);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GearIcon className="h-5 w-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Project Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Project Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                defaultValue={project.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project Key
              </label>
              <input
                type="text"
                defaultValue={project.key.toUpperCase()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm">
              Save Changes
            </Button>
          </div>
        </div>

        {/* Project Permissions */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Permissions</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Anyone can create issues</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Anyone can edit issues</span>
              <input
                type="checkbox"
                defaultChecked={false}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Public project visibility</span>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
            <h3 className="text-sm font-medium text-red-900">Danger Zone</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">
                  {isArchived ? "Unarchive" : "Archive"} this project
                </p>
                <p className="text-xs text-red-700">
                  {isArchived 
                    ? "Make this project active again"
                    : "Hide this project from listings"
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveProject}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isArchived ? "Unarchive" : "Archive"}
              </Button>
            </div>

            <hr className="border-red-200" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Delete this project</p>
                <p className="text-xs text-red-700">
                  Permanently delete this project and all its data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete <strong>{project.name}</strong>? 
              This action cannot be undone and will permanently delete all issues, 
              sprints, and project data.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <Cross1Icon className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteProject}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ProjectSettings };
