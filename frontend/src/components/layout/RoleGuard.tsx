"use client";

import { useAuthStore, Role } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[];
  fallbackUrl?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackUrl = "/dashboard",
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push(fallbackUrl);
    }
  }, [isAuthenticated, user, allowedRoles, router, fallbackUrl]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
