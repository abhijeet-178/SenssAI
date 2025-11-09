// app/api/quiz/route.ts
import { NextResponse } from "next/server";
import { generateQuiz } from "@/actions/interview"; // server-only function

export async function GET() {
  try {
    const quiz = await generateQuiz();
    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
