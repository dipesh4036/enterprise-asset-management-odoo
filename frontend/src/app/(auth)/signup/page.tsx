"use client";

import SignupForm from "@/features/auth/components/SignupForm";
import { SignupInput } from "@/features/auth/schema";
import { useSignup } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
  const signupMutation = useSignup();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSignupSubmit = async (data: SignupInput) => {
    setError(null);
    signupMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || err.message || "Failed to create account");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <SignupForm
        onSubmit={handleSignupSubmit}
        isLoading={signupMutation.isPending}
        error={error}
      />
    </div>
  );
}
