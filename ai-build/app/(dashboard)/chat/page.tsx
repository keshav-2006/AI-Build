"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send } from "lucide-react"
import type { Message } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import ReactMarkdown from "react-markdown"

export default function ChatPage() {
  const { user } = useAuth()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "chats", user.uid, "messages"), orderBy("createdAt", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[]

      setMessages(messagesData)
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
      createdAt: new Date(),
    }

    // Add user message to Firestore
    await addDoc(collection(db, "chats", user.uid, "messages"), {
      ...userMessage,
      createdAt: serverTimestamp(),
    })

    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message to Firestore
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.response,
        createdAt: new Date(),
      }

      await addDoc(collection(db, "chats", user.uid, "messages"), {
        ...assistantMessage,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <h1 className="text-3xl font-bold mb-6">Chat with Study Mitra</h1>

      <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-muted/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-xl font-semibold mb-2">Welcome to Study Mitra!</h2>
            <p className="text-muted-foreground mb-4">
              Ask me anything about your studies, or request a quiz to test your knowledge.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md">
              <Button variant="outline" onClick={() => setInput("Explain the concept of photosynthesis")}>
                Explain photosynthesis
              </Button>
              <Button variant="outline" onClick={() => setInput("What are Newton's laws of motion?")}>
                Newton's laws
              </Button>
              <Button variant="outline" onClick={() => setInput("Help me understand quadratic equations")}>
                Quadratic equations
              </Button>
              <Button variant="outline" onClick={() => setInput("Create a quiz about world history")}>
                Quiz on world history
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id} className={`chat-bubble ${message.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                {message.role === "user" ? (
                  <div>{message.content}</div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot-bubble">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Study Mitra anything..."
          className="flex-1 resize-none"
          rows={2}
          disabled={loading}
        />
        <Button type="submit" size="icon" disabled={!input.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

