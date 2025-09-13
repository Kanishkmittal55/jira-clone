"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export type ProjectKey = string;

type SelectedProjectContextProps = {
  projectKey: ProjectKey | null;
  setProjectKey: React.Dispatch<React.SetStateAction<ProjectKey | null>>;
};

const SelectedProjectContext = createContext<SelectedProjectContextProps>({
  projectKey: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setProjectKey: () => {},
});

export const SelectedProjectProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [projectKey, setProjectKey] = useState<ProjectKey | null>(null);

  const setSelectedProjectUrl = useCallback(
    (key: ProjectKey | null) => {
      const urlWithQuery = pathname + (key ? `?selectedProject=${key}` : "");
      window.history.pushState(null, "", urlWithQuery);
    },
    [pathname]
  );

  useEffect(() => {
    const urlProjectKey = searchParams.get("selectedProject");
    setProjectKey(urlProjectKey || "jira-clone"); // Default to main project
  }, [searchParams]);

  useEffect(() => {
    setSelectedProjectUrl(projectKey);
  }, [projectKey, setSelectedProjectUrl]);

  return (
    <SelectedProjectContext.Provider value={{ projectKey, setProjectKey }}>
      {children}
    </SelectedProjectContext.Provider>
  );
};

export const useSelectedProjectContext = () => useContext(SelectedProjectContext);
