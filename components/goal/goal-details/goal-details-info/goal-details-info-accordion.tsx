import { useUser } from "@clerk/nextjs";
import { FaChevronUp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type Goal } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateGoal } from "@/hooks/query-hooks/use-goals";
import { useIsAuthenticated } from "@/hooks/use-is-authed";
import { GoalChannelSelect } from "../../goal-select-channel";

const GoalDetailsInfoAccordion: React.FC<{ goal: Goal }> = ({ goal }) => {
  const updateGoalMutation = useUpdateGoal();
  const [isAuthenticated, openAuthModal] = useIsAuthenticated();
  const { user } = useUser();
  const [openAccordion, setOpenAccordion] = useState("details");

  return (
    <Accordion
      type="single"
      value={openAccordion}
      onValueChange={setOpenAccordion}
      className="w-full"
      collapsible
    >
      <AccordionItem value="details">
        <AccordionTrigger className="py-2 text-sm">Details</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Channel</label>
              <GoalChannelSelect goal={goal} />
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Timebox Days</label>
              <div className="text-sm">{goal.timeboxDays} days</div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Budget</label>
              <div className="text-sm">${goal.budgetUsd}</div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Success Metric</label>
              <div className="text-sm">{goal.successMetric}</div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Niche</label>
              <div className="text-sm">{goal.niche || "Not specified"}</div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="advanced">
        <AccordionTrigger className="py-2 text-sm">Advanced</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Constraints</label>
              <div className="text-sm">{goal.constraints?.length ? goal.constraints.join(", ") : "None"}</div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Revenue Streams</label>
              <div className="text-sm">{goal.revenue?.length ? goal.revenue.join(", ") : "None"}</div>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-500">Deliverables</label>
              <div className="text-sm">{goal.deliverables?.length ? goal.deliverables.join(", ") : "None"}</div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export { GoalDetailsInfoAccordion };
