"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail, User, Rocket, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    }
    return checks
  }

  const passwordChecks = validatePassword(formData.password)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!Object.values(passwordChecks).every(Boolean)) {
      setError("Password does not meet security requirements")
      return
    }

    setLoading(true)

    try {
      console.log("Starting signup process for:", formData.email)
      
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      console.log("Auth signup response:", { authData, authError })

      if (authError) {
        console.error("Signup error details:", authError)
        
        // Check for specific error messages
        if (authError.message.includes("User already registered") || 
            authError.message.includes("already exists") ||
            authError.message.includes("already registered") ||
            authError.code === "user_already_registered") {
          setError("An account with this email already exists. Please sign in instead.")
        } else if (authError.message.includes("email") && authError.message.includes("valid")) {
          setError("Please enter a valid email address.")
        } else {
          setError(`Registration failed: ${authError.message}`)
        }
        return
      }

      // Step 2: Create customer record (if auth user was created)
      if (authData.user) {
        console.log("Auth user created, ID:", authData.user.id)
        
        try {
          // Try to create customer record using a direct insert
          const { error: customerError } = await supabase
            .from("customers")
            .insert({
              id: authData.user.id,
              email: formData.email,
              name: formData.fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (customerError) {
            console.error("Customer creation error:", customerError)
            
            // Handle specific customer creation errors
            if (customerError.code === '42501') {
              // RLS policy violation - this means the user might already exist in customers
              // Check if user already has a customer record
              const { data: existingCustomer, error: checkError } = await supabase
                .from("customers")
                .select("id")
                .eq("email", formData.email)
                .single()
              
              if (existingCustomer) {
                // User already has a customer record - this is okay
                console.log("User already has customer record, proceeding with signup")
              } else {
                // RLS policy is blocking the insert - this is a configuration issue
                setError("Account created but there's a configuration issue. Please contact support or try signing in.")
                return
              }
            } else if (customerError.message.includes("duplicate key") || 
                       customerError.code === '23505') {
              // Duplicate key - user already exists in customers table
              console.log("Customer record already exists (trigger may have created it)")
            } else {
              // Other error - log but proceed
              console.warn("Customer creation had an issue:", customerError.message)
            }
          } else {
            console.log("Customer record created successfully")
          }
        } catch (customerErr) {
          console.warn("Customer creation step failed:", customerErr)
          // Continue anyway - the user is created in auth
        }
      }

      // Step 3: Check if email confirmation is needed
      if (authData.user && !authData.session) {
        console.log("User created, email confirmation needed")
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
        return
      }

      // User created and session established (email confirmation disabled)
      console.log("Signup successful, user logged in")
      setSuccess(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err: any) {
      console.error("Unexpected signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,0,0.1)]">
            <CardContent className="pt-12 pb-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </motion.div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
                <p className="text-muted-foreground">
                  Welcome to Area 51, {formData.fullName}. Check your email for verification instructions.
                </p>
              </div>

              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                  <motion.div
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-sm text-muted-foreground">Redirecting to login...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="relative h-20 w-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-primary shadow-[0_0_30px_rgba(0,255,0,0.3)]">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/logo3-1770214165568.PNG?width=160&height=160&resize=contain"
                alt="Area 51 Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-primary mb-2">AREA 51</h1>
          <p className="text-muted-foreground text-sm">Create Your Account</p>
        </motion.div>

        <Card className="border-primary/20 bg-background/80 backdrop-blur-sm shadow-[0_0_40px_rgba(0,255,0,0.1)]">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Join Area 51</CardTitle>
            <CardDescription>
              Create your account to access our menu
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  <User className="h-4 w-4 inline mr-2 text-primary" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="border-primary/20 focus:border-primary focus:ring-primary/20"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  <Mail className="h-4 w-4 inline mr-2 text-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-primary/20 focus:border-primary focus:ring-primary/20"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  <Lock className="h-4 w-4 inline mr-2 text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="border-primary/20 focus:border-primary focus:ring-primary/20 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= Object.values(passwordChecks).filter(Boolean).length
                              ? "bg-primary"
                              : "bg-primary/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center gap-1 ${passwordChecks.length ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordChecks.length ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordChecks.uppercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordChecks.lowercase ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Lowercase
                      </div>
                      <div className={`flex items-center gap-1 ${passwordChecks.number ? "text-primary" : "text-muted-foreground"}`}>
                        {passwordChecks.number ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  <Lock className="h-4 w-4 inline mr-2 text-primary" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className={`border-primary/20 focus:border-primary focus:ring-primary/20 pr-10 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-destructive"
                        : ""
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 shadow-[0_0_20px_rgba(0,255,0,0.3)]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Launch Registration
                  </span>
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Already an agent?</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/10"
                onClick={() => router.push("/login")}
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                Return to Login
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By registering, you agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">256-bit encrypted transmission</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
