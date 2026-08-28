// components/auth/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Selama masih cek status login, tampilkan loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </div>
    );
  }

  // Kalau belum login, jangan render apapun (sambil nunggu redirect)
  if (!user) {
    return null;
  }

  return <>{children}</>;
}