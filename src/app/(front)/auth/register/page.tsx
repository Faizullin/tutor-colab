"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import useAuthStore from "@/store/userAuthStore"

const RegisterPage = () => {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // After successful registration, sign in
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        throw new Error("Failed to sign in after registration")
      }

      setUser(data.user)
      router.push("/")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      })
      if (result?.error) {
        setError("Failed to sign in with Google")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      const result = await signIn("github", {
        callbackUrl: "/",
        redirect: true,
      })
      if (result?.error) {
        setError("Failed to sign in with GitHub")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-[#1e1e1e] text-white border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to CodeX</CardTitle>
          <CardDescription className="text-center text-gray-400">Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900 border-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Choose a username"
                type="text"
                required
                disabled={isLoading}
                className="w-full bg-[#252525] text-white border-gray-800 focus:border-emerald-400"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                required
                disabled={isLoading}
                className="w-full bg-[#252525] text-white border-gray-800 focus:border-emerald-400"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                placeholder="Create a password (min. 6 characters)"
                type="password"
                required
                minLength={6}
                disabled={isLoading}
                className="w-full bg-[#252525] text-white border-gray-800 focus:border-emerald-400"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator className="bg-gray-800" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-[#1e1e1e] px-2 text-gray-400 text-sm">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full bg-[#f6f5f5] text-black border-gray-800 hover:bg-[#cacaca]"
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <Button
              onClick={handleGitHubSignIn}
              variant="outline"
              className="w-full bg-[#f6f5f5] text-black border-gray-800 hover:bg-[#cacaca]"
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Sign in with GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RegisterPage