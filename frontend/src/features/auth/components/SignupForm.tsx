"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "../schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface SignupFormProps {
  onSubmit: (data: SignupInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function SignupForm({ onSubmit, isLoading, error }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Weak", color: "bg-zinc-200" });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const passwordValue = watch("password", "");

  // Password strength checker logic
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength({ score: 0, label: "Very Weak", color: "bg-zinc-200" });
      return;
    }

    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[a-z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++;

    let label = "Weak";
    let color = "bg-rose-500";

    if (score >= 4) {
      label = "Very Strong";
      color = "bg-emerald-500";
    } else if (score >= 3) {
      label = "Strong";
      color = "bg-blue-500";
    } else if (score >= 2) {
      label = "Medium";
      color = "bg-amber-500";
    }

    setPasswordStrength({ score, label, color });
  }, [passwordValue]);

  return (
    <Card className="w-full max-w-md bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-xl">
      <CardHeader className="space-y-2 text-center pb-2">
        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400">
          Create Account
        </CardTitle>
        <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
          Sign up to join your company resource directory
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="John Doe"
                className="pl-10"
                {...register("name")}
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
              <Input
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...register("password")}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {errors.password.message}
              </p>
            )}

            {/* Password Strength Meter */}
            {passwordValue && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-550 dark:text-zinc-400">Password Strength:</span>
                  <span className={cn("font-semibold", 
                    passwordStrength.label === "Weak" && "text-rose-500",
                    passwordStrength.label === "Medium" && "text-amber-500",
                    passwordStrength.label === "Strong" && "text-blue-500",
                    passwordStrength.label === "Very Strong" && "text-emerald-500",
                  )}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex h-1 gap-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-full flex-1 transition-all duration-300 rounded-full",
                        i < passwordStrength.score ? passwordStrength.color : "bg-zinc-200 dark:bg-zinc-800"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full h-10 cursor-pointer" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-zinc-505 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="ml-1 font-semibold text-zinc-800 dark:text-zinc-300 hover:underline"
        >
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
