"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db, storage } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import type { UserProfile } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      try {
        const profileDoc = await getDoc(doc(db, "users", user.uid))

        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as UserProfile
          setProfile(profileData)
          setDisplayName(profileData.displayName || user.displayName || "")
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setSaving(true)

    try {
      let photoURL = user.photoURL

      // Upload photo if changed
      if (photoFile) {
        const storageRef = ref(storage, `profile_photos/${user.uid}`)
        await uploadBytes(storageRef, photoFile)
        photoURL = await getDownloadURL(storageRef)
      }

      // Update profile in Firebase Auth and Firestore
      await updateUserProfile(displayName, photoURL || undefined)

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-6 flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoPreview || user?.photoURL || ""} />
                <AvatarFallback className="text-lg">
                  {displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <Label htmlFor="photo" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Upload className="h-4 w-4" />
                    Change Photo
                  </div>
                  <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveProfile} disabled={saving || !displayName.trim()} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Account Created</h3>
              <p className="text-sm text-muted-foreground">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Quiz Statistics</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Total Quizzes:</span> {profile?.totalQuizzes || 0}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Average Score:</span>{" "}
                  {profile?.averageScore ? `${Math.round(profile.averageScore)}%` : "N/A"}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Subjects Studied:</span>{" "}
                  {profile?.subjects?.length ? profile.subjects.join(", ") : "None yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

