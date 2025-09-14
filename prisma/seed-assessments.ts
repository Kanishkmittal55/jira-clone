// Seed script for assessment templates and questions
import { PrismaClient, Prisma } from "@prisma/client";
import {
  assessmentTemplates,
  tradingQuestions,
  youtubeQuestions,
  newsletterQuestions,
  microSaaSQuestions,
  scoringRules,
  planTemplates,
  planActivities,
} from "./seed-assessment-data";

const prisma = new PrismaClient();

async function seedAssessmentData() {
  console.log("🌱 Seeding assessment templates and questions...");

  try {
    // Seed assessment templates
    for (const template of assessmentTemplates) {
      await prisma.assessmentTemplate.upsert({
        where: {
          channel_version: {
            channel: template.channel,
            version: template.version,
          },
        },
        update: {},
        create: template,
      });
      console.log(`✅ Created assessment template: ${template.name}`);
    }

    // Seed questions
    const allQuestions = [
      ...tradingQuestions,
      ...youtubeQuestions,
      ...newsletterQuestions,
      ...microSaaSQuestions,
    ];

    for (const question of allQuestions) {
      const questionData: any = {
        id: question.id,
        templateId: question.templateId,
        domain: question.domain,
        questionText: question.questionText,
        questionType: question.questionType,
        isRequired: question.isRequired,
        order: question.order,
        weight: question.weight,
      };

      // Handle optional fields
      if ('options' in question) {
        questionData.options = question.options === null ? Prisma.JsonNull : question.options;
      }
      if ('validationRules' in question) {
        questionData.validationRules = question.validationRules === null ? Prisma.JsonNull : question.validationRules;
      }
      if ('helpText' in question) {
        questionData.helpText = question.helpText;
      }
      if ('dependsOn' in question) {
        questionData.dependsOn = question.dependsOn;
      }
      if ('dependsOnAnswer' in question) {
        questionData.dependsOnAnswer = question.dependsOnAnswer === null ? Prisma.JsonNull : question.dependsOnAnswer;
      }
      if ('metadata' in question) {
        questionData.metadata = question.metadata === null ? Prisma.JsonNull : question.metadata;
      }

      await prisma.assessmentQuestion.upsert({
        where: { id: questionData.id },
        update: {},
        create: questionData,
      });
    }
    console.log(`✅ Created ${allQuestions.length} assessment questions`);

    // Seed scoring rules
    for (const rule of scoringRules) {
      await prisma.questionScoringRule.create({
        data: {
          ...rule,
          condition: rule.condition || Prisma.JsonNull,
        },
      });
    }
    console.log(`✅ Created ${scoringRules.length} scoring rules`);

    // Seed plan templates
    for (const template of planTemplates) {
      const templateData: any = {
        id: template.id,
        name: template.name,
        channel: template.channel,
        templateId: template.templateId,
        minExpertise: template.minExpertise,
        maxExpertise: template.maxExpertise,
        typicalDuration: template.typicalDuration,
        sprintCount: template.sprintCount,
        version: template.version,
        isActive: template.isActive,
        structure: template.structure || Prisma.JsonNull,
        deliverables: template.deliverables || Prisma.JsonNull,
      };

      // Handle optional fields
      if ('description' in template) {
        templateData.description = template.description;
      }
      if ('successRate' in template) {
        templateData.successRate = template.successRate;
      }
      if ('prerequisites' in template) {
        templateData.prerequisites = template.prerequisites === null ? Prisma.JsonNull : template.prerequisites;
      }
      if ('milestones' in template) {
        templateData.milestones = template.milestones === null ? Prisma.JsonNull : template.milestones;
      }

      await prisma.planTemplate.upsert({
        where: { id: templateData.id },
        update: {},
        create: templateData,
      });
      console.log(`✅ Created plan template: ${template.name}`);
    }

    // Seed plan activities
    for (const activity of planActivities) {
      const activityData: any = {
        templateId: activity.templateId,
        name: activity.name,
        description: activity.description,
        type: activity.type,
        phase: activity.phase,
        order: activity.order,
        estimatedHours: activity.estimatedHours,
        difficulty: activity.difficulty,
        dependencies: activity.dependencies,
        successCriteria: activity.successCriteria || Prisma.JsonNull,
      };

      // Handle optional fields
      if ('resources' in activity) {
        activityData.resources = activity.resources === null ? Prisma.JsonNull : activity.resources;
      }
      if ('metadata' in activity) {
        activityData.metadata = activity.metadata === null ? Prisma.JsonNull : activity.metadata;
      }

      await prisma.planActivity.create({
        data: activityData,
      });
    }
    console.log(`✅ Created ${planActivities.length} plan activities`);

    console.log("✨ Assessment data seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding assessment data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAssessmentData()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
