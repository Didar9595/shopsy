"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Users, User, Store, Package, ShoppingBag } from "lucide-react";

export default function AdminSidebar({ onLinkClick }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const tabFromUrl = urlParams.get("tab");
    setTab(tabFromUrl || "greet"); // default to profile
  }, [searchParams]);

  const links = [
         { href: "/dashboard/admin?tab=greet", label: "Main", icon: User },
    { href: "/dashboard/admin?tab=profile", label: "My Profile", icon: User },
    { href: "/dashboard/admin?tab=users", label: "Users", icon: Users },
    { href: "/dashboard/admin?tab=requests", label: "Seller Requests", icon: Store },
    { href: "/dashboard/admin?tab=products", label: "Products", icon: Package },
    { href: "/dashboard/admin?tab=orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <aside className="h-full bg-gray-800 text-white w-64 flex-shrink-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="p-2 flex flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = tab === href.split("tab=")[1]; // compare query param
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition cursor-pointer
                ${isActive ? "bg-gray-700 text-green-400" : "hover:bg-gray-700"}`}
            >
              <Icon size={18} /> {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
