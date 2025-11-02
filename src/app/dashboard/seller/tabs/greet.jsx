"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../../../context/AuthProvider";
import { Package, ShoppingCart, DollarSign, Clock, Store, Star, Truck, Users, Heart } from "lucide-react";

function Greet() {
  const { user } = useAuth()
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/stats/seller", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const json = await res.json();
        if (json.success) setData(json); // ✅ FIXED
      } catch (error) {
        console.error("Failed to load seller dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-6 text-gray-500 text-center animate-pulse">
        Loading your dashboard...
      </div>
    );

  const { shop, stats } = data;
  console.log(stats)

  return (
    <div>
      <main className="p-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h2>
        <p className="text-gray-700">
          Here is a quick overview of your shop and activity.
        </p>


        {shop && (
          <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 md:flex-row">
            {shop?.shopLogo && (
              <img
                src={shop.shopLogo}
                alt={shop.shopName}
                className="w-20 h-20 rounded-full object-cover shadow"
              />
            )}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold mb-2">{shop.shopName}</h3>
              <p className="text-gray-600">{shop.shopDescription || "No description available."}</p>
            </div>

          </div>
        )}

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <DashboardCard
            title="Total Products"
            value={stats?.totalProducts ?? 0}
            icon={<Package className="text-blue-500 w-6 h-6" />}
          />
          <DashboardCard
            title="Total Orders"
            value={stats?.totalOrders ?? 0}
            icon={<ShoppingCart className="text-green-500 w-6 h-6" />}
          />
          <DashboardCard
            title="Total Revenue"
            value={`₹${stats?.totalRevenue ?? 0}`}
            icon={<DollarSign className="text-purple-500 w-6 h-6" />}
          />
          <DashboardCard
            title="Pending Orders"
            value={stats?.pendingOrders ?? 0}
            icon={<Clock className="text-yellow-500 w-6 h-6" />}
          />
        </div>

        {/* 🚚 Order Status Breakdown */}
        <h3 className="text-lg font-semibold mt-10 mb-2 text-gray-800">
          Order Status
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-3">
          <StatusCard
            title="Placed Orders"
            value={stats?.placedOrders ?? 0}
            icon={<Truck className="text-blue-600 w-6 h-6" />}
          />
          <StatusCard
            title="Shipped Orders"
            value={stats?.shippedOrders ?? 0}
            icon={<Truck className="text-orange-500 w-6 h-6" />}
          />
          <StatusCard
            title="Delivered Orders"
            value={stats?.deliveredOrders ?? 0}
            icon={<Truck className="text-green-600 w-6 h-6" />}
          />
          <StatusCard
            title="Cancelled Orders"
            value={stats?.cancelledOrders ?? 0}
            icon={<Truck className="text-red-600 w-6 h-6" />}
          />
        </div>

        {/* ⭐ Extra Info */}
        <h3 className="text-lg font-semibold mt-10 mb-2 text-gray-800">
          Additional Insights
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
          <ExtraInfo
            title="Total Reviews"
            value={stats?.totalReviews ?? 0}
            icon={<Star className="text-yellow-400 w-6 h-6" />}
          />
          <ExtraInfo
            title="Total Customers"
            value={stats?.totalCustomers ?? 0}
            icon={<Users className="text-teal-500 w-6 h-6" />}
          />
          <ExtraInfo
            title="Wishlist Count"
            value={stats?.wishlistCount ?? 0}
            icon={<Heart className="text-pink-500 w-6 h-6" />}
          />
        </div>
      </main>
    </div>
  );
}

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

const ExtraInfo = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    <div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  </div>
);

export default Greet;
