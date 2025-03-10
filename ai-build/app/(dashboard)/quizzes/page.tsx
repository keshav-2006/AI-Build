"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Quiz } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export default function QuizzesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [customSubject, setCustomSubject] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [numberOfQuestions, setNumberOfQuestions] = useState("5")
  const [loading, setLoading] = useState(false)

  const handleCreateQuiz = async () => {
    if (!user) return

    const finalSubject = subject === "custom" ? customSubject : subject
    if (!finalSubject) return

    setLoading(true)

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: finalSubject,
          difficulty,
          numberOfQuestions: Number.parseInt(numberOfQuestions),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate quiz")
      }

      const quizData = await response.json()

      // Add quiz to Firestore
      const quizWithMeta: Quiz = {
        id: uuidv4(),
        ...quizData,
        createdAt: new Date(),
        totalQuestions: quizData.questions.length,
        userId: user.uid,
      }

      const docRef = await addDoc(collection(db, "quizzes"), {
        ...quizWithMeta,
        createdAt: serverTimestamp(),
      })

      // Navigate to the quiz
      router.push(`/quizzes/${docRef.id}`)
    } catch (error) {
      console.error("Error creating quiz:", error)
      setLoading(false)
    }
  }

  const subjects = [
    { value: "mathematics", label: "Mathematics" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "biology", label: "Biology" },
    { value: "history", label: "History" },
    { value: "geography", label: "Geography" },
    { value: "literature", label: "Literature" },
    { value: "computer_science", label: "Computer Science" },
    { value: "custom", label: "Custom Subject" },
  ]

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Create a Quiz</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>Configure your quiz parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {subject === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customSubject">Custom Subject</Label>
                <Input
                  id="customSubject"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter a subject"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questions">Number of Questions</Label>
              <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions}>
                <SelectTrigger id="questions">
                  <SelectValue placeholder="Select number of questions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateQuiz}
              disabled={loading || !subject || (subject === "custom" && !customSubject)}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                "Create Quiz"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Information</CardTitle>
            <CardDescription>How our quizzes work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Adaptive Learning</h3>
              <p className="text-sm text-muted-foreground">
                Our AI generates quizzes tailored to your selected subject and difficulty level. Each quiz is unique and
                designed to test your knowledge effectively.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Performance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                After completing a quiz, you'll receive detailed feedback on your performance. Your results are saved to
                track your progress over time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Subject Variety</h3>
              <p className="text-sm text-muted-foreground">
                Choose from our predefined subjects or create a custom subject to test your knowledge in any area you're
                studying.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

