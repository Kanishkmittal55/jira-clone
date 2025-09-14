// Types for Knowledge Assessment and Plan Generation
import {
  ExpertiseLevel,
  QuestionType,
  AssessmentStatus,
  KnowledgeDomain,
  PlanStatus,
  GoalChannel,
} from "@prisma/client";

// ============= ASSESSMENT TYPES =============

export interface AssessmentQuestion {
  id: string;
  templateId: string;
  domain: KnowledgeDomain;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  order: number;
  weight: number;
  options?: string[] | null;
  validationRules?: ValidationRule | null;
  helpText?: string | null;
  dependsOn?: string | null;
  dependsOnAnswer?: unknown | null;
  metadata?: Record<string, unknown> | null;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface AssessmentResponse {
  questionId: string;
  answer: unknown;
  score?: number;
  timeSpent?: number;
  confidence?: number;
}

export interface DomainScore {
  domain: KnowledgeDomain;
  level: ExpertiseLevel;
  score: number;
  confidence: number;
  details?: Record<string, unknown>;
}

export interface AssessmentResult {
  overallLevel: ExpertiseLevel;
  score: number;
  confidence: number;
  domainScores: DomainScore[];
  recommendations: AssessmentRecommendation[];
  timeSpent: number;
}

export interface AssessmentRecommendation {
  domain: KnowledgeDomain;
  type: "learning" | "tool" | "resource" | "practice";
  title: string;
  description: string;
  priority: number;
  url?: string;
  estimatedTime?: number;
  metadata?: Record<string, unknown>;
}

// ============= PLAN GENERATION TYPES =============

export interface PlanPhase {
  name: string;
  duration: number;
  focus: string;
  activities?: PlanActivity[];
}

export interface PlanStructure {
  phases: PlanPhase[];
}

export interface PlanPrerequisites {
  minCapital?: number;
  equipment?: string[];
  software?: string[];
  tools?: string[];
  timeCommitment: string;
}

export interface PlanDeliverables {
  primary: string;
  secondary: string[];
}

export interface PlanMilestone {
  day: number;
  checkpoint: string;
}

export interface PlanActivity {
  id?: string;
  name: string;
  description: string;
  type: "learning" | "setup" | "execution" | "review";
  phase: number;
  order: number;
  estimatedHours: number;
  difficulty: ExpertiseLevel;
  dependencies: string[];
  resources?: Record<string, unknown>;
  successCriteria: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface GeneratedPlanItem {
  type: "sprint" | "issue";
  parentId?: string;
  name: string;
  description: string;
  phase: number;
  order: number;
  estimatedHours: number;
  difficulty: ExpertiseLevel;
  status: string;
  dependencies: string[];
  metadata?: Record<string, unknown>;
}

export interface PlanGenerationParams {
  goalId: string;
  assessmentId: string;
  templateId: string;
  userLevel: ExpertiseLevel;
  timeboxDays: number;
  constraints?: Record<string, unknown>;
}

export interface PlanAdaptation {
  reason: string;
  originalValue: unknown;
  adaptedValue: unknown;
  impact: "low" | "medium" | "high";
}

export interface RiskFactor {
  type: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

// ============= DOMAIN MAPPINGS =============

export const CHANNEL_DOMAINS: Record<GoalChannel, KnowledgeDomain[]> = {
  [GoalChannel.TRADING]: [
    KnowledgeDomain.MARKET_ANALYSIS,
    KnowledgeDomain.RISK_MANAGEMENT,
    KnowledgeDomain.TECHNICAL_ANALYSIS,
    KnowledgeDomain.FUNDAMENTAL_ANALYSIS,
    KnowledgeDomain.TRADING_PSYCHOLOGY,
    KnowledgeDomain.PLATFORM_USAGE,
  ],
  [GoalChannel.YOUTUBE]: [
    KnowledgeDomain.CONTENT_CREATION,
    KnowledgeDomain.VIDEO_EDITING,
    KnowledgeDomain.AUDIENCE_BUILDING,
    KnowledgeDomain.MONETIZATION,
    KnowledgeDomain.SEO_OPTIMIZATION,
    KnowledgeDomain.ANALYTICS,
  ],
  [GoalChannel.NEWSLETTER]: [
    KnowledgeDomain.WRITING,
    KnowledgeDomain.EMAIL_MARKETING,
    KnowledgeDomain.SUBSCRIBER_GROWTH,
    KnowledgeDomain.CONTENT_CURATION,
    KnowledgeDomain.AUTOMATION,
  ],
  [GoalChannel.MICROSaaS]: [
    KnowledgeDomain.PROGRAMMING,
    KnowledgeDomain.SYSTEM_DESIGN,
    KnowledgeDomain.DEPLOYMENT,
    KnowledgeDomain.MARKETING,
    KnowledgeDomain.CUSTOMER_SUPPORT,
    KnowledgeDomain.PRICING_STRATEGY,
  ],
  [GoalChannel.NOTION_TEMPLATE]: [
    KnowledgeDomain.SYSTEM_DESIGN,
    KnowledgeDomain.MARKETING,
    KnowledgeDomain.PRICING_STRATEGY,
  ],
  [GoalChannel.CLI]: [
    KnowledgeDomain.PROGRAMMING,
    KnowledgeDomain.SYSTEM_DESIGN,
    KnowledgeDomain.DEPLOYMENT,
  ],
  [GoalChannel.EXTENSION]: [
    KnowledgeDomain.PROGRAMMING,
    KnowledgeDomain.SYSTEM_DESIGN,
    KnowledgeDomain.MARKETING,
  ],
  [GoalChannel.SEO]: [
    KnowledgeDomain.SEO_OPTIMIZATION,
    KnowledgeDomain.CONTENT_CREATION,
    KnowledgeDomain.ANALYTICS,
    KnowledgeDomain.MARKETING,
  ],
};

// ============= EXPERTISE LEVEL MAPPINGS =============

export const EXPERTISE_SCORES: Record<ExpertiseLevel, { min: number; max: number }> = {
  [ExpertiseLevel.BEGINNER]: { min: 0, max: 20 },
  [ExpertiseLevel.NOVICE]: { min: 21, max: 40 },
  [ExpertiseLevel.INTERMEDIATE]: { min: 41, max: 60 },
  [ExpertiseLevel.ADVANCED]: { min: 61, max: 80 },
  [ExpertiseLevel.EXPERT]: { min: 81, max: 100 },
};

export const EXPERTISE_DESCRIPTIONS: Record<ExpertiseLevel, string> = {
  [ExpertiseLevel.BEGINNER]: "No prior experience in this domain",
  [ExpertiseLevel.NOVICE]: "Basic understanding with limited practical experience",
  [ExpertiseLevel.INTERMEDIATE]: "Solid foundation and can work independently",
  [ExpertiseLevel.ADVANCED]: "Extensive experience and can mentor others",
  [ExpertiseLevel.EXPERT]: "Industry-level expertise with proven track record",
};

// ============= QUESTION TYPE CONFIGURATIONS =============

export const QUESTION_TYPE_CONFIG: Record<QuestionType, {
  inputType: string;
  defaultValidation?: ValidationRule;
  scoringMethod: "exact" | "range" | "partial" | "custom";
}> = {
  [QuestionType.SINGLE_CHOICE]: {
    inputType: "radio",
    scoringMethod: "exact",
  },
  [QuestionType.MULTIPLE_CHOICE]: {
    inputType: "checkbox",
    scoringMethod: "partial",
  },
  [QuestionType.SCALE]: {
    inputType: "range",
    defaultValidation: { min: 1, max: 10 },
    scoringMethod: "range",
  },
  [QuestionType.TEXT]: {
    inputType: "text",
    defaultValidation: { minLength: 1, maxLength: 500 },
    scoringMethod: "custom",
  },
  [QuestionType.BOOLEAN]: {
    inputType: "radio",
    scoringMethod: "exact",
  },
  [QuestionType.NUMERIC]: {
    inputType: "number",
    defaultValidation: { min: 0 },
    scoringMethod: "range",
  },
};

// ============= UTILITY FUNCTIONS =============

export function calculateExpertiseLevel(score: number): ExpertiseLevel {
  for (const [level, range] of Object.entries(EXPERTISE_SCORES)) {
    if (score >= range.min && score <= range.max) {
      return level as ExpertiseLevel;
    }
  }
  return ExpertiseLevel.BEGINNER;
}

export function getRequiredDomains(channel: GoalChannel): KnowledgeDomain[] {
  return CHANNEL_DOMAINS[channel] || [];
}

export function validateAnswer(
  answer: unknown,
  questionType: QuestionType,
  validationRules?: ValidationRule | null
): { valid: boolean; error?: string } {
  const config = QUESTION_TYPE_CONFIG[questionType];
  const rules = validationRules || config.defaultValidation;

  if (!rules) return { valid: true };

  switch (questionType) {
    case QuestionType.NUMERIC:
    case QuestionType.SCALE:
      const numValue = Number(answer);
      if (isNaN(numValue)) {
        return { valid: false, error: "Invalid number" };
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return { valid: false, error: `Minimum value is ${rules.min}` };
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return { valid: false, error: `Maximum value is ${rules.max}` };
      }
      break;

    case QuestionType.TEXT:
      const textValue = String(answer);
      if (rules.minLength && textValue.length < rules.minLength) {
        return { valid: false, error: `Minimum length is ${rules.minLength}` };
      }
      if (rules.maxLength && textValue.length > rules.maxLength) {
        return { valid: false, error: `Maximum length is ${rules.maxLength}` };
      }
      if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(textValue)) {
          return { valid: false, error: "Invalid format" };
        }
      }
      break;

