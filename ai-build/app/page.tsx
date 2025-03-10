import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, MessageSquare, Trophy } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Study Mitra</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/20 to-background">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Your AI-Powered <span className="text-primary">Study Assistant</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10">
              Study Mitra helps you learn faster, test your knowledge with AI-generated quizzes, and track your progress
              over time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Supercharge Your Learning</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Chat Assistant</h3>
                <p className="text-muted-foreground">
                  Get instant answers to your questions and explanations on any subject with our AI-powered chat
                  assistant.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Quizzes</h3>
                <p className="text-muted-foreground">
                  Generate personalized quizzes on any subject to test your knowledge and identify areas for
                  improvement.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-muted-foreground">
                  Track your quiz scores and learning progress over time with detailed analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How Study Mitra Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Ask Questions</h3>
                <p className="text-muted-foreground">
                  Chat with our AI assistant to get help with any subject or topic you're studying.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Generate Quizzes</h3>
                <p className="text-muted-foreground">
                  Create custom quizzes to test your knowledge and reinforce your learning.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your performance and see how your knowledge improves over time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Boost Your Learning?</h2>
            <p className="text-xl max-w-2xl mb-10 text-primary-foreground/90">
              Join Study Mitra today and experience the power of AI-assisted learning.
            </p>
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-14">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Study Mitra. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

