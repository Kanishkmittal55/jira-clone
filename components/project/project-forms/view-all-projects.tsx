"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cross1Icon, MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";
import { ProjectCard } from "../project-card";
import { CreateProject, type ProjectFormData } from "./create-project";
import { useSelectedProjectContext } from "@/context/use-selected-project-context";
import { useProjects, useCreateProject } from "@/hooks/query-hooks/use-projects";

type ViewAllProjectsProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Projects now come from database via API

const ViewAllProjects: React.FC<ViewAllProjectsProps> = ({
  isOpen,
  onClose,
}) => {
  const { setProjectKey } = useSelectedProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Use real database hooks
  const { projects = [], isLoading } = useProjects();
  const { createProject, isCreating } = useCreateProject();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectProject = (projectKey: string) => {
    setProjectKey(projectKey);
    onClose();
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
        
        // Close modals
        setShowCreateModal(false);
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">All Projects</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                New Project
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <Cross1Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name or key..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-500">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Create your first project to get started"}
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={handleSelectProject}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
              <div className="flex items-center gap-4">
                <span>Need help organizing your projects?</span>
                <Button variant="ghost" size="sm">
                  Learn more
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateProject
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
    </>
  );
};

export { ViewAllProjects };
