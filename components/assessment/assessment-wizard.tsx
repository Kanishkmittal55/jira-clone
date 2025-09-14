// Assessment Wizard Component - Main container for the assessment flow
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAssessment } from "@/hooks/use-assessment";
import { AssessmentProgress } from "./assessment-progress";
import { QuestionCard } from "./question-card";
import { AssessmentResults } from "./assessment-results";
import { Button } from "@/components/ui/button";
// Import types from Prisma client, with fallbacks
type AssessmentQuestion = any;
type AssessmentTemplate = any;
import clsx from "clsx";
import { FiArrowLeft, FiArrowRight, FiCheck, FiRefreshCw } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

interface AssessmentWizardProps {
  goalId: string;
  onComplete?: () => void;
  className?: string;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  goalId,
  onComplete,
  className,
}) => {
  const {
    assessment,
    progress,
    isLoading,
    isSubmitting,
    createAssessment,
    startAssessment,
    submitResponse,
    completeAssessment,
    resetAssessment,
    isAssessmentComplete,
    isAssessmentInProgress,
    canStartAssessment,
  } = useAssessment(goalId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [template, setTemplate] = useState<AssessmentTemplate | null>(null);
  const [responses, setResponses] = useState<Map<string, any>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Initialize assessment
  useEffect(() => {
    console.log("🔄 Assessment initialization effect triggered:", {
      hasAssessment: !!assessment,
      goalId,
      isLoading
    });

    const initAssessment = async () => {
      if (!assessment && goalId && !isLoading) {
        console.log("🚀 Creating new assessment for goalId:", goalId);
        try {
          // Use the hook's createAssessment mutation
          createAssessment({ goalId });
        } catch (error) {
          console.error("Failed to initialize assessment:", error);
        }
      } else {
        console.log("🚫 Skipping assessment creation:", {
          reason: !assessment ? 'no assessment' : !goalId ? 'no goalId' : !isLoading ? 'not loading' : 'conditions not met',
          assessment: !!assessment,
          goalId: !!goalId,
          isLoading
        });
      }
    };
    initAssessment();
  }, [goalId, assessment, isLoading, createAssessment]);

  // Load questions and template when assessment is available
  useEffect(() => {
    console.log("📋 Template loading effect triggered:", {
      hasAssessment: !!assessment,
      assessmentData: assessment ? {
        id: (assessment as any).id,
        status: assessment.status,
        hasTemplate: !!((assessment as any).template),
        hasResponses: !!(assessment.responses && assessment.responses.length > 0)
      } : null
    });

    if (assessment) {
      // Handle template data (may be nested in assessment or separate)
      const templateData = (assessment as any).template || null;
      console.log("🎨 Template data found:", templateData ? {
        name: templateData.name,
        id: templateData.id,
        questionsCount: templateData.questions ? templateData.questions.length : 0
      } : 'null');
      
      if (templateData) {
        setTemplate(templateData);
        setQuestions(templateData.questions || []);
        console.log("✅ Template and questions set successfully");
      } else {
        console.log("⚠️ No template data found in assessment");
      }
      
      // Load existing responses
      if (assessment.responses) {
        const responseMap = new Map();
        assessment.responses.forEach((r: any) => {
          responseMap.set(r.questionId, r.answer);
        });
        setResponses(responseMap);
        console.log("📝 Loaded", assessment.responses.length, "existing responses");
      }
    }
  }, [assessment]);

  // Show results when assessment is complete
  useEffect(() => {
    if (isAssessmentComplete) {
      setShowResults(true);
    }
  }, [isAssessmentComplete]);

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswer = currentQuestion && responses.has(currentQuestion.id);

  const handleStart = async () => {
    console.log("🚀 START ASSESSMENT BUTTON CLICKED!");
    console.log("📊 Current state:", {
      goalId,
      assessment: assessment ? { id: (assessment as any).id, status: assessment.status } : null,
      canStartAssessment,
      template: template ? { name: template.name, id: template.id } : null,
      isLoading,
      isSubmitting
    });

    if (!assessment) {
      console.error("❌ Cannot start: assessment is null/undefined");
      return;
    }

    if (!canStartAssessment) {
      console.error("❌ Cannot start: canStartAssessment is false. Assessment status:", assessment.status);
      // If assessment is already in progress, just proceed with current state
      if (assessment.status === "IN_PROGRESS") {
        console.log("✅ Assessment already in progress, continuing...");
        setStartTime(Date.now());
        return;
      }
      return;
    }

    console.log("✅ Conditions met, calling startAssessment with ID:", (assessment as any).id);
    
    try {
      await startAssessment((assessment as any).id);
      console.log("✅ startAssessment completed successfully");
      setStartTime(Date.now());
    } catch (error) {
      console.error("❌ Error in startAssessment:", error);
    }
  };

  const handleAnswer = useCallback(async (answer: any) => {
    if (!currentQuestion || !assessment) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Update responses map without creating new Map instance during typing
    setResponses(prevResponses => {
      const newResponses = new Map(prevResponses);
      newResponses.set(currentQuestion.id, answer);
      return newResponses;
    });
    
    // Submit to backend (this will be debounced in the hook)
    try {
      await submitResponse(currentQuestion.id, answer, timeSpent);
    } catch (error) {
      console.error("Failed to submit response:", error);
      // Continue without blocking the UI
    }
    
    // Reset timer for next question
    setStartTime(Date.now());
  }, [currentQuestion, assessment, submitResponse, startTime]);

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (assessment) {
      await completeAssessment((assessment as any).id);
      setShowResults(true);
      onComplete?.();
    }
  };

  const handleReset = async () => {
    if (assessment) {
      await resetAssessment((assessment as any).id);
      setResponses(new Map());
      setCurrentQuestionIndex(0);
      setShowResults(false);
    }
  };

  const handleSkip = () => {
    if (!isLastQuestion) {
      handleNext();
    }
  };

  if (isLoading) {
    console.log("⏳ Rendering loading state");
    return (
      <div className={clsx("flex items-center justify-center h-64", className)}>
        <BiLoaderAlt className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show fallback if assessment fails to load
  if (!assessment && !isLoading) {
    console.log("❌ Rendering assessment failed state (no assessment, not loading)");
    return (
      <div className={clsx("text-center py-8 space-y-4", className)}>
        <p className="text-gray-600">Unable to load assessment</p>
        <p className="text-sm text-gray-500">
          The assessment system is currently unavailable. Please try again later.
        </p>
        <Button 
          onClick={() => {
            console.log("🔄 Retry Assessment button clicked");
            if (goalId) {
              createAssessment({ goalId });
            }
          }} 
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <FiRefreshCw className="h-4 w-4 mr-2" />
          Retry Assessment
        </Button>
      </div>
    );
  }

  // Show fallback start screen if template is missing
  if (!template && assessment) {
    console.log("🎨 Rendering fallback start screen (Assessment Ready) - no template but has assessment");
    return (
      <div className={clsx("text-center py-8 space-y-4", className)}>
        <h2 className="text-xl font-semibold text-gray-900">Assessment Ready</h2>
        <p className="text-gray-600">
          This assessment will help us understand your current knowledge level and create a personalized learning plan.
        </p>
        <Button 
          onClick={handleStart}
          disabled={isSubmitting}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? (
            <BiLoaderAlt className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FiArrowRight className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? "Starting..." : "Start Assessment"}
        </Button>
      </div>
    );
  }

  // Show results view
  if (showResults && isAssessmentComplete) {
    console.log("🏆 Rendering results view");
    return (
      <AssessmentResults
        assessment={assessment}
        onReset={handleReset}
        className={className}
      />
    );
  }

  // Show start screen
  if ((canStartAssessment && template && assessment?.status === "NOT_STARTED")) {
    console.log("🎆 Rendering main start screen (with template details)");
    return (
      <div className={clsx("flex flex-col items-center justify-center py-12", className)}>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {template.name}
          </h2>
          <p className="text-gray-600">
            {template.description}
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {template.minQuestions}-{template.maxQuestions}
              </div>
              <div className="text-gray-500">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {template.timeLimit || 30}
              </div>
              <div className="text-gray-500">Minutes</div>
            </div>
          </div>
          <Button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-700 text-gray-900 px-8 py-3"
          >
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Show assessment in progress (only if we have questions)
  if (questions.length === 0) {
    console.log("⚠️ No questions available, showing fallback");
    return (
      <div className={clsx("text-center py-8 space-y-4", className)}>
        <p className="text-gray-600">Assessment questions are loading...</p>
        <Button 
          onClick={() => {
            if (goalId) {
              createAssessment({ goalId });
            }
          }} 
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          <FiRefreshCw className="h-4 w-4 mr-2" />
          Reload Assessment
        </Button>
      </div>
    );
  }

  console.log("📝 Rendering assessment in progress view with", questions.length, "questions");
  return (
    <div className={clsx("space-y-6", className)}>
      {/* Progress Bar */}
      <AssessmentProgress
        current={currentQuestionIndex + 1}
        total={questions.length}
        percentComplete={progress?.percentComplete || 0}
        estimatedTime={progress?.estimatedTimeRemaining || 0}
      />

      {/* Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          value={responses.get(currentQuestion.id)}
          onChange={handleAnswer}
          disabled={isSubmitting}
        />
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          onClick={handlePrevious}
          disabled={isFirstQuestion || isSubmitting}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {!hasAnswer && !currentQuestion?.isRequired && (
            <Button
              onClick={handleSkip}
              disabled={isSubmitting}
              variant="ghost"
              className="text-gray-600"
            >
              Skip
            </Button>
          )}
        </div>

        {isLastQuestion ? (
          <Button
            onClick={handleComplete}
            disabled={!hasAnswer || isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <FiCheck className="h-4 w-4" />
            Complete Assessment
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!hasAnswer && currentQuestion?.isRequired}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            Next
            <FiArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {questions.map((q, index) => {
          const isAnswered = responses.has(q.id);
          const isCurrent = index === currentQuestionIndex;
          
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={clsx(
                "w-10 h-10 rounded-lg font-medium text-sm transition-colors",
                {
                  "bg-blue-600 text-white": isCurrent,
                  "bg-green-100 text-green-700 border border-green-300": isAnswered && !isCurrent,
                  "bg-gray-100 text-gray-600 border border-gray-300": !isAnswered && !isCurrent,
                }
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
