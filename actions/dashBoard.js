"use server";

import { db } from "@/lib/inngest/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the model name and API key are valid
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Ensure this model is correct and available
});

export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }

    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;

  try {
    // Handle the API request
    const result = await model.generateContent({ prompt });

    // Log the result for debugging (optional, for better visibility)
    console.log("Generated content response:", result);

    // Ensure the result contains a valid response
    if (!result || !result.response || !result.response.text) {
      throw new Error("Invalid response format from AI.");
    }

    // Access the content and clean it up if necessary
    const text = await result.response.text(); // Adjust depending on actual response format

    // Clean up response if it includes code blocks or markdown
    const cleanedText = text.replace(/```(?:json)?|```/g, "").trim();

    // Parse the JSON
    const insights = JSON.parse(cleanedText);

    // Validate the insights to ensure they have the required fields
    if (!insights.salaryRanges || !Array.isArray(insights.salaryRanges)) {
      throw new Error("Invalid salaryRanges in insights.");
    }
    if (typeof insights.growthRate !== 'number') {
      throw new Error("Invalid growthRate in insights.");
    }
    if (!['High', 'Medium', 'Low'].includes(insights.demandLevel)) {
      throw new Error("Invalid demandLevel in insights.");
    }
    if (!Array.isArray(insights.topSkills)) {
      throw new Error("Invalid topSkills in insights.");
    }
    if (!Array.isArray(insights.keyTrends)) {
      throw new Error("Invalid keyTrends in insights.");
    }
    if (!Array.isArray(insights.recommendedSkills)) {
      throw new Error("Invalid recommendedSkills in insights.");
    }

    return insights; 
  } catch (error) {
    console.error("Error generating AI insights:", error.message);
    throw new Error("Failed to generate insights.");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) throw new Error("User not found");
  if (!user.industry) throw new Error("User industry not set");

  // If no industry insight exists, generate it
  if (!user.industryInsight) {
    try {
      const insights = await generateAIInsights(user.industry);

      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          salaryRanges: insights.salaryRanges ?? [],
          growthRate: insights.growthRate ?? 0,
          demandLevel: insights.demandLevel ?? "MEDIUM",
          topSkills: insights.topSkills ?? [],
          marketOutlook: insights.marketOutlook ?? "NEUTRAL",
          keyTrends: insights.keyTrends ?? [],
          recommendedSkills: insights.recommendedSkills ?? [],
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Set next update time (1 week later)
        },
      });

      return industryInsight;
    } catch (error) {
      console.error("Error generating or saving industry insights:", error.message);
      throw new Error("Failed to generate or save industry insights.");
    }
  }

  // Return the existing industry insight if available
  return user.industryInsight;
}
