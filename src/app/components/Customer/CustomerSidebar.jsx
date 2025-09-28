"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, ShoppingBag, ShoppingCart, Heart } from "lucide-react";

export default function CustomerSidebar({ onLinkClick }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const tabFromUrl = urlParams.get("tab");
    setTab(tabFromUrl || "greet");
  }, [searchParams]);

  const links = [
    { href: "/dashboard/customer?tab=greet", label: "Main", icon: User },
    { href: "/dashboard/customer?tab=profile", label: "My Profile", icon: User },
    { href: "/dashboard/customer?tab=orders", label: "My Orders", icon: ShoppingBag },
    { href: "/dashboard/customer?tab=cart", label: "Cart", icon: ShoppingCart },
    { href: "/dashboard/customer?tab=wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <aside className="h-full bg-gray-800 text-white w-64 flex-shrink-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Customer Panel
      </div>
      <nav className="p-2 flex flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = tab === href.split("tab=")[1];
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
