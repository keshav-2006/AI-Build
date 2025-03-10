import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { subject, difficulty, numberOfQuestions } = await req.json()

    const prompt = `Generate a quiz about ${subject} with ${numberOfQuestions} multiple-choice questions at ${difficulty} difficulty level. 
    Format the response as a JSON object with the following structure:
    {
      "title": "Quiz title",
      "subject": "${subject}",
      "questions": [
        {
          "id": "1",
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The correct option"
        }
      ]
    }
    Make sure the questions are challenging but fair, and cover important concepts in ${subject}.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse the JSON response
    const quizData = JSON.parse(text)

    return NextResponse.json(quizData)
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json({ error: "An error occurred while generating the quiz" }, { status: 500 })
  }
}