    case QuestionType.MULTIPLE_CHOICE:
      if (!Array.isArray(answer)) {
        return { valid: false, error: "Multiple selection required" };
      }
      if (rules.required && answer.length === 0) {
        return { valid: false, error: "At least one option must be selected" };
      }
      break;

    case QuestionType.SINGLE_CHOICE:
    case QuestionType.BOOLEAN:
      if (rules.required && !answer) {
        return { valid: false, error: "Selection required" };
      }
      break;
  }

  return { valid: true };
}

export function calculateQuestionScore(
  answer: unknown,
  questionType: QuestionType,
  scoringRules?: Array<{
    condition: Record<string, unknown>;
    score: number;
  }>
): number {
  if (!scoringRules || scoringRules.length === 0) {
    return 0;
  }

  const config = QUESTION_TYPE_CONFIG[questionType];

  switch (config.scoringMethod) {
    case "exact":
      const exactRule = scoringRules.find(
        (rule) => rule.condition.value === answer
      );
      return exactRule?.score || 0;

    case "range":
      const numAnswer = Number(answer);
      for (const rule of scoringRules) {
        const condition = rule.condition as { value?: { min?: number; max?: number } };
        if (condition.value) {
          const { min = -Infinity, max = Infinity } = condition.value;
          if (numAnswer >= min && numAnswer <= max) {
            return rule.score;
          }
        }
      }
      return 0;

    case "partial":
      if (!Array.isArray(answer)) return 0;
      let totalScore = 0;
      let maxScore = 0;
      for (const rule of scoringRules) {
        maxScore = Math.max(maxScore, rule.score);
        if (answer.includes(rule.condition.value)) {
          totalScore += rule.score;
        }
      }
      return Math.min(totalScore, maxScore);

    case "custom":
      // Custom scoring logic for text answers
      // This would typically involve NLP or keyword matching
      return 50; // Default middle score for now

    default:
      return 0;
  }
}

export function calculateDomainScore(
  responses: AssessmentResponse[],
  questions: AssessmentQuestion[],
  domain: KnowledgeDomain
): DomainScore {
  const domainQuestions = questions.filter((q) => q.domain === domain);
  const domainResponses = responses.filter((r) =>
    domainQuestions.some((q) => q.id === r.questionId)
  );

  if (domainQuestions.length === 0) {
    return {
      domain,
      level: ExpertiseLevel.BEGINNER,
      score: 0,
      confidence: 0,
    };
  }

  let totalScore = 0;
  let totalWeight = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  for (const response of domainResponses) {
    const question = domainQuestions.find((q) => q.id === response.questionId);
    if (!question) continue;

    const score = response.score || 0;
    totalScore += score * question.weight;
    totalWeight += question.weight;

    if (response.confidence !== undefined) {
      totalConfidence += response.confidence;
      confidenceCount++;
    }
  }

  const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0.5;

  return {
    domain,
    level: calculateExpertiseLevel(finalScore),
    score: finalScore,
    confidence: avgConfidence,
  };
}

export function generateRecommendations(
  domainScores: DomainScore[],
  channel: GoalChannel
): AssessmentRecommendation[] {
  const recommendations: AssessmentRecommendation[] = [];
  
  for (const score of domainScores) {
    if (score.level === ExpertiseLevel.BEGINNER || score.level === ExpertiseLevel.NOVICE) {
      // Generate learning recommendations for weak areas
      recommendations.push({
        domain: score.domain,
        type: "learning",
        title: `Improve your ${score.domain.toLowerCase().replace(/_/g, " ")} skills`,
        description: `Your current level is ${score.level}. We recommend focusing on foundational concepts.`,
        priority: score.level === ExpertiseLevel.BEGINNER ? 1 : 2,
        estimatedTime: score.level === ExpertiseLevel.BEGINNER ? 20 : 10,
      });
    }
  }
  
  return recommendations.sort((a, b) => a.priority - b.priority);
}

export function calculateOverallAssessment(
  domainScores: DomainScore[],
  timeSpent: number
): AssessmentResult {
  if (domainScores.length === 0) {
    return {
      overallLevel: ExpertiseLevel.BEGINNER,
      score: 0,
      confidence: 0,
      domainScores: [],
      recommendations: [],
      timeSpent,
    };
  }

  const totalScore = domainScores.reduce((sum, ds) => sum + ds.score, 0);
  const avgScore = totalScore / domainScores.length;
  
  const totalConfidence = domainScores.reduce((sum, ds) => sum + ds.confidence, 0);
  const avgConfidence = totalConfidence / domainScores.length;

  const overallLevel = calculateExpertiseLevel(avgScore);
  const recommendations = generateRecommendations(
    domainScores,
    GoalChannel.TRADING // This should be passed as parameter
  );

  return {
    overallLevel,
    score: avgScore,
    confidence: avgConfidence,
    domainScores,
    recommendations,
    timeSpent,
  };
}
