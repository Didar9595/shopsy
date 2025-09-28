"use client";

import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login"); // Not logged in
      } else if (!allowedRoles.includes(user.role)) {
        
        router.replace("/"); // Logged in but not allowed
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return <p className="p-6 text-center">Checking permissions...</p>;
  }

  return children;
}
