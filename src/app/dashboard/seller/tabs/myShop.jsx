"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Store} from 'lucide-react'
import { useAuth } from "../../../../../context/AuthProvider";

export default function MyShop() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {user}=useAuth()


  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch("/api/shops/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`, // token from login
          },
        });
        if (res.ok) {
          const data = await res.json();
          setShop(data.shop);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, []);

   if (loading) {
    return <p className="text-center mt-10">Loading shop details...</p>;
  }

  if (!shop) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Shop Found</h2>
        <p>You don’t have a shop yet. Please request admin approval.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[fit-content] bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow flex items-center justify-between">
        <h1 className="text-xl font-bold flex flex-row items-center gap-2"><Store size={24}/> My Shop</h1>
        <button
          onClick={() => alert("Add Product form opens here")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
        >
          + Add Product
        </button>
      </header>

      {/* Shop Content */}
      <main className="flex-1 p-6">
        <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
          {/* Shop Logo */}
          {shop.shopLogo && (
            <div className="flex justify-center mb-6">
              <img
                src={shop.shopLogo}
                alt="Shop Logo"
                className="w-32 h-32 object-cover rounded-full border"
              />
            </div>
          )}

          {/* Shop Info */}
          <h2 className="text-2xl font-bold text-center mb-2">
            {shop.shopName}
          </h2>
          <p className="text-gray-600 text-center mb-4">
            {shop.shopDescription}
          </p>

          {/* Shop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold text-gray-700">Owner</h3>
              <p>{user?.name || "Unknown"}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p
                className={`font-bold ${
                  shop.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {shop.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>
      </main>
      <div className="flex flex-col gap-3 items-center justify-center p-4">
        <p className="font-bold text-xl">Shop Certificate</p>
        <img src={shop.shopCertificate} alt="certificate" />
      </div>
    </div>
  );
}
