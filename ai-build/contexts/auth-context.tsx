"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        createdAt: new Date().toISOString(),
        quizzes: [],
        totalQuizzes: 0,
        averageScore: 0,
      })

      setUser(userCredential.user)
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setUser(userCredential.user)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!user) return

    try {
      await updateProfile(user, {
        displayName,
        ...(photoURL && { photoURL }),
      })

      // Update user document in Firestore
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName,
          ...(photoURL && { photoURL }),
        },
        { merge: true },
      )

      // Force refresh the user object
      setUser({ ...user, displayName, ...(photoURL && { photoURL }) })
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

