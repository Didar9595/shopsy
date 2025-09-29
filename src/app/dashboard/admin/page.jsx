"use client";

import { useState,useEffect } from "react";
import AdminSidebar from "@/app/components/Admin/AdminSidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import RoleRoute from "@/app/components/RoleRoute";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Greet from './tabs/greet'
import ProfilePage from "@/app/profile/page";
import { Suspense } from "react";


export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
   const searchParams=useSearchParams()
  const [tab,setTab]=useState('')
   const router=useRouter()


  useEffect(()=>{
    const urlParams=new URLSearchParams(searchParams);
    const tabFromUrl=urlParams.get('tab');
    if(tabFromUrl){
      setTab(tabFromUrl)
    }
  },[searchParams])

  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={["admin"]}>
        <div className="flex min-h-screen bg-gray-100">
          {/* ===== Desktop Sidebar ===== */}
          <div className="hidden md:block">
            <Suspense fallback={<div>Loading dashboard…</div>}>
              <AdminSidebar />
            </Suspense>
          </div>

          {/* ===== Mobile Sidebar Overlay ===== */}
          {mobileOpen && (
            <div className="fixed inset-0 z-40 flex">
              <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
              <div className="relative z-50 w-64">
                <Suspense fallback={<div>Loading dashboard…</div>}>
                  <AdminSidebar onLinkClick={() => setMobileOpen(false)} />
                </Suspense>
              </div>
            </div>
          )}

          {/* ===== Main Content ===== */}
          <div className="flex-1 flex flex-col">
            {tab==='greet' && <Greet/>}
             {tab==='profile' && <ProfilePage/>}
             {tab==='posts' && <DashPosts/>}
             {tab==='users' && <DashUsers/>}
             {tab==='dash' && <DashboardComp/>}
           
          </div>
        </div>
      </RoleRoute>
    </ProtectedRoute>
  );
}
