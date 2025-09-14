// Question Card Component - Renders different question types
"use client";

import React, { useState } from "react";
import { 
  type AssessmentQuestion,
  QuestionType,
} from "@prisma/client";
import clsx from "clsx";
import { FiInfo } from "react-icons/fi";

interface QuestionCardProps {
  question: AssessmentQuestion;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const [confidence, setConfidence] = useState<number>(0.5);

  const renderQuestionInput = () => {
    const options = question.options as string[] | null;

    switch (question.questionType) {
      case QuestionType.SINGLE_CHOICE:
        return (
          <div className="space-y-3">
            {options?.map((option, index) => (
              <label
                key={index}
                className={clsx(
                  "flex items-center p-4 rounded-lg border cursor-pointer transition-all",
                  {
                    "border-blue-500 bg-blue-50": value === option,
                    "border-gray-200 hover:border-gray-300 bg-white": value !== option,
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        const selectedValues = value || [];
        return (
          <div className="space-y-3">
            {options?.map((option, index) => (
              <label
                key={index}
                className={clsx(
                  "flex items-center p-4 rounded-lg border cursor-pointer transition-all",
                  {
                    "border-blue-500 bg-blue-50": selectedValues.includes(option),
                    "border-gray-200 hover:border-gray-300 bg-white": !selectedValues.includes(option),
                    "opacity-50 cursor-not-allowed": disabled,
                  }
                )}
              >
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option);
                    onChange(newValues);
                  }}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case QuestionType.SCALE:
        const scaleValue = value || 5;
        const validationRules = question.validationRules as any;
        const min = validationRules?.min || 1;
        const max = validationRules?.max || 10;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{min} - Low</span>
              <span className="text-2xl font-bold text-blue-600">{scaleValue}</span>
              <span>{max} - High</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={scaleValue}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
          </div>
        );

      case QuestionType.TEXT:
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className={clsx(
              "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              {
                "bg-gray-50": disabled,
                "bg-white": !disabled,
              }
            )}
            placeholder="Type your answer here..."
          />
        );

      case QuestionType.BOOLEAN:
        return (
          <div className="flex gap-4">
            <button
              onClick={() => onChange(true)}
              disabled={disabled}
              className={clsx(
                "flex-1 py-4 px-6 rounded-lg border-2 font-medium transition-all",
                {
                  "border-green-500 bg-green-50 text-green-700": value === true,
                  "border-gray-200 hover:border-gray-300 bg-white text-gray-700": value !== true,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
            >
              Yes
            </button>
            <button
              onClick={() => onChange(false)}
              disabled={disabled}
              className={clsx(
                "flex-1 py-4 px-6 rounded-lg border-2 font-medium transition-all",
                {
                  "border-red-500 bg-red-50 text-red-700": value === false,
                  "border-gray-200 hover:border-gray-300 bg-white text-gray-700": value !== false,
                  "opacity-50 cursor-not-allowed": disabled,
                }
              )}
            >
              No
            </button>
          </div>
        );

      case QuestionType.NUMERIC:
        const numValidation = question.validationRules as any;
        return (
          <div className="max-w-xs">
            <input
              type="number"
              value={value || ""}
              onChange={(e) => onChange(Number(e.target.value))}
              disabled={disabled}
              min={numValidation?.min}
              max={numValidation?.max}
              className={clsx(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                {
                  "bg-gray-50": disabled,
                  "bg-white": !disabled,
                }
              )}
              placeholder="Enter a number..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx("bg-white rounded-lg border border-gray-200 shadow-sm", className)}>
      <div className="p-6 space-y-6">
        {/* Question Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {question.questionText}
            </h3>
            {question.isRequired && (
              <span className="text-sm text-red-500 font-medium">*Required</span>
            )}
          </div>
          
          {question.helpText && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FiInfo className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{question.helpText}</span>
            </div>
          )}
        </div>

        {/* Question Input */}
        <div>{renderQuestionInput()}</div>

        {/* Confidence Slider (optional) */}
        {value && question.questionType !== QuestionType.BOOLEAN && (
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How confident are you in this answer?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Not confident</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">Very confident</span>
              <span className="text-sm font-medium text-blue-600 w-12">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Domain Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Domain:</span>
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            {question.domain.replace(/_/g, " ").toLowerCase()}
          </span>
          <span className="text-xs text-gray-500">Weight:</span>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            {question.weight}x
          </span>
        </div>
      </div>
    </div>
  );
};
