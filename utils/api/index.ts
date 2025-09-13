import { projectRoutes } from "./project";
import { projectsRoutes } from "./projects";
import { issuesRoutes } from "./issues";
import { sprintsRoutes } from "./sprints";

export const api = {
  project: projectRoutes,
  projects: projectsRoutes,
  issues: issuesRoutes,
  sprints: sprintsRoutes,
};
