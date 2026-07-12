"use client";

import { useState } from "react";
import LoginForm from "@/features/auth/components/LoginForm";
import { LoginInput } from "@/features/auth/schema";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // Temporarily simulate authentication request delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Logged in with credentials:", data);
      
      // Redirect mock
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <LoginForm
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
