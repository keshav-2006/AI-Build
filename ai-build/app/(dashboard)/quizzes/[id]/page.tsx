"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import type { Quiz } from "@/lib/types"

export default function QuizPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    async function fetchQuiz() {
      if (!user) return

      try {
        const quizDoc = await getDoc(doc(db, "quizzes", params.id))

        if (quizDoc.exists()) {
          const quizData = quizDoc.data() as Quiz

          // Check if quiz belongs to current user
          if (quizData.userId !== user.uid) {
            router.push("/quizzes")
            return
          }

          setQuiz(quizData)

          // If quiz is already completed, set the state accordingly
          if (quizData.completedAt) {
            setQuizCompleted(true)
            setScore(quizData.score || 0)

            // Reconstruct user answers
            const answers: Record<string, string> = {}
            quizData.questions.forEach((q) => {
              if (q.userAnswer) {
                answers[q.id] = q.userAnswer
              }
            })
            setUserAnswers(answers)
          }
        } else {
          router.push("/quizzes")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching quiz:", error)
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [user, params.id, router])

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleNextQuestion = () => {
    if (!quiz) return

    // Save the answer
    const currentQuestion = quiz.questions[currentQuestionIndex]
    const updatedAnswers = {
      ...userAnswers,
      [currentQuestion.id]: selectedAnswer,
    }
    setUserAnswers(updatedAnswers)

    // Move to next question or complete quiz
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer("")
    } else {
      completeQuiz(updatedAnswers)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)

      // Restore previous answer if it exists
      const prevQuestion = quiz?.questions[currentQuestionIndex - 1]
      if (prevQuestion) {
        setSelectedAnswer(userAnswers[prevQuestion.id] || "")
      }
    }
  }

  const completeQuiz = async (finalAnswers: Record<string, string>) => {
    if (!quiz || !user) return

    // Calculate score
    let correctAnswers = 0
    const updatedQuestions = quiz.questions.map((question) => {
      const userAnswer = finalAnswers[question.id]
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) {
        correctAnswers++
      }

      return {
        ...question,
        userAnswer,
        isCorrect,
      }
    })

    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)

    // Update quiz in Firestore
    try {
      await updateDoc(doc(db, "quizzes", params.id), {
        questions: updatedQuestions,
        completedAt: new Date(),
        score: finalScore,
      })

      // Update local state
      setQuiz({
        ...quiz,
        questions: updatedQuestions,
        completedAt: new Date(),
        score: finalScore,
      })
      setQuizCompleted(true)
      setScore(finalScore)
    } catch (error) {
      console.error("Error completing quiz:", error)
    }
  }

  if (loading) {
    return (
      <div className="container py-6 flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Quiz not found</h1>
        <Button onClick={() => router.push("/quizzes")}>Back to Quizzes</Button>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        {!quizCompleted && (
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        )}
      </div>

      {!quizCompleted ? (
        <>
          <Progress value={progress} className="mb-6" />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect} className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button onClick={handleNextQuestion} disabled={!selectedAnswer}>
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Complete Quiz"
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>You scored {score}% on this quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={score} className="h-2" />
              </div>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">
                        {index + 1}. {question.question}
                      </h3>
                      {question.isCorrect ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded-md ${
                            option === question.correctAnswer
                              ? "bg-green-100 dark:bg-green-900/20"
                              : option === question.userAnswer && option !== question.correctAnswer
                                ? "bg-red-100 dark:bg-red-900/20"
                                : "bg-muted/50"
                          }`}
                        >
                          {option}
                          {option === question.correctAnswer && (
                            <span className="ml-2 text-sm text-green-600 dark:text-green-400">(Correct Answer)</span>
                          )}
                          {option === question.userAnswer && option !== question.correctAnswer && (
                            <span className="ml-2 text-sm text-red-600 dark:text-red-400">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/quizzes")} className="mr-2">
                Create New Quiz
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}

