"use client";

import LoginForm from "@/features/auth/components/LoginForm";
import { LoginInput } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const loginMutation = useLogin();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (data: LoginInput) => {
    setError(null);
    loginMutation.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || err.message || "Invalid email or password");
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <LoginForm
        onSubmit={handleLoginSubmit}
        isLoading={loginMutation.isPending}
        error={error}
      />
    </div>
  );
}
