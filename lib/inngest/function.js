import { db } from "./prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event, step }) => {
    // Step 1: Fetch all industries
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      // Skip any null or invalid industry values
      if (!industry || typeof industry !== "string") {
        console.warn("Skipping entry with invalid industry:", industry);
        continue;
      }

      // Step 2: Prompt Gemini to generate insights
      const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "HIGH" | "MEDIUM" | "LOW",
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "keyTrends": ["trend1", "trend2", "trend3", "trend4", "trend5"],
  "recommendedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}

IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
Include at least 5 common roles for salaryRanges.
Growth rate should be a percentage (e.g., 15 for 15%).
`;

      const res = await step.ai.wrap(
        "gemini",
        async (promptText) => {
          return await model.generateContent(promptText);
        },
        prompt
      );

      const rawText = res.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Step 3: Clean and parse JSON
      const cleanedText = rawText.replace(/```(?:json)?|```/g, "").trim();

      let insights;
      try {
        insights = JSON.parse(cleanedText);
      } catch (error) {
        console.error(`❌ Error parsing JSON for industry '${industry}':`, error);
        continue; // Skip this industry if the JSON is bad
      }

      // Step 4: Validate enums
      const demandLevel = insights.demandLevel?.toUpperCase();
      const marketOutlook = insights.marketOutlook?.toUpperCase();

      const validDemandLevels = ["HIGH", "MEDIUM", "LOW"];
      const validMarketOutlooks = ["POSITIVE", "NEUTRAL", "NEGATIVE"];

      if (!validDemandLevels.includes(demandLevel) || !validMarketOutlooks.includes(marketOutlook)) {
        console.error(`❌ Invalid enums for '${industry}':`, {
          demandLevel,
          marketOutlook,
        });
        continue; // Skip if enums are invalid
      }

      // Step 5: Upsert the insights
      await step.run(`Upsert insights for ${industry}`, async () => {
        await db.industryInsight.upsert({
          where: { industry },
          update: {
            salaryRanges: insights.salaryRanges,
            growthRate: insights.growthRate,
            demandLevel,
            topSkills: insights.topSkills,
            marketOutlook,
            keyTrends: insights.keyTrends,
            recommendedSkills: insights.recommendedSkills,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
          },
          create: {
            industry,
            salaryRanges: insights.salaryRanges,
            growthRate: insights.growthRate,
            demandLevel,
            topSkills: insights.topSkills,
            marketOutlook,
            keyTrends: insights.keyTrends,
            recommendedSkills: insights.recommendedSkills,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
          },
        });
      });
    }
  }
);
