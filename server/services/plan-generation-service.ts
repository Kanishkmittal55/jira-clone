// Plan Generation Service - Business logic for generating adaptive plans
import { prisma } from "@/server/db";
import {
  PlanStatus,
  ExpertiseLevel,
  type GeneratedPlan,
  type PlanTemplate,
  type KnowledgeAssessment,
  type GeneratedPlanItem as PrismaGeneratedPlanItem,
} from "@prisma/client";
import {
  type PlanGenerationParams,
  type PlanAdaptation,
  type RiskFactor,
} from "@/utils/assessment-types";

export class PlanGenerationService {
  /**
   * Generate a personalized plan based on assessment
   */
  static async generatePlan(
    params: PlanGenerationParams
  ): Promise<GeneratedPlan> {
    const { goalId, assessmentId, templateId, userLevel, timeboxDays, constraints } = params;

    // Get assessment details
    const assessment = await prisma.knowledgeAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        domainScores: true,
        recommendations: true,
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Get plan template
    const template = await prisma.planTemplate.findUnique({
      where: { id: templateId },
      include: {
        activities: {
          orderBy: [
            { phase: "asc" },
            { order: "asc" },
          ],
        },
      },
    });

    if (!template) {
      console.log("⚠️ Plan template not found, using fallback template generation");
      // For now, create a simple fallback plan without a template
      return await this.generateFallbackPlan({
        goalId,
        assessmentId,
        templateId,
        userLevel,
        timeboxDays,
        constraints,
        assessment,
      });
    }

    // Calculate adaptations based on user level
    const adaptations = this.calculateAdaptations(
      template,
      assessment,
      timeboxDays
    );

    // Calculate risk factors
    const riskFactors = this.identifyRiskFactors(
      assessment,
      template,
      timeboxDays
    );

    // Calculate success probability
    const successProbability = this.calculateSuccessProbability(
      assessment,
      template,
      riskFactors
    );

    // Calculate estimated hours
    const estimatedHours = this.calculateTotalHours(
      template,
      assessment.overallLevel
    );

    // Create the generated plan
    const generatedPlan = await prisma.generatedPlan.create({
      data: {
        assessmentId,
        templateId,
        goalId,
        name: `${template.name} - Personalized`,
        description: this.generatePlanDescription(template, assessment),
        status: PlanStatus.DRAFT,
        adjustedForUser: true,
        estimatedHours,
        successProbability,
        riskFactors: riskFactors as any,
        adaptations: adaptations as any,
        startDate: new Date(),
        endDate: new Date(Date.now() + timeboxDays * 24 * 60 * 60 * 1000),
      },
    });

    // Generate plan items (sprints and issues)
    await this.generatePlanItems(
      generatedPlan.id,
      template,
      assessment,
      timeboxDays
    );

    return generatedPlan;
  }

