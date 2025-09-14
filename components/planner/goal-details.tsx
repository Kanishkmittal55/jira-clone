"use client";
import React, { useState, useEffect } from "react";
import { type Goal } from "@prisma/client";
import { BiBullseye, BiBrain, BiCheck, BiPlay, BiX } from "react-icons/bi";
import { FiClock, FiDollarSign, FiTarget } from "react-icons/fi";
import { AssessmentWizard } from "@/components/assessment";
import { usePlans, useGeneratePlan } from "@/hooks/query-hooks/use-plans";
import clsx from "clsx";

interface GoalDetailsProps {
  goal: Goal;
  defaultTab?: "overview" | "assessment" | "plan" | "execution";
  onClose?: () => void;
}

const GoalDetails: React.FC<GoalDetailsProps> = ({ goal, defaultTab = "overview", onClose }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Move hooks to component level to avoid conditional hook calls
  const { plans, isLoading: plansLoading } = usePlans(goal.id);
  const generatePlanMutation = useGeneratePlan();

  // Sync activeTab with defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BiBullseye },
    { id: "assessment", label: "Assessment", icon: BiBrain, status: "Not Started" },
    { id: "plan", label: "Learning Plan", icon: BiCheck },
    { id: "execution", label: "Execution", icon: BiPlay },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Goal Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
        <p className="text-gray-700 leading-relaxed">
          {goal.description || "No description provided for this goal."}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Timeline</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{goal.timeboxDays} days</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Budget</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">${goal.budgetUsd}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiTarget className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">Success Metric</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{goal.successMetric}</div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Constraints</h4>
          <div className="space-y-2">
            {goal.constraints && Array.isArray(goal.constraints) && goal.constraints.length > 0 ? (
              goal.constraints.map((constraint: any, index: number) => (
                <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {String(constraint)}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">No constraints specified</div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Deliverables</h4>
          <div className="space-y-2">
            {goal.deliverables && Array.isArray(goal.deliverables) && goal.deliverables.length > 0 ? (
              goal.deliverables.map((deliverable: any, index: number) => (
                <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {String(deliverable)}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">No deliverables specified</div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Model */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Revenue Model</h4>
        <div className="space-y-2">
          {goal.revenue && Array.isArray(goal.revenue) && goal.revenue.length > 0 ? (
            goal.revenue.map((revenue: any, index: number) => (
              <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded inline-block mr-2">
                {String(revenue)}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic">No revenue model specified</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="h-full flex flex-col">
      <AssessmentWizard 
        goalId={goal.id}
        onComplete={() => {
          // Handle assessment completion
          console.log("Assessment completed for goal:", goal.id);
        }}
        className="flex-1 min-h-0"
      />
    </div>
  );

  const renderPlan = () => {
    // Find the latest plan for this goal
    const latestPlan = plans.find((plan: any) => plan.goalId === goal.id);
    
    const handleGeneratePlan = async () => {
      // We need to get assessment data to generate plan
      try {
        console.log("🎯 Starting plan generation for goal:", goal.id);
        
        // First, get or create an assessment for this goal
        const assessmentResponse = await fetch(`/api/assessments?goalId=${goal.id}`);
        if (!assessmentResponse.ok) {
          throw new Error("Failed to get assessment");
        }
        
        const assessmentData = await assessmentResponse.json();
        console.log("📊 Assessment data for plan generation:", assessmentData);
        
        if (!assessmentData || !assessmentData.id) {
          throw new Error("No assessment found for this goal");
        }
        
        if (assessmentData.status !== "COMPLETED") {
          throw new Error("Assessment must be completed before generating a plan");
        }
        
        // Use a hardcoded UUID template for now since plan-templates endpoint doesn't exist
        let templateId = "00000000-0000-0000-0000-000000000001"; // Valid UUID fallback
        
        // TODO: Implement plan-templates API endpoint when templates are available
        console.log("📋 Using default template ID for channel:", goal.channel);
        
        // Generate the plan
        await generatePlanMutation.mutateAsync({
          goalId: goal.id,
          assessmentId: assessmentData.id,
          templateId,
        });
      } catch (error) {
        console.error("❌ Error in plan generation flow:", error);
      }
    };
    
    if (plansLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading plans...</div>
        </div>
      );
    }
    
    if (!latestPlan) {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <BiCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Your Learning Plan</h3>
            <p className="text-gray-600 mb-6">
              Create a personalized learning plan based on your goal and assessment results.
            </p>
            <button
              onClick={handleGeneratePlan}
              disabled={generatePlanMutation.isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatePlanMutation.isLoading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Plan...
                </>
              ) : (
                <>
                  <BiCheck className="inline-block h-5 w-5 mr-2" />
                  Generate Learning Plan
                </>
              )}
            </button>
          </div>
        </div>
      );
    }
    
    // Show existing plan
    return (
      <div className="space-y-6">
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <BiCheck className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-green-900">Learning Plan Generated</h3>
          </div>
          <p className="text-green-700 mt-1">
            Your personalized learning plan is ready! Status: {latestPlan.status}
          </p>
        </div>
        
        {latestPlan.planItems && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Plan Items:</h4>
            {latestPlan.planItems.map((item: any, index: number) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Phase {item.phase}</span>
                      <span>Type: {item.type}</span>
                      {item.estimatedHours && <span>{item.estimatedHours}h</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderExecution = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <BiPlay className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Execution Phase Coming Soon</h3>
        <p className="text-gray-600">
          Track your progress and execute your plan with guided steps.
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "assessment":
        return renderAssessment();
      case "plan":
        return renderPlan();
      case "execution":
        return renderExecution();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{goal.title}</h2>
            <p className="text-sm text-gray-600 mb-3">
              {goal.description || "No description provided"}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">
              {goal.channel}
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BiX className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.status && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {tab.status}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden min-h-0">
        {renderTabContent()}
      </div>
    </div>
  );
};

export { GoalDetails };