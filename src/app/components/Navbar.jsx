"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PackageIcon, Search, ShoppingCart, Menu, X, LogOut, Handbag, LayoutDashboard, CircleAlert, House, Heart } from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";

function Navbar() {
  const { user, logout, isLogin } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  const [search,setSearch]=useState("")

  //fetch cart count
  const fetchCartCount = async () => {
    try {
      if (!localStorage.getItem("token")) return;
      const res = await fetch("/api/cart", {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.count || 0);
      }
    } catch (err) {
      console.error("Error fetching cart count:", err);
    }
  };
  useEffect(() => {
    if (isLogin) fetchCartCount();
    else setCartCount(0); // reset when logged out
  }, [isLogin]);
  useEffect(() => {
    const listener = () => fetchCartCount();
    window.addEventListener("cartUpdated", listener);
    return () => window.removeEventListener("cartUpdated", listener);
  }, []);


  const handleLogout = () => {
    setCartCount(0);
    logout();
    setOpen(false);
  };

  const dashboardLink =
    user?.role === "admin"
      ? "/dashboard/admin"
      : user?.role === "seller"
        ? "/dashboard/seller"
        : "/dashboard/customer";

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4 transition-all">
          {/* Logo */}
          <Link
            href="/"
            className="relative text-4xl font-semibold text-slate-700"
          >
            <span className="text-green-600">Shop</span>sy
            <span className="text-green-600 text-5xl leading-0">.</span>
            <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
              plus
            </p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            {isLogin && <Link href="/wishlist">Wishlist</Link>}
            {isLogin && <Link href="/order">Orders</Link>}
            {isLogin && <Link href={dashboardLink}>Dashboard</Link>}


            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value.trim();

                if (query) router.push(`/search?query=${encodeURIComponent(query)}`);
                setSearch("")
              }}
              className="hidden md:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />
              <input
                name="search"
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                required
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
            </form>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600"
            >
              <ShoppingCart size={18} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLogin ? (
              <p onClick={handleLogout} className="w-[fit-content] p-2 flex flex-row items-center justify-center gap-2 cursor-pointer text-rose-500"> <LogOut size={16} /> Logout</p>
            ) : (
              <Link href="/login">
                <button className="px-8 py-2 bg-gray-700 hover:bg-gray-900 transition text-white rounded-md hover:shadow-gray-400 hover:shadow-sm cursor-pointer">
                  Login
                </button>
              </Link>
            )}
          </div>

           <Search size={28} className="text-slate-700 md:hidden"  onClick={()=>router.push('/search')}/>
          {/* Mobile Menu Button */}
          <div className="sm:hidden">
           
            <button onClick={() => setOpen(true)}>
              <Menu size={28} className="text-slate-700" />
            </button>
             
          </div>
         
        </div>
      </div>
      <hr className="border-gray-300" />

      {/* ===== Mobile Sidebar ===== */}
      {open && (
        <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-md">
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6 flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-semibold">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X size={26} className="text-slate-700" />
              </button>
            </div>

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="hover:text-green-600 flex items-center gap-2"
            >
              <House /> Home
            </Link>

          
              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="hover:text-green-600 flex items-center gap-2"
              >
                <CircleAlert /> About
              </Link>
            

            {
              isLogin &&
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="hover:text-green-600 flex items-center gap-2"
              >
                <Heart /> Wishlist
              </Link>
            }

            {
              isLogin &&
              <Link
                href="/order"
                onClick={() => setOpen(false)}
                className="hover:text-green-600 flex items-center gap-2"
              >
                <ShoppingCart /> Order
              </Link>
            }

            <Link
              href={dashboardLink}
              onClick={() => setOpen(false)}
              className="hover:text-green-600 flex items-center gap-2"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="hover:text-green-600 flex items-center gap-2">
              <ShoppingCart size={18} /> Cart
              {cartCount > 0 && (
                <span className="ml-auto text-xs font-semibold text-white bg-slate-600 px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLogin ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-400 hover:bg-red-600 text-white rounded-md"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-900 text-white text-center rounded-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
