// Assessment Results Component - Shows assessment completion and scores
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  type KnowledgeAssessment,
  type DomainExpertise,
  type AssessmentRecommendation,
  ExpertiseLevel,
} from "@prisma/client";
import clsx from "clsx";
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiTrendingUp, 
  FiBookOpen,
  FiTarget,
  FiRefreshCw,
  FiArrowRight,
  FiClock,
} from "react-icons/fi";
import { EXPERTISE_DESCRIPTIONS } from "@/utils/assessment-types";

interface AssessmentResultsProps {
  assessment: KnowledgeAssessment & {
    domainScores?: DomainExpertise[];
    recommendations?: AssessmentRecommendation[];
  };
  onReset?: () => void;
  onGeneratePlan?: () => void;
  className?: string;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  onReset,
  onGeneratePlan,
  className,
}) => {
  const getExpertiseColor = (level: ExpertiseLevel) => {
    switch (level) {
      case ExpertiseLevel.EXPERT:
        return "text-purple-700 bg-purple-100 border-purple-300";
      case ExpertiseLevel.ADVANCED:
        return "text-blue-700 bg-blue-100 border-blue-300";
      case ExpertiseLevel.INTERMEDIATE:
        return "text-green-700 bg-green-100 border-green-300";
      case ExpertiseLevel.NOVICE:
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case ExpertiseLevel.BEGINNER:
        return "text-orange-700 bg-orange-100 border-orange-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className={clsx("h-full flex flex-col", className)}>
      <div className="flex-1 overflow-y-auto px-6 py-4" style={{maxHeight: 'calc(90vh - 120px)'}}>
        <div className="space-y-6">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <FiCheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Assessment Complete!
            </h2>
            <p className="text-gray-600">
              Great job completing the assessment. Based on your responses, we've evaluated your 
              expertise level and created personalized recommendations for your learning journey.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Results */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Expertise Level */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Expertise Level</div>
            <div
              className={clsx(
                "inline-flex px-4 py-2 rounded-lg border-2 font-semibold",
                getExpertiseColor(assessment.overallLevel)
              )}
            >
              {assessment.overallLevel}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {EXPERTISE_DESCRIPTIONS[assessment.overallLevel]}
            </p>
          </div>

          {/* Overall Score */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Overall Score</div>
            <div className={clsx("text-3xl font-bold", getScoreColor(assessment.score || 0))}>
              {Math.round(assessment.score || 0)}%
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Confidence: {Math.round((assessment.confidence || 0) * 100)}%
            </div>
          </div>

          {/* Time Spent */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Time Spent</div>
            <div className="text-2xl font-semibold text-gray-900">
              {formatTime(assessment.timeSpent || 0)}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              Completed on {new Date(assessment.completedAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Scores */}
      {assessment.domainScores && assessment.domainScores.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiTarget className="h-5 w-5" />
            Domain Analysis
          </h3>
          
          <div className="space-y-3">
            {assessment.domainScores.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 min-w-[180px]">
                    {domain.domain.replace(/_/g, " ").toLowerCase()}
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-1 text-xs font-medium rounded border",
                      getExpertiseColor(domain.level)
                    )}
                  >
                    {domain.level}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={clsx(
                        "h-2 rounded-full transition-all",
                        domain.score >= 80 ? "bg-green-500" :
                        domain.score >= 60 ? "bg-blue-500" :
                        domain.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                    {Math.round(domain.score)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiBookOpen className="h-5 w-5" />
            Personalized Recommendations
          </h3>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {assessment.recommendations
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 5)
              .map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={clsx(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      rec.priority === 1 ? "bg-red-100 text-red-700" :
                      rec.priority === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-blue-100 text-blue-700"
                    )}
                  >
                    {rec.priority}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiClock className="h-3 w-3" />
                        {rec.estimatedTime ? `${rec.estimatedTime}h` : "Variable"}
                      </span>
                      <span className="px-2 py-0.5 bg-white rounded border border-gray-200">
                        {rec.type}
                      </span>
                      {rec.url && (
                        <a
                          href={rec.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Learn more →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          Retake Assessment
        </Button>
        
        <Button
          onClick={onGeneratePlan}
          className="bg-blue-600 hover:bg-blue-700 text-gray-900 flex items-center gap-2"
        >
          Generate Learning Plan
          <FiArrowRight className="h-4 w-4" />
        </Button>
      </div>
        </div>
      </div>
    </div>
  );
};
