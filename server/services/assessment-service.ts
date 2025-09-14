// Assessment Service - Business logic for knowledge assessment
import { prisma } from "@/server/db";
import {
  AssessmentStatus,
  ExpertiseLevel,
  GoalChannel,
  KnowledgeDomain,
  type KnowledgeAssessment,
  type AssessmentQuestion,
  type AssessmentTemplate,
  type PlanTemplate,
} from "@prisma/client";
import {
  calculateDomainScore,
  calculateOverallAssessment,
  calculateQuestionScore,
  validateAnswer,
  type AssessmentResponse,
  type AssessmentResult,
  type DomainScore,
} from "@/utils/assessment-types";

export class AssessmentService {
  /**
   * Get or create an assessment for a goal
   */
  static async getOrCreateAssessment(
    goalId: string,
    userId: string,
    channel: GoalChannel
  ): Promise<KnowledgeAssessment> {
    // Check if assessment already exists
    const existing = await prisma.knowledgeAssessment.findUnique({
      where: {
        goalId_userId: {
          goalId,
          userId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create new assessment
    const assessment = await prisma.knowledgeAssessment.create({
      data: {
        goalId,
        userId,
        channel,
        status: AssessmentStatus.NOT_STARTED,
        overallLevel: ExpertiseLevel.BEGINNER,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    });

    return assessment;
  }

  /**
   * Get assessment template for a channel
   */
  static async getTemplate(channel: GoalChannel): Promise<AssessmentTemplate | null> {
    return await prisma.assessmentTemplate.findFirst({
      where: {
        channel,
        isActive: true,
      },
      orderBy: {
        version: "desc",
      },
    });
  }

  /**
   * Get questions for an assessment
   */
  static async getQuestions(
    templateId: string,
    userLevel?: ExpertiseLevel
  ): Promise<AssessmentQuestion[]> {
    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        templateId,
      },
      include: {
        scoringRules: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    // Filter questions based on user level if needed
    // Advanced users might skip basic questions
    if (userLevel && userLevel !== ExpertiseLevel.BEGINNER) {
      // Implement adaptive questioning logic here
      return questions;
    }

    return questions;
  }

  /**
   * Start an assessment
   */
  static async startAssessment(assessmentId: string): Promise<KnowledgeAssessment> {
    return await prisma.knowledgeAssessment.update({
      where: { id: assessmentId },
      data: {
        status: AssessmentStatus.IN_PROGRESS,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Submit assessment response
   */
  static async submitResponse(
    assessmentId: string,
    questionId: string,
    answer: unknown,
    timeSpent?: number,
    confidence?: number
  ): Promise<void> {
    // Get question details
    const question = await prisma.assessmentQuestion.findUnique({
      where: { id: questionId },
      include: {
        scoringRules: true,
      },
    });

    if (!question) {
      throw new Error("Question not found");
    }

    // Validate answer
    const validation = validateAnswer(answer, question.questionType, question.validationRules as any);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Calculate score
    const score = calculateQuestionScore(
      answer,
      question.questionType,
      question.scoringRules.map(r => ({
        condition: r.condition as Record<string, unknown>,
        score: r.score,
      }))
    );

    // Save response
    await prisma.assessmentResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId,
        },
      },
      update: {
        answer: answer as any,
        score,
        timeSpent,
        confidence,
      },
      create: {
        assessmentId,
        questionId,
        answer: answer as any,
        score,
        timeSpent,
        confidence,
      },
    });
  }

  /**
   * Complete assessment and calculate results
   */
  static async completeAssessment(assessmentId: string): Promise<AssessmentResult> {
    // Get assessment with responses
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Get all questions for the template
    const template = await this.getTemplate(assessment.channel);
    if (!template) {
      throw new Error("Template not found");
    }

    const questions = await this.getQuestions(template.id);

    // Calculate domain scores
    const domains = this.getUniqueDomains(questions);
    const domainScores: DomainScore[] = [];

    for (const domain of domains) {
      const score = calculateDomainScore(
        assessment.responses.map(r => ({
          questionId: r.questionId,
          answer: r.answer,
          score: r.score || 0,
          timeSpent: r.timeSpent || 0,
          confidence: r.confidence || 0,
        })),
        questions.map(q => ({
          id: q.id,
          templateId: q.templateId,
          domain: q.domain,
          questionText: q.questionText,
          questionType: q.questionType,
          isRequired: q.isRequired,
          order: q.order,
          weight: q.weight,
          options: q.options as string[] | null,
          validationRules: q.validationRules as any,
          helpText: q.helpText,
          dependsOn: q.dependsOn,
          dependsOnAnswer: q.dependsOnAnswer,
          metadata: q.metadata as any,
        })),
        domain
      );
      domainScores.push(score);

      // Save domain expertise
      await prisma.domainExpertise.upsert({
        where: {
          assessmentId_domain: {
            assessmentId,
            domain,
          },
        },
        update: {
          level: score.level,
          score: score.score,
          confidence: score.confidence,
          details: score.details as any,
        },
        create: {
          assessmentId,
          domain,
          level: score.level,
          score: score.score,
          confidence: score.confidence,
          details: score.details as any,
        },
      });
    }

    // Calculate overall assessment
    const totalTimeSpent = assessment.responses.reduce(
      (sum, r) => sum + (r.timeSpent || 0),
      0
    );
    const result = calculateOverallAssessment(domainScores, totalTimeSpent);

    // Update assessment with results
    await prisma.knowledgeAssessment.update({
      where: { id: assessmentId },
      data: {
        status: AssessmentStatus.COMPLETED,
        completedAt: new Date(),
        overallLevel: result.overallLevel,
        score: result.score,
        confidence: result.confidence,
        timeSpent: totalTimeSpent,
      },
    });

    // Save recommendations
    for (const rec of result.recommendations) {
      await prisma.assessmentRecommendation.create({
        data: {
          assessmentId,
          domain: rec.domain,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          url: rec.url,
          estimatedTime: rec.estimatedTime,
          metadata: rec.metadata as any,
        },
      });
    }

    return result;
  }

  /**
   * Get assessment progress
   */
  static async getProgress(assessmentId: string): Promise<{
    totalQuestions: number;
    answeredQuestions: number;
    percentComplete: number;
    estimatedTimeRemaining: number;
  }> {
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: true,
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const template = await this.getTemplate(assessment.channel);
    if (!template) {
      throw new Error("Template not found");
    }

    const questions = await this.getQuestions(template.id);
    const totalQuestions = questions.length;
    const answeredQuestions = assessment.responses.length;
    const percentComplete = (answeredQuestions / totalQuestions) * 100;
    
    // Estimate 2 minutes per question
    const estimatedTimeRemaining = (totalQuestions - answeredQuestions) * 2;

    return {
      totalQuestions,
      answeredQuestions,
      percentComplete,
      estimatedTimeRemaining,
    };
  }

  /**
   * Get available plan templates based on assessment
   */
  static async getAvailablePlans(
    assessmentId: string
  ): Promise<PlanTemplate[]> {
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const template = await this.getTemplate(assessment.channel);
    if (!template) {
      throw new Error("Template not found");
    }

    // Get plan templates matching user's expertise level
    const plans = await prisma.planTemplate.findMany({
      where: {
        channel: assessment.channel,
        templateId: template.id,
        isActive: true,
        minExpertise: {
          lte: assessment.overallLevel,
        },
        maxExpertise: {
          gte: assessment.overallLevel,
        },
      },
      include: {
        activities: true,
      },
    });

    return plans;
  }

  /**
   * Helper: Get unique domains from questions
   */
  private static getUniqueDomains(questions: AssessmentQuestion[]): KnowledgeDomain[] {
    const domains = new Set<KnowledgeDomain>();
    questions.forEach(q => domains.add(q.domain));
    return Array.from(domains);
  }

  /**
   * Check if assessment is expired
   */
  static async isExpired(assessmentId: string): Promise<boolean> {
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || !assessment.expiresAt) {
      return false;
    }

    return new Date() > assessment.expiresAt;
  }

  /**
   * Reset assessment
   */
  static async resetAssessment(assessmentId: string): Promise<void> {
    // Delete all responses
    await prisma.assessmentResponse.deleteMany({
      where: { assessmentId },
    });

    // Delete domain scores
    await prisma.domainExpertise.deleteMany({
      where: { assessmentId },
    });

    // Delete recommendations
    await prisma.assessmentRecommendation.deleteMany({
      where: { assessmentId },
    });

    // Reset assessment status
    await prisma.knowledgeAssessment.update({
      where: { id: assessmentId },
      data: {
        status: AssessmentStatus.NOT_STARTED,
        completedAt: null,
        score: null,
        confidence: null,
        timeSpent: null,
        overallLevel: ExpertiseLevel.BEGINNER,
      },
    });
  }
}
