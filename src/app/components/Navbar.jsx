'use client'
import React from 'react'
import Link from 'next/link'
import { PackageIcon, Search, ShoppingCart } from "lucide-react";
import { useAuth } from '../../../context/AuthProvider';
import { useRouter } from 'next/navigation';

function Navbar() {
    const {user,logout,isLogin}=useAuth()
    const router=useRouter();

    const handleLogout=()=>{
        logout();
        

    }
  return (
    <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                        <span className="text-green-600">Shop</span>sy<span className="text-green-600 text-5xl leading-0">.</span>
                        <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                            plus
                        </p>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form  className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products"  required />
                        </form>

                        <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full cursor-pointer">0</button>
                        </Link>

                       {
                         isLogin ? (
                             
                        <button onClick={handleLogout} className="px-8 py-2 bg-red-400 hover:bg-red-600 transition text-white rounded-md hover:shadow-gray-400 hover:shadow-sm cursor-pointer" >
                            logout
                        </button>
                    
                        ):(
                            <Link href="/register">
                        <button  className="px-8 py-2 bg-gray-700 hover:bg-gray-900 transition text-white rounded-md hover:shadow-gray-400 hover:shadow-sm cursor-pointer" >
                            Register
                        </button>
                            </Link>
                        
                        )
                       }
                        

                    </div>

                    {/* Mobile User Button  */}
                    <div className="sm:hidden">
                        
                            
                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
  )
}

export default Navbar
