"use client";

import { useState, useEffect } from "react";
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

export default function CustomerDashboard() {
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
    <ProtectedRoute>
      <RoleRoute allowedRoles={["customer"]}>
        <div className="flex min-h-screen bg-gray-100">
          {/* ===== Desktop Sidebar ===== */}
          <div className="hidden md:block">
            <CustomerSidebar />
          </div>

          {/* ===== Mobile Sidebar Overlay ===== */}
          
            <div className="fixed inset-0 z-40 flex md:hidden" >
              <div
                className="fixed inset-0 bg-black/40"
                onClick={() => setMobileOpen(false)}
              />
              <div className="relative z-50 w-64">
                <CustomerSidebar onLinkClick={() => setMobileOpen(false)} />
              </div>
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
      </RoleRoute>
    </ProtectedRoute>
  );
}
