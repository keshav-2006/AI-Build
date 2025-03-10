export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface Quiz {
  id: string
  title: string
  subject: string
  questions: Question[]
  createdAt: Date
  completedAt?: Date
  score?: number
  totalQuestions: number
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  userAnswer?: string
  isCorrect?: boolean
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: string
  quizzes: string[] // Quiz IDs
  totalQuizzes: number
  averageScore: number
  subjects?: string[]
}

