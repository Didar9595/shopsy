"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthProvider";
import { ShoppingBag, Heart, ShoppingCart, CheckCircle, XCircle, Clock, Truck, IndianRupee } from "lucide-react";

function Greet() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerStats() {
      try {
        const res = await fetch("/api/stats/customer", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const json = await res.json();
        if (json.success) setData(json.stats);
      } catch (error) {
        console.error("Failed to fetch customer stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerStats();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center animate-pulse">
        Loading your dashboard...
      </div>
    );

  const stats = data || {};

  return (
    <div>
      <main className="p-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h2>
        <p className="text-gray-700">
          Here is a quick overview of your account and shopping activity.
        </p>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <DashboardCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingBag className="text-blue-500 w-6 h-6" />}
          />
          <DashboardCard
            title="Wishlist Items"
            value={stats.totalWishlist}
            icon={<Heart className="text-pink-500 w-6 h-6" />}
          />
          <DashboardCard
            title="Cart Items"
            value={stats.totalCartItems}
            icon={<ShoppingCart className="text-green-500 w-6 h-6" />}
          />
          <DashboardCard
            title="Profile Completion"
            value={`${stats.profileCompletion || 80}%`}
            icon={<CheckCircle className="text-purple-500 w-6 h-6" />}
          />
        </div>

        {/* Order Breakdown */}
        <h3 className="text-lg font-semibold mt-10 mb-3 text-gray-800">
          Order Status
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard
            title="Placed Orders"
            value={stats.placedOrders}
            icon={<Clock className="text-yellow-500 w-6 h-6" />}
          />
          <StatusCard
            title="Delivered Orders"
            value={stats.deliveredOrders}
            icon={<CheckCircle className="text-green-600 w-6 h-6" />}
          />
          <StatusCard
            title="Shipped Orders"
            value={stats.shippedOrders}
            icon={<Truck className="text-blue-600 w-6 h-6" />}
          />
          <StatusCard
            title="Cancelled Orders"
            value={stats.cancelledOrders}
            icon={<XCircle className="text-red-600 w-6 h-6" />}
          />
          <StatusCard
            title="Total Money Spent"
            value={stats.totalSpent}
            icon={<IndianRupee className="text-gray-600 w-6 h-6" />}
          />
        </div>
      </main>
    </div>
  );
}

/* 🔹 Reusable Card Components */
const DashboardCard = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

const StatusCard = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

export default Greet;