  /**
   * Generate plan items (sprints and issues)
   */
  private static async generatePlanItems(
    planId: string,
    template: PlanTemplate & { activities: any[] },
    assessment: KnowledgeAssessment & { domainScores: any[]; recommendations: any[] },
    timeboxDays: number
  ): Promise<void> {
    const structure = template.structure as any;
    const phases = structure.phases || [];
    
    // Calculate days per phase
    const totalPhases = phases.length;
    const daysPerPhase = Math.floor(timeboxDays / totalPhases);
    
    // Create sprints for each phase
    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
      const phase = phases[phaseIndex];
      const phaseStartDay = phaseIndex * daysPerPhase;
      
      // Create sprint item
      const sprintItem = await prisma.generatedPlanItem.create({
        data: {
          planId,
          type: "sprint",
          name: phase.name,
          description: phase.focus,
          phase: phaseIndex + 1,
          order: 1,
          estimatedHours: this.calculatePhaseHours(
            template.activities,
            phaseIndex + 1,
            assessment.overallLevel
          ),
          difficulty: this.getPhaseDefaultDifficulty(phaseIndex, assessment.overallLevel),
          status: "pending",
          startDate: new Date(Date.now() + phaseStartDay * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + (phaseStartDay + daysPerPhase) * 24 * 60 * 60 * 1000),
          metadata: {
            phaseType: this.getPhaseType(phaseIndex),
            focusAreas: this.getPhaseFocusAreas(phase, assessment),
          },
          dependencies: [],
        },
      });
      
      // Create issues for activities in this phase
      const phaseActivities = template.activities.filter(
        (activity) => activity.phase === phaseIndex + 1
      );
      
      for (const activity of phaseActivities) {
        // Adjust activity based on user level
        const adjustedActivity = this.adjustActivityForUser(
          activity,
          assessment.overallLevel,
          assessment.domainScores
        );
        
        await prisma.generatedPlanItem.create({
          data: {
            planId,
            type: "issue",
            parentId: sprintItem.id,
            name: adjustedActivity.name,
            description: adjustedActivity.description,
            phase: phaseIndex + 1,
            order: activity.order,
            estimatedHours: adjustedActivity.estimatedHours,
            difficulty: activity.difficulty,
            status: "pending",
            metadata: {
              activityType: activity.type,
              resources: activity.resources,
              successCriteria: activity.successCriteria,
              adjustments: adjustedActivity.adjustments,
            },
            dependencies: activity.dependencies,
          },
        });
      }
    }
  }

  /**
   * Calculate adaptations for the plan
   */
  private static calculateAdaptations(
    template: PlanTemplate,
    assessment: KnowledgeAssessment & { domainScores: any[] },
    timeboxDays: number
  ): PlanAdaptation[] {
    const adaptations: PlanAdaptation[] = [];
    
    // Time adaptation
    if (timeboxDays !== template.typicalDuration) {
      adaptations.push({
        reason: "Timeline adjustment",
        originalValue: template.typicalDuration,
        adaptedValue: timeboxDays,
        impact: Math.abs(timeboxDays - template.typicalDuration) > 7 ? "high" : "medium",
      });
    }
    
    // Expertise level adaptation
    if (assessment.overallLevel !== template.minExpertise) {
      adaptations.push({
        reason: "User expertise level",
        originalValue: template.minExpertise,
        adaptedValue: assessment.overallLevel,
        impact: "high",
      });
    }
    
    // Weak domain adaptations
    const weakDomains = assessment.domainScores.filter(
      (ds) => ds.level === ExpertiseLevel.BEGINNER || ds.level === ExpertiseLevel.NOVICE
    );
    
    if (weakDomains.length > 0) {
      adaptations.push({
        reason: "Additional support for weak domains",
        originalValue: "Standard activities",
        adaptedValue: `Added ${weakDomains.length} supplementary learning activities`,
        impact: "medium",
      });
    }
    
    return adaptations;
  }

  /**
   * Identify risk factors
   */
  private static identifyRiskFactors(
    assessment: KnowledgeAssessment & { domainScores: any[] },
    template: PlanTemplate,
    timeboxDays: number
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];
    
    // Time constraint risk
    if (timeboxDays < template.typicalDuration * 0.8) {
      risks.push({
        type: "time_constraint",
        description: "Compressed timeline may impact quality",
        probability: 0.7,
        impact: 0.6,
        mitigation: "Focus on core activities and skip optional ones",
      });
    }
    
    // Expertise gap risk
    if (assessment.overallLevel === ExpertiseLevel.BEGINNER) {
      risks.push({
        type: "expertise_gap",
        description: "Steep learning curve for beginner",
        probability: 0.6,
        impact: 0.7,
        mitigation: "Additional learning resources and extended practice time",
      });
    }
    
    // Low confidence risk
    if (assessment.confidence && assessment.confidence < 0.5) {
      risks.push({
        type: "low_confidence",
        description: "Low self-confidence may affect progress",
        probability: 0.5,
        impact: 0.5,
        mitigation: "Start with easy wins and gradual difficulty increase",
      });
    }
    
    return risks;
  }

  /**
   * Calculate success probability
   */
  private static calculateSuccessProbability(
    assessment: KnowledgeAssessment,
    template: PlanTemplate,
    riskFactors: RiskFactor[]
  ): number {
    let baseProbability = template.successRate || 0.7;
    
    // Adjust based on expertise level
    const expertiseFactor = {
      [ExpertiseLevel.BEGINNER]: 0.8,
      [ExpertiseLevel.NOVICE]: 0.9,
      [ExpertiseLevel.INTERMEDIATE]: 1.0,
      [ExpertiseLevel.ADVANCED]: 1.1,
      [ExpertiseLevel.EXPERT]: 1.2,
    };
    
    baseProbability *= expertiseFactor[assessment.overallLevel];
    
    // Adjust based on risks
    for (const risk of riskFactors) {
      baseProbability *= (1 - risk.probability * risk.impact * 0.2);
    }
    
    // Adjust based on confidence
    if (assessment.confidence) {
      baseProbability *= (0.8 + assessment.confidence * 0.4);
    }
    
    return Math.min(Math.max(baseProbability, 0.1), 0.95);
  }

  /**
   * Calculate total hours
   */
  private static calculateTotalHours(
    template: PlanTemplate & { activities?: any[] },
    userLevel: ExpertiseLevel
  ): number {
    if (!template.activities) return 80; // Default estimate
    
    const levelMultiplier = {
      [ExpertiseLevel.BEGINNER]: 1.5,
      [ExpertiseLevel.NOVICE]: 1.3,
      [ExpertiseLevel.INTERMEDIATE]: 1.0,
      [ExpertiseLevel.ADVANCED]: 0.9,
      [ExpertiseLevel.EXPERT]: 0.8,
    };
    
    const baseHours = template.activities.reduce(
      (sum, activity) => sum + activity.estimatedHours,
      0
    );
    
    return Math.round(baseHours * levelMultiplier[userLevel]);
  }

  /**
   * Generate plan description
   */
  private static generatePlanDescription(
    template: PlanTemplate,
    assessment: KnowledgeAssessment
  ): string {
    return `This personalized plan is adapted for your ${assessment.overallLevel.toLowerCase()} expertise level. ` +
           `Based on your assessment, we've tailored the ${template.name} to focus on your specific needs and goals. ` +
           `The plan includes ${template.sprintCount} phases designed to progressively build your skills.`;
  }

  /**
   * Calculate phase hours
   */
  private static calculatePhaseHours(
    activities: any[],
    phase: number,
    userLevel: ExpertiseLevel
  ): number {
    const phaseActivities = activities.filter(a => a.phase === phase);
    const baseHours = phaseActivities.reduce((sum, a) => sum + a.estimatedHours, 0);
    
    const multiplier = {
      [ExpertiseLevel.BEGINNER]: 1.5,
      [ExpertiseLevel.NOVICE]: 1.3,
      [ExpertiseLevel.INTERMEDIATE]: 1.0,
      [ExpertiseLevel.ADVANCED]: 0.9,
      [ExpertiseLevel.EXPERT]: 0.8,
    };
    
    return Math.round(baseHours * multiplier[userLevel]);
  }

  /**
   * Get phase default difficulty
   */
  private static getPhaseDefaultDifficulty(
    phaseIndex: number,
    userLevel: ExpertiseLevel
  ): ExpertiseLevel {
    // First phase should match user level
    if (phaseIndex === 0) return userLevel;
    
    // Gradually increase difficulty
    const levels = Object.values(ExpertiseLevel);
    const currentIndex = levels.indexOf(userLevel);
    const targetIndex = Math.min(currentIndex + phaseIndex, levels.length - 1);
    
    return levels[targetIndex];
  }

  /**
   * Get phase type
   */
  private static getPhaseType(phaseIndex: number): string {
    const types = ["foundation", "practice", "implementation", "optimization"];
    return types[Math.min(phaseIndex, types.length - 1)];
  }

  /**
   * Get phase focus areas
   */
  private static getPhaseFocusAreas(
    phase: any,
    assessment: KnowledgeAssessment & { domainScores: any[] }
  ): string[] {
    const weakDomains = assessment.domainScores
      .filter(ds => ds.level === ExpertiseLevel.BEGINNER || ds.level === ExpertiseLevel.NOVICE)
      .map(ds => ds.domain);
    
    // Prioritize weak domains in early phases
    return weakDomains.slice(0, 3);
  }

  /**
   * Adjust activity for user
   */
  private static adjustActivityForUser(
    activity: any,
    userLevel: ExpertiseLevel,
    domainScores: any[]
  ): any {
    const adjustments: string[] = [];
    let estimatedHours = activity.estimatedHours;
    
    // Adjust hours based on user level
    if (userLevel === ExpertiseLevel.BEGINNER) {
      estimatedHours *= 1.5;
      adjustments.push("Extended time for beginners");
    } else if (userLevel === ExpertiseLevel.EXPERT) {
      estimatedHours *= 0.8;
      adjustments.push("Reduced time for experts");
    }
    
    // Check if activity domain is weak
    const activityDomain = this.inferActivityDomain(activity);
    const domainScore = domainScores.find(ds => ds.domain === activityDomain);
    
    if (domainScore && domainScore.level === ExpertiseLevel.BEGINNER) {
      estimatedHours *= 1.3;
      adjustments.push("Additional time for weak domain");
    }
    
    return {
      ...activity,
      estimatedHours: Math.round(estimatedHours),
      adjustments,
    };
  }

  /**
   * Infer activity domain from metadata
   */
  private static inferActivityDomain(activity: any): string {
    // This would use NLP or keyword matching in a real implementation
    // For now, return a default
    return "GENERAL";
  }

  /**
   * Approve a generated plan
   */
  static async approvePlan(
    planId: string,
    userId: string
  ): Promise<GeneratedPlan> {
    const plan = await prisma.generatedPlan.findUnique({
      where: { id: planId },
      include: {
        assessment: true,
      },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.assessment.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return await prisma.generatedPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });
  }

  /**
   * Execute a plan (convert to actual sprints and issues)
   */
  static async executePlan(
    planId: string,
    userId: string
  ): Promise<{ sprints: string[]; issues: string[] }> {
    const plan = await prisma.generatedPlan.findUnique({
      where: { id: planId },
      include: {
        assessment: {
          include: {
            goal: true,
          },
        },
        planItems: {
          orderBy: [
            { phase: "asc" },
            { order: "asc" },
          ],
        },
      },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    if (plan.assessment.userId !== userId) {
      throw new Error("Unauthorized");
    }

    if (plan.status !== PlanStatus.APPROVED) {
      throw new Error("Plan must be approved before execution");
    }

    const createdSprints: string[] = [];
    const createdIssues: string[] = [];
    const sprintMap = new Map<string, string>();

    // Create actual sprints and issues
    for (const item of plan.planItems) {
      if (item.type === "sprint") {
        // Create actual sprint
        const sprint = await prisma.sprint.create({
          data: {
            name: item.name,
            description: item.description,
            creatorId: userId,
            status: "PENDING",
            startDate: item.startDate,
            endDate: item.endDate,
          },
        });
        
        createdSprints.push(sprint.id);
        sprintMap.set(item.id, sprint.id);
      } else if (item.type === "issue") {
        // Create actual issue
        const sprintId = item.parentId ? sprintMap.get(item.parentId) : undefined;
        
        const issueCount = await prisma.issue.count({
          where: { creatorId: userId },
        });
        
        const issue = await prisma.issue.create({
          data: {
            key: `TASK-${issueCount + 1}`,
            name: item.name,
            description: item.description,
            type: "TASK",
            status: "TODO",
            sprintId,
            sprintPosition: item.order,
            boardPosition: -1,
            creatorId: userId,
            reporterId: userId,
          },
        });
        
        createdIssues.push(issue.id);
      }
    }

    // Update plan status
    await prisma.generatedPlan.update({
      where: { id: planId },
      data: {
        status: PlanStatus.EXECUTING,
        executedAt: new Date(),
      },
    });

    return {
      sprints: createdSprints,
      issues: createdIssues,
    };
  }

  /**
   * Generate a simple fallback plan when no template is found
   */
  static async generateFallbackPlan(params: {
    goalId: string;
    assessmentId: string;
    templateId: string;
    userLevel: ExpertiseLevel;
    timeboxDays: number;
    constraints: Record<string, unknown>;
    assessment: any;
  }): Promise<GeneratedPlan> {
    const {
      goalId,
      assessmentId,
      templateId,
      userLevel,
      timeboxDays,
      constraints,
      assessment,
    } = params;

    console.log("🔄 Generating fallback plan for level:", userLevel);

    // Create a basic plan structure
    const plan = await prisma.generatedPlan.create({
      data: {
        assessmentId,
        templateId,
        goalId,
        name: `${assessment.goal?.name || 'Learning'} Plan - ${userLevel}`,
        description: `A personalized learning plan generated for ${userLevel} level learner`,
        status: PlanStatus.DRAFT,
        adjustedForUser: true,
        estimatedHours: this.calculateEstimatedHours(userLevel, timeboxDays),
        startDate: new Date(),
        endDate: new Date(Date.now() + timeboxDays * 24 * 60 * 60 * 1000),
        riskFactors: this.generateBasicRiskFactors(userLevel),
        adaptations: this.generateBasicAdaptations(userLevel, constraints),
      },
    });

    // Create basic plan items
    await this.createFallbackPlanItems(plan.id, userLevel, timeboxDays);

    console.log("✅ Fallback plan created:", plan.id);
    return plan;
  }

  /**
   * Calculate estimated hours based on user level and timeframe
   */
  private static calculateEstimatedHours(level: ExpertiseLevel, days: number): number {
    const baseHoursPerDay = level === 'BEGINNER' ? 2 : level === 'INTERMEDIATE' ? 3 : 4;
    return Math.min(baseHoursPerDay * days, days * 8); // Cap at 8 hours per day
  }

  /**
   * Generate basic risk factors
   */
  private static generateBasicRiskFactors(level: ExpertiseLevel): any {
    return {
      timeConstraints: level === 'BEGINNER' ? 'high' : 'medium',
      complexityRisk: level === 'BEGINNER' ? 'high' : 'low',
      prerequisiteGaps: level === 'BEGINNER' ? 'medium' : 'low',
    };
  }

  /**
   * Generate basic adaptations
   */
  private static generateBasicAdaptations(level: ExpertiseLevel, constraints: Record<string, unknown>): any {
    return {
      pacing: level === 'BEGINNER' ? 'slower' : 'normal',
      supportLevel: level === 'BEGINNER' ? 'high' : 'medium',
      practiceEmphasis: level === 'BEGINNER' ? 'high' : 'normal',
      constraints,
    };
  }

  /**
   * Create fallback plan items
   */
  private static async createFallbackPlanItems(planId: string, level: ExpertiseLevel, days: number): Promise<void> {
    const phases = this.getFallbackPhases(level);
    const itemsPerPhase = Math.max(2, Math.floor(days / phases.length / 7)); // At least 2 items per phase

    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
      const phase = phases[phaseIndex];
      
      for (let itemIndex = 0; itemIndex < itemsPerPhase; itemIndex++) {
        await prisma.generatedPlanItem.create({
          data: {
            planId,
            type: itemIndex === 0 ? 'sprint' : 'issue',
            name: `${phase.name} - ${itemIndex === 0 ? 'Sprint' : `Task ${itemIndex}`}`,
            description: phase.description,
            phase: phaseIndex + 1,
            order: itemIndex,
            estimatedHours: level === 'BEGINNER' ? 8 : 6,
            difficulty: level,
            dependencies: [],
            metadata: {
              phase: phase.name,
              type: itemIndex === 0 ? 'sprint' : 'task',
              fallbackGenerated: true,
            },
          },
        });
      }
    }
  }

  /**
   * Get fallback learning phases based on user level
   */
  private static getFallbackPhases(level: ExpertiseLevel) {
    const basePhases = [
      {
        name: 'Foundation',
        description: 'Build core understanding and fundamental concepts',
      },
      {
        name: 'Practice',
        description: 'Apply knowledge through guided exercises and examples',
      },
      {
        name: 'Application',
        description: 'Work on real-world scenarios and projects',
      },
    ];

    if (level === 'BEGINNER') {
      return [
        {
          name: 'Prerequisites',
          description: 'Review essential background knowledge and setup',
        },
        ...basePhases,
        {
          name: 'Review',
          description: 'Consolidate learning and address knowledge gaps',
        },
      ];
    }

    if (level === 'ADVANCED') {
      return [
        ...basePhases,
        {
          name: 'Advanced Topics',
          description: 'Explore complex scenarios and edge cases',
        },
        {
          name: 'Mastery',
          description: 'Achieve expert-level proficiency and teach others',
        },
      ];
    }

    return basePhases; // INTERMEDIATE
  }
}
