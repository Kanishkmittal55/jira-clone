"use client";

import React, { useState } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon, PlusIcon } from "@radix-ui/react-icons";
import { useSelectedProjectContext } from "@/context/use-selected-project-context";
import { useCreateProject } from "@/hooks/query-hooks/use-projects";
import { CreateProject, type ProjectFormData } from "./project-forms/create-project";
import { ViewAllProjects } from "./project-forms/view-all-projects";

interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface ProjectSelectorProps {
  currentProject: Project;
  projects: Project[];
}

export function ProjectSelector({
  currentProject,
  projects,
}: ProjectSelectorProps) {
  const { setProjectKey } = useSelectedProjectContext();
  const { createProject } = useCreateProject();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);

  const getProjectInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProjectChange = (project: Project) => {
    setProjectKey(project.key);
    setIsOpen(false);
  };

  const handleCreateProject = (projectData: ProjectFormData) => {
    // Create project in database
    createProject({
      name: projectData.name,
      key: projectData.key,
      description: projectData.description,
      defaultAssignee: null,
      imageUrl: null,
    }, {
      onSuccess: (newProject) => {
        // Switch to new project
        setProjectKey(newProject.key);
      },
    });
  };

  return (
    <>
      <Dropdown onOpenChange={setIsOpen}>
        <DropdownTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {getProjectInitials(currentProject.name)}
              </span>
            </div>
            <span>{currentProject.name}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
        </DropdownTrigger>
        <DropdownContent className="w-80 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="text-xs font-medium text-gray-500 mb-2">Recent</div>
          {projects.map((project) => (
            <DropdownItem
              key={project.id}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-md outline-none focus:outline-none"
              onClick={() => handleProjectChange(project)}
            >
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {getProjectInitials(project.name)}
                </span>
              </div>
              <div>
                <div className="font-medium">{project.name}</div>
                <div className="text-xs text-gray-500">Software project</div>
              </div>
            </DropdownItem>
          ))}
          <div className="border-t border-gray-200 my-1" />
          <DropdownItem
            className="text-sm text-blue-600 cursor-pointer hover:bg-blue-50 p-2 rounded-md outline-none focus:outline-none"
            onClick={() => setShowViewAllModal(true)}
          >
            View all projects
          </DropdownItem>
          <DropdownItem
            className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:bg-blue-50 p-2 rounded-md outline-none focus:outline-none"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Create project
          </DropdownItem>
        </DropdownContent>
      </Dropdown>

      <CreateProject
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
      
      <ViewAllProjects
        isOpen={showViewAllModal}
        onClose={() => setShowViewAllModal(false)}
      />
    </>
  );
}