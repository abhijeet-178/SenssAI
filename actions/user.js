"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashBoard";
import { db } from "@/lib/inngest/prisma";

// Function to update user profile and industry insights
export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // First check if industry insights already exist
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry insights do not exist, generate and save new insights
        if (!industryInsight) {
          let insights;
          try {
            insights = await generateAIInsights(data.industry);
            console.log("Generated insights:", insights); // For debugging the generated data

            // Ensure casing matches Prisma enum values
            if (insights.demandLevel) {
              insights.demandLevel = insights.demandLevel.toUpperCase();
            }

            if (insights.marketOutlook) {
              insights.marketOutlook = insights.marketOutlook.toUpperCase();
            }

            // Create the industry insights in the database
            industryInsight = await tx.industryInsight.create({
              data: {
                industry: data.industry,
                salaryRanges: insights.salaryRanges ?? [],
                growthRate: insights.growthRate ?? 0,
                demandLevel: insights.demandLevel ?? "MEDIUM",
                topSkills: insights.topSkills ?? [],
                marketOutlook: insights.marketOutlook ?? "NEUTRAL",
                keyTrends: insights.keyTrends ?? [],
                recommendedSkills: insights.recommendedSkills ?? [],
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set next update to 1 week later
              },
            });
          } catch (err) {
            console.error("Error generating AI insights:", err);
            throw new Error("Failed to generate industry insights");
          }
        }

        // Now update the user's profile
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 20000, // Increased timeout for AI insights generation and transaction
      }
    );

    // Revalidate the path to ensure the profile and industry insights are refreshed
    revalidatePath("/");

    return {
      success: true,
      user: result.updatedUser,
      industryInsight: result.industryInsight,
    };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile and industry insights");
  }
}

// Function to get the user's onboarding status
export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    if (!user) throw new Error("User not found");

    return {
      isOnboarded: !!user.industry, // Check if the user has set an industry
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error.message);
    throw new Error("Failed to check onboarding status");
  }
}
