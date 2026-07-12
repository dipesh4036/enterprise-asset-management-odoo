"use client";

import { useState } from "react";
import SignupForm from "@/features/auth/components/SignupForm";
import { SignupInput } from "@/features/auth/schema";
import { toast } from "sonner";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignupSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // Temporarily simulate signup request latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Account signup data:", data);

      toast.success("Account created successfully! Redirecting to login...");
      
      // Simulating success redirect
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <SignupForm
        onSubmit={handleSignupSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
