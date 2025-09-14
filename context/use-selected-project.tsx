"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
}

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project) => void;
  projects: Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [projects] = useState<Project[]>([
    { id: "1", key: "JC", name: "Jira Clone Project", description: "Software project" }
  ]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("selectedProject");
    if (saved) {
      setSelectedProjectState(JSON.parse(saved));
    } else if (projects.length > 0) {
      setSelectedProjectState(projects[0]);
    }
  }, [projects]);

  const setSelectedProject = (project: Project) => {
    setSelectedProjectState(project);
    localStorage.setItem("selectedProject", JSON.stringify(project));
  };

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject, projects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useSelectedProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useSelectedProject must be used within ProjectProvider");
  return context;
}