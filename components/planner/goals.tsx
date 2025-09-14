"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BiBullseye, BiBrain } from "react-icons/bi";
import { FiPlay, FiExternalLink } from "react-icons/fi";
import clsx from "clsx";
import { useGoals } from "@/hooks/query-hooks/use-goals";
import { useSelectedGoalContext } from "@/context/use-selected-goal-context";
import { useGeneratePlan } from "@/hooks/query-hooks/use-plans";
import { GoalDetails } from "./goal-details";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const PlannerGoals: React.FC<{ className?: string }> = ({ className }) => {
  const { goals, isLoading } = useGoals();
  const { goalId, setGoalId } = useSelectedGoalContext();
  const generatePlanMutation = useGeneratePlan();
  const [showGoalDetails, setShowGoalDetails] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [defaultTab, setDefaultTab] = useState<"overview" | "assessment" | "plan">("overview");

  const handleOpenGoal = (goal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGoal(goal);
    setDefaultTab("overview");
    setShowGoalDetails(true);
  };

  const handleStartAssessment = (goal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGoal(goal);
    setDefaultTab("assessment");
    setShowGoalDetails(true);
  };

  const handleGeneratePlan = async (goal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🎯 Generate Plan button clicked for goal:", goal.id);
    
    try {
      // First check if assessment is completed
      const assessmentResponse = await fetch(`/api/assessments?goalId=${goal.id}`);
      if (!assessmentResponse.ok) {
        throw new Error("No assessment found. Please complete the assessment first.");
      }
      
      const assessmentData = await assessmentResponse.json();
      
      if (!assessmentData || assessmentData.status !== "COMPLETED") {
        // Open assessment tab if not completed
        setSelectedGoal(goal);
        setDefaultTab("assessment");
        setShowGoalDetails(true);
        return;
      }
      
      // If assessment is completed, open plan tab and trigger generation
      setSelectedGoal(goal);
      setDefaultTab("plan");
      setShowGoalDetails(true);
      
    } catch (error) {
      console.error("❌ Error checking assessment status:", error);
      // Fallback to opening the plan tab
      setSelectedGoal(goal);
      setDefaultTab("plan");
      setShowGoalDetails(true);
    }
  };

  return (
    <>
      <div className={clsx("flex flex-col h-full w-full", className)}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Goals</h2>
        </div>

        {/* Goals List - Full Width */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading goals...</div>
            </div>
          ) : goals.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
                <p className="text-gray-600">Create your first goal to get started!</p>
              </div>
            </div>
          ) : (
            goals.map((goal) => (
              <div 
                key={goal.id} 
                role="button"
                data-state={goalId === goal.id ? "selected" : "not-selected"}
                onClick={() => setGoalId(goal.id)}
                className={clsx(
                  "w-full p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow cursor-pointer",
                  "[&[data-state=selected]]:bg-blue-50 [&[data-state=selected]]:border-blue-300"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{goal.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{goal.description || "No description provided"}</p>
                  </div>
                  <div className="flex gap-x-2 ml-4">
                    <span className={clsx("px-2 py-1 text-xs rounded-full", "bg-blue-100 text-blue-600")}>
                      {goal.channel}
                    </span>
                    <span className={clsx(
                      "px-2 py-1 text-xs rounded-full",
                      "bg-green-100 text-green-600"
                    )}>
                      READY
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2 text-sm text-gray-500">
                    <BiBullseye className="h-4 w-4" />
                    <span>Goal #{goal.id.slice(0, 8)}</span>
                  </div>
                  
                  <div className="flex gap-x-2">
                    <Button 
                      onClick={(e) => handleOpenGoal(goal, e)}
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                      size="sm"
                    >
                      <FiExternalLink className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      onClick={(e) => handleStartAssessment(goal, e)}
                      className="bg-blue-600 text-gray-900 hover:bg-blue-700 text-sm"
                      size="sm"
                    >
                      <BiBrain className="h-3 w-3 mr-1" />
                      Start Assessment
                    </Button>
                    <Button 
                      onClick={(e) => handleGeneratePlan(goal, e)}
                      className="bg-green-600 text-white hover:bg-green-700 text-sm"
                      size="sm"
                    >
                      <FiPlay className="h-3 w-3 mr-1" />
                      Generate Plan
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

       {/* Goal Details Modal */}
       <Dialog open={showGoalDetails} onOpenChange={setShowGoalDetails}>
         <DialogContent 
           className="max-w-none w-[95vw] h-[90vh] p-0 m-0 !transform-none !top-[5vh] !left-[2.5vw] !translate-x-0 !translate-y-0 [&>button]:hidden"
           style={{
             position: 'fixed',
             top: '5vh',
             left: '2.5vw',
             transform: 'none',
             width: '95vw',
             height: '90vh',
             maxWidth: 'none',
             maxHeight: '90vh'
           }}
         >
           <DialogTitle className="sr-only">
             {selectedGoal?.title || "Goal Details"}
           </DialogTitle>
           <DialogDescription className="sr-only">
             View and manage goal details, assessment, and learning plan
           </DialogDescription>
           {selectedGoal && (
             <GoalDetails 
               goal={selectedGoal} 
               defaultTab={defaultTab} 
               onClose={() => setShowGoalDetails(false)}
             />
           )}
         </DialogContent>
       </Dialog>
    </>
  );
};

export { PlannerGoals };