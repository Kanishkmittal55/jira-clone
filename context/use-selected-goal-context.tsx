"use client";

import { type Goal } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type SelectedGoalContextProps = {
  goalId: Goal["id"] | null;
  setGoalId: React.Dispatch<React.SetStateAction<Goal["id"] | null>>;
};

const SelectedGoalContext = createContext<SelectedGoalContextProps>({
  goalId: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setGoalId: () => {},
});

export const SelectedGoalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [goalId, setGoalId] = useState<Goal["id"] | null>(null);

  const setSelectedGoalUrl = useCallback(
    (id: Goal["id"] | null) => {
      const urlWithQuery = pathname + (id ? `?selectedGoal=${id}` : "");
      window.history.pushState(null, "", urlWithQuery);
    },
    [pathname]
  );

  useEffect(() => {
    setGoalId(searchParams.get("selectedGoal"));
  }, [searchParams]);

  useEffect(() => {
    setSelectedGoalUrl(goalId);
  }, [goalId, setSelectedGoalUrl]);

  return (
    <SelectedGoalContext.Provider value={{ goalId, setGoalId }}>
      {children}
    </SelectedGoalContext.Provider>
  );
};

export const useSelectedGoalContext = () => useContext(SelectedGoalContext);
