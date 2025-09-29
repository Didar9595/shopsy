"use client";

import { useState, useEffect,Suspense } from "react";
import CustomerSidebar from "@/app/components/Customer/CustomerSidebar";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import RoleRoute from "@/app/components/RoleRoute";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Import your tab components
import Greet from "./tabs/greet";
import ProfilePage from "@/app/profile/page";
// import CustomerOrders from "./tabs/orders";
// import CustomerCart from "./tabs/cart";
// import CustomerWishlist from "./tabs/wishlist";

function CustomerDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("greet"); // default tab
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) setTab(tabFromUrl);
    else setTab("greet");
  }, [searchParams]);

  return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
          {/* ===== Desktop Sidebar ===== */}
          <div className="">
            <CustomerSidebar />
          </div>

          

          {/* ===== Main Content ===== */}
          <div className="flex-1 flex flex-col p-4">
            {tab === "greet" && <Greet />}
            {tab === "profile" && <ProfilePage />}
            {tab === "orders" && <CustomerOrders />}
            {tab === "cart" && <CustomerCart />}
            {tab === "wishlist" && <CustomerWishlist />}
          </div>
        </div>
      
  );
}


export default function Customer(){
  return(
    <ProtectedRoute>
      <RoleRoute allowedRoles={["customer"]}>
        <Suspense fallback={<div>Loading dashboard…</div>}>
         <CustomerDashboard/>
        </Suspense>
      </RoleRoute>
      </ProtectedRoute>
  )
}