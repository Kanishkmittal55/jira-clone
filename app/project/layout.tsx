"use client";
import { Sidebar } from "@/components/sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { FiltersProvider } from "@/context/use-filters-context";
import { SelectedIssueProvider } from "@/context/use-selected-issue-context";
import { SelectedGoalProvider } from "@/context/use-selected-goal-context";
import { Fragment } from "react";

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Fragment>
      <TopNavbar />
      <main className="flex h-[calc(100vh_-_3rem)] w-full">
        <Sidebar />
        <FiltersProvider>
          <SelectedIssueProvider>
            <SelectedGoalProvider>
              <div className="w-full max-w-[calc(100vw_-_16rem)]">{children}</div>
            </SelectedGoalProvider>
          </SelectedIssueProvider>
        </FiltersProvider>
      </main>
    </Fragment>
  );
};

export default ProjectLayout;
