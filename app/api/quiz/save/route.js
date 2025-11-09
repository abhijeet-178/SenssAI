// sensai/app/api/quiz/save/route.js
import { NextResponse } from "next/server";
import { saveQuizResult } from "@/actions/interview";

export async function POST(req) {
  try {
    const body = await req.json();
    const { quizData, answers, score } = body;

    const result = await saveQuizResult(quizData, answers, score);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving quiz result:", error);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
