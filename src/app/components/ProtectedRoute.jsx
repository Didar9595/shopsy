"use client";

import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Show a loading indicator while checking auth state
  if (loading || !user) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return children;
}
