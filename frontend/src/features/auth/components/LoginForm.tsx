"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "../schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  onSubmit: (data: LoginInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="w-full max-w-md bg-card border border-border rounded-lg shadow-sm">
      <CardHeader className="space-y-1.5 text-center pb-4 pt-6">
        <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your credentials to access your asset portal
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-muted-foreground">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:underline hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
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
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full h-9 cursor-pointer mt-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center text-xs text-muted-foreground pb-6">
        New to AssetFlow?{" "}
        <Link
          href="/signup"
          className="ml-1 font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </CardFooter>
    </Card>
  );
}
