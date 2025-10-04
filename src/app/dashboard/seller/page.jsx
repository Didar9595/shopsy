"use client";

import { useState,useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import RoleRoute from "@/app/components/RoleRoute";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Greet from './tabs/greet'
import ProfilePage from "@/app/profile/page";
import { Suspense } from "react";
import SellerSidebar from "@/app/components/Seller/SellerSidebar";


 function AdminDashboard() {
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
    else setTab("greet")
  },[searchParams])

  return (
   
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
          {/* ===== Desktop Sidebar ===== */}
          <div className="">
              <SellerSidebar />
          </div>

     

          {/* ===== Main Content ===== */}
          <div className="flex-1 flex flex-col">
            {tab==='greet' && <Greet/>}
             {tab==='profile' && <ProfilePage/>}
             {tab==='posts' && <DashPosts/>}
             {tab==='users' && <DashUsers/>}
             {tab==='dash' && <DashboardComp/>}
           
          </div>
        </div>
    
  );
}


export default function Admin(){
  return(
     <ProtectedRoute>
      <RoleRoute allowedRoles={["seller"]}>
        <Suspense fallback={<div>Loading dashboard…</div>}>
          <AdminDashboard/>
        </Suspense>
      </RoleRoute>
      </ProtectedRoute>
  )
}