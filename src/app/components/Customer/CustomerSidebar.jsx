"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User, ShoppingBag, ShoppingCart, Heart,Menu,X } from "lucide-react";

export default function CustomerSidebar({ onLinkClick }) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("");
    const [menuOpen,setMenuOpen]=useState(false);


  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const tabFromUrl = urlParams.get("tab");
    setTab(tabFromUrl || "greet");
  }, [searchParams]);

  const links = [
    { href: "/dashboard/customer?tab=greet", label: "Dashboard", icon: User },
    { href: "/dashboard/customer?tab=profile", label: "My Profile", icon: User },
    { href: "/dashboard/customer?tab=orders", label: "My Orders", icon: ShoppingBag },
    { href: "/dashboard/customer?tab=cart", label: "Cart", icon: ShoppingCart },
    { href: "/dashboard/customer?tab=wishlist", label: "Wishlist", icon: Heart },
  ];

  return (
    <div className="h-full">
      <aside className="md:block hidden h-full bg-gray-800 text-white w-64 flex-shrink-0">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Customer Panel
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
    
    
    
    <aside className="block md:hidden h-[fit-content] bg-gray-800 text-white w-[full]">
      <div className="flex flex-row justify-between items-center p-2">
        <div className="p-4 text-2xl font-bold">
        Customer Panel
      </div>
      {
        menuOpen?(
          <X size={24} className="text-rose-400 cursor-pointer" onClick={()=>setMenuOpen(false)}/>
        ):(
          <Menu size={24} className="cursor-pointer hover:text-green-500" onClick={()=>setMenuOpen(true)}/>
        )
      }
      </div>
      <nav className={`p-2 flex flex-col gap-2 ${menuOpen ? "block" : "hidden"}`}>
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
    </div>
  );
}
