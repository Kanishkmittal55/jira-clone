import React from "react";
import { type Goal } from "@prisma/client";
import { GoalDetailsInfoDescription } from "./goal-details-info-description";
import { GoalDetailsInfoAccordion } from "./goal-details-info-accordion";
import { GoalTitle } from "../../goal-title";
import { useState } from "react";

const GoalDetailsInfo = React.forwardRef<
  HTMLDivElement,
  { goal: Goal }
>(({ goal }, ref) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex max-h-[70vh] w-full overflow-hidden">
      <div className="overflow-y-auto pr-3 flex-1">
        <h1
          ref={ref}
          role="button"
          onClick={() => setIsEditing(true)}
          data-state={isEditing ? "editing" : "notEditing"}
          className="w-full transition-all [&[data-state=notEditing]]:hover:bg-gray-100"
        >
          <GoalTitle
            className="mr-1 py-1"
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            goal={goal}
          />
        </h1>
        <GoalDetailsInfoDescription goal={goal} />
      </div>

      <div className="mt-4 bg-white pl-3 w-80">
        <GoalDetailsInfoAccordion goal={goal} />
      </div>
    </div>
  );
});

GoalDetailsInfo.displayName = "GoalDetailsInfo";

export { GoalDetailsInfo };
