"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { BookOpen, LayoutDashboard, LogOut, MessageSquare, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      href: "/chat",
      label: "Chat",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      href: "/quizzes",
      label: "Quizzes",
      icon: <BookOpen className="mr-2 h-4 w-4" />,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <div className="flex flex-col gap-6 py-4">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="text-xl font-bold text-primary">Study Mitra</span>
          </Link>
          <nav className="flex flex-col gap-3">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
            {user && (
              <Button
                variant="ghost"
                className="flex items-center justify-start px-2"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Button>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  )
}

