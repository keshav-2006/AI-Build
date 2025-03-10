"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Brain, Trophy } from "lucide-react"
import type { Quiz } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    completedQuizzes: 0,
    subjects: new Set<string>(),
  })

  useEffect(() => {
    async function fetchQuizzes() {
      if (!user) return

      try {
        const q = query(collection(db, "quizzes"), where("userId", "==", user.uid))

        const querySnapshot = await getDocs(q)
        const quizzesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Quiz[]

        setQuizzes(quizzesData)

        // Calculate stats
        const completed = quizzesData.filter((quiz) => quiz.completedAt)
        const subjects = new Set(quizzesData.map((quiz) => quiz.subject))
        const totalScore = completed.reduce((sum, quiz) => sum + (quiz.score || 0), 0)
        const avgScore = completed.length > 0 ? totalScore / completed.length : 0

        setStats({
          totalQuizzes: quizzesData.length,
          averageScore: avgScore,
          completedQuizzes: completed.length,
          subjects,
        })

        setLoading(false)
      } catch (error) {
        console.error("Error fetching quizzes:", error)
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [user])

  const recentQuizzes = [...quizzes]
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : new Date(a.createdAt).getTime()
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, 5)

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">{stats.completedQuizzes} completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageScore)}%</div>
            <Progress value={stats.averageScore} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subjects.size}</div>
            <p className="text-xs text-muted-foreground">Across {stats.totalQuizzes} quizzes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Quizzes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          {recentQuizzes.length > 0 ? (
            recentQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>
                    Subject: {quiz.subject} • {quiz.totalQuestions} questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      {quiz.completedAt ? (
                        <div className="flex flex-col gap-2">
                          <p>Score: {quiz.score}%</p>
                          <Progress value={quiz.score} className="h-2 w-[200px]" />
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Not completed</p>
                      )}
                    </div>
                    <Button asChild>
                      <Link href={`/quizzes/${quiz.id}`}>{quiz.completedAt ? "Review Quiz" : "Continue Quiz"}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No quizzes yet</CardTitle>
                <CardDescription>Start your learning journey by taking a quiz</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/quizzes">Create a Quiz</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your quiz performance across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.subjects.size > 0 ? (
                <div className="space-y-4">
                  {Array.from(stats.subjects).map((subject) => {
                    const subjectQuizzes = quizzes.filter((q) => q.subject === subject && q.completedAt)
                    const subjectAvg =
                      subjectQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / (subjectQuizzes.length || 1)

                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{subject}</span>
                          <span>{Math.round(subjectAvg)}%</span>
                        </div>
                        <Progress value={subjectAvg} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">Complete some quizzes to see your performance</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

