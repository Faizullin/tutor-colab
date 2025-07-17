"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useFirebaseLogin } from "@/hooks/auth"
import { ApiError } from "@/lib/exception"
import useAuthStore from "@/store/userAuthStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

// Zod schema for validation
const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const loginMutation = useFirebaseLogin()
  const { setUser } = useAuthStore()
  const router = useRouter()
  const [error, setError] = useState("")


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // // Mutation for login
  // const mutation = useMutation({
  //   mutationFn: async (data: LoginFormData) => {
  //     const result = await signIn(DEFAULT_FIREBASE_CREDENTIALS_PROVIDER_NAME, {
  //       redirect: false,
  //       email: data.email,
  //       password: data.password,
  //     })
  //     console.log("Login result:", result, data)
  //     if (result?.error) throw new Error(result.error)
  //     return result
  //   },
  //   onSuccess: async () => {
  //     const response = await fetch("/api/auth/session")
  //     const sessionData = await response.json()
  //     setUser(sessionData?.user)
  //     router.push("/")
  //     setTimeout(() => window.location.reload(), 1500)
  //   },
  //   onError: (err: any) => {
  //     setError(err.message || "An unexpected error occurred. Please try again.")
  //   },
  // })

  const onSubmit = (data: LoginFormData) => {
    setError("")
    loginMutation.mutateAsync({
      ...data,
      provider: "email-password",
    }).then((result) => {
      const successFn = async () => {
        const response = await fetch("/api/auth/session")
        const sessionData = await response.json()
        setUser(sessionData?.user)
        router.push("/")
        setTimeout(() => window.location.reload(), 1500)
      }
      if (result?.ok) {
        successFn()
      }
    }).catch(error => {
      if (error instanceof ApiError) {
        if (error.key === "firebase-auth-error") {
          const code = error.details?.code
          let msg: string | null = null;
          if (code === "auth/user-not-found") {
            msg = "No user associated with this email"
          } else if (code === "auth/wrong-password") {
            msg = "Provided password is not valid"
          } else if (code === "auth/invalid-email") {
            msg = "Invalid email address"
          } else if (code === "auth/invalid-credential") {
            msg = "Invalid credentials provided"
          }
          if (msg) {
            setError(msg)
          }
        }
      }
    })
  }

  const handleGoogleSignIn = async () => {
    loginMutation.mutateAsync({
      provider: "google",
    }).then((result) => {
      const successFn = async () => {
        const response = await fetch("/api/auth/session")
        const sessionData = await response.json()
        setUser(sessionData?.user)
        router.push("/")
        setTimeout(() => window.location.reload(), 1500)
      }
      if (result?.ok) {
        successFn()
      }
    }).catch(error => {
      if (error instanceof ApiError) {
        if (error.key === "firebase-auth-error") {
          const code = error.details?.code
          let msg: string | null = null;
          if (code === "auth/user-not-found") {
            msg = "No user associated with this email"
          } else if (code === "auth/wrong-password") {
            msg = "Provided password is not valid"
          } else if (code === "auth/invalid-email") {
            msg = "Invalid email address"
          } else if (code === "auth/invalid-credential") {
            msg = "Invalid credentials provided"
          }
          if (msg) {
            setError(msg)
          }
        }
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1e1e1e] p-4">
      <Card className="w-full max-w-md bg-[#1e1e1e] text-white border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || Object.keys(errors).length > 0) && (
            <Alert variant="destructive" className="mb-6 bg-red-900 border-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error ||
                  errors.email?.message ||
                  errors.password?.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                required
                disabled={isSubmitting || loginMutation.isPending}
                placeholder="Enter your email"
                className="w-full bg-[#252525] text-white border-gray-800 focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <a href="/auth/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                required
                disabled={isSubmitting || loginMutation.isPending}
                placeholder="Enter your password"
                className="w-full bg-[#252525] text-white border-gray-800 focus:border-emerald-400"
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {(isSubmitting || loginMutation.isPending) ? "Signing in..." : "Sign in"}
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
              type="button"
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full bg-[#f6f5f5] text-black border-gray-800 hover:bg-[#cacaca]"
              disabled={isSubmitting || loginMutation.isPending}
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}