import { projectRoutes } from "./project";
import { projectsRoutes } from "./projects";
import { issuesRoutes } from "./issues";
import { sprintsRoutes } from "./sprints";
import { goalsRoutes } from "./goals";
import { plansRoutes } from "./plans";

export const api = {
  project: projectRoutes,
  projects: projectsRoutes,
  issues: issuesRoutes,
  sprints: sprintsRoutes,
  goals: goalsRoutes,
  plans: plansRoutes,
};
