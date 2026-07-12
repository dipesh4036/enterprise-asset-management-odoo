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
    <Card className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm">
      <CardHeader className="space-y-1.5 text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
          Create Account
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sign up to join your company resource directory
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none" />
              <Input
                type="text"
                placeholder="John Doe"
                className="pl-10"
                {...register("name")}
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none" />
              <Input
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                {...register("email")}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/60 pointer-events-none" />
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
                className="absolute right-3 top-2.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">
                {errors.password.message}
              </p>
            )}

            {/* Password Strength Meter */}
            {passwordValue && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Password Strength:</span>
                  <span className={cn("font-semibold", 
                    passwordStrength.label === "Weak" && "text-rose-550",
                    passwordStrength.label === "Medium" && "text-amber-550",
                    passwordStrength.label === "Strong" && "text-blue-550",
                    passwordStrength.label === "Very Strong" && "text-emerald-550",
                  )}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="flex h-1 gap-1 w-full bg-muted rounded-full overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-full flex-1 transition-all duration-300 rounded-full",
                        i < passwordStrength.score ? passwordStrength.color : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full h-9 cursor-pointer mt-2" disabled={isLoading}>
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

      <CardFooter className="flex justify-center text-xs text-muted-foreground pb-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="ml-1 font-semibold text-primary hover:underline"
        >
          Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
