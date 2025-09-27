"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin,setIsLogin]=useState(false)
  const router=useRouter()


  // Load user from localStorage when app starts
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
      setIsLogin(true);
    }
    else setLoading(false);
  }, []);

  // Fetch user from /api/auth/me
  const fetchUser = async (token) => {
    try {
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem("token");
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
      setIsLogin(false);
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem("token", token);
    fetchUser(token);
    setIsLogin(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsLogin(false);
    router.push('/login')

  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
