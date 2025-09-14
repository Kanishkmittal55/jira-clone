// Plan Preview Component - Shows generated plan details
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type GeneratedPlan,
  type GeneratedPlanItem,
  type PlanTemplate,
  PlanStatus,
  ExpertiseLevel,
} from "@prisma/client";
import clsx from "clsx";
import {
  FiCalendar,
  FiClock,
  FiTarget,
  FiAlertTriangle,
  FiCheckCircle,
  FiPlay,
  FiEdit3,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiTrendingUp,
} from "react-icons/fi";

interface PlanPreviewProps {
  plan: GeneratedPlan & {
    template?: PlanTemplate;
    planItems?: GeneratedPlanItem[];
  };
  onApprove?: () => void;
  onExecute?: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PlanPreview: React.FC<PlanPreviewProps> = ({
  plan,
  onApprove,
  onExecute,
  onEdit,
  onCancel,
  className,
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1]));
  
  const togglePhase = (phase: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phase)) {
      newExpanded.delete(phase);
    } else {
      newExpanded.add(phase);
    }
    setExpandedPhases(newExpanded);
  };

  const getDifficultyColor = (difficulty: ExpertiseLevel) => {
    switch (difficulty) {
      case ExpertiseLevel.BEGINNER:
        return "text-green-700 bg-green-100";
      case ExpertiseLevel.NOVICE:
        return "text-blue-700 bg-blue-100";
      case ExpertiseLevel.INTERMEDIATE:
        return "text-yellow-700 bg-yellow-100";
      case ExpertiseLevel.ADVANCED:
        return "text-orange-700 bg-orange-100";
      case ExpertiseLevel.EXPERT:
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case PlanStatus.DRAFT:
        return "text-gray-700 bg-gray-100 border-gray-300";
      case PlanStatus.APPROVED:
        return "text-green-700 bg-green-100 border-green-300";
      case PlanStatus.EXECUTING:
        return "text-blue-700 bg-blue-100 border-blue-300";
      case PlanStatus.COMPLETED:
        return "text-purple-700 bg-purple-100 border-purple-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const riskFactors = plan.riskFactors as any[] || [];
  const adaptations = plan.adaptations as any[] || [];
  const sprints = plan.planItems?.filter(item => item.type === "sprint") || [];
  const issues = plan.planItems?.filter(item => item.type === "issue") || [];

  // Group issues by phase
  const issuesByPhase = issues.reduce((acc, issue) => {
    if (!acc[issue.phase]) acc[issue.phase] = [];
    acc[issue.phase].push(issue);
    return acc;
  }, {} as Record<number, GeneratedPlanItem[]>);

  return (
    <div className={clsx("space-y-6", className)}>
      {/* Plan Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>
            <p className="text-gray-600 mt-1">{plan.description}</p>
          </div>
          <span
            className={clsx(
              "px-3 py-1 text-sm font-medium rounded-full border",
              getStatusBadge(plan.status)
            )}
          >
            {plan.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiCalendar className="h-4 w-4" />
              Duration
            </div>
            <div className="font-semibold text-gray-900">
              {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiClock className="h-4 w-4" />
              Estimated Hours
            </div>
            <div className="font-semibold text-gray-900">
              {plan.estimatedHours}h total
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiTarget className="h-4 w-4" />
              Success Probability
            </div>
            <div className="font-semibold text-green-600">
              {Math.round((plan.successProbability || 0) * 100)}%
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <FiTrendingUp className="h-4 w-4" />
              Progress
            </div>
            <div className="font-semibold text-gray-900">
              {Math.round(plan.completionRate || 0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-yellow-600" />
            Risk Factors
          </h3>
          <div className="space-y-2">
            {riskFactors.map((risk, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{risk.description}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Mitigation: {risk.mitigation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adaptations */}
      {adaptations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Plan Adaptations
          </h3>
          <div className="space-y-2">
            {adaptations.map((adaptation, index) => (
              <div key={index} className="flex items-start gap-3">
                <FiCheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-medium">{adaptation.reason}:</span>{" "}
                  <span className="text-gray-600">
                    Adjusted from {String(adaptation.originalValue)} to{" "}
                    {String(adaptation.adaptedValue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sprints and Issues */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Plan Breakdown ({sprints.length} Sprints, {issues.length} Tasks)
        </h3>
        
        {sprints.map((sprint) => {
          const phaseIssues = issuesByPhase[sprint.phase] || [];
          const isExpanded = expandedPhases.has(sprint.phase);
          
          return (
            <div
              key={sprint.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => togglePhase(sprint.phase)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <FiChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <FiChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">
                      Phase {sprint.phase}: {sprint.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{sprint.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {phaseIssues.length} tasks
                  </span>
                  <span className="text-sm text-gray-500">
                    {sprint.estimatedHours}h
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-1 text-xs font-medium rounded",
                      getDifficultyColor(sprint.difficulty)
                    )}
                  >
                    {sprint.difficulty}
                  </span>
                </div>
              </button>
              
              {isExpanded && phaseIssues.length > 0 && (
                <div className="border-t divide-y">
                  {phaseIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {issue.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {issue.description}
                        </div>
                        {issue.metadata && (issue.metadata as any).resources && (
                          <div className="flex items-center gap-2 mt-2">
                            {Object.entries((issue.metadata as any).resources).map(([key, value]) => (
                              <span
                                key={key}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                              >
                                {key}: {Array.isArray(value) ? value.length : 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm text-gray-500">
                          {issue.estimatedHours}h
                        </span>
                        <span
                          className={clsx(
                            "px-2 py-1 text-xs font-medium rounded",
                            getDifficultyColor(issue.difficulty)
                          )}
                        >
                          {issue.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiX className="h-4 w-4" />
          Cancel
        </Button>
        
        <div className="flex items-center gap-3">
          {plan.status === PlanStatus.DRAFT && (
            <>
              <Button
                onClick={onEdit}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FiEdit3 className="h-4 w-4" />
                Edit Plan
              </Button>
              <Button
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <FiCheckCircle className="h-4 w-4" />
                Approve Plan
              </Button>
            </>
          )}
          
          {plan.status === PlanStatus.APPROVED && (
            <Button
              onClick={onExecute}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <FiPlay className="h-4 w-4" />
              Execute Plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
