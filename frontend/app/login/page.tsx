'use client';

import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/'); // 👈 Si ya está logueado, fuera de aquí
    }
  }, [user, loading, router]);

  // Mientras verifica la sesión, mostramos un estado limpio
  if (loading && !user) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return <LoginForm />;
}