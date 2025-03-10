import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const lastMessage = messages[messages.length - 1].content
    const previousMessages = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: `You are Study Mitra, an educational assistant designed to help students learn various subjects. 
          You provide clear, concise explanations and can generate quizzes to test knowledge.
          Always be helpful, accurate, and encouraging. If you don't know something, admit it rather than making up information.
          Format your responses using Markdown for better readability.`,
        },
        ...previousMessages,
        { role: "user", content: lastMessage },
      ],
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}

