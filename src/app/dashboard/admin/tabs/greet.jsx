"use client";
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../../../context/AuthProvider'
import { motion } from "framer-motion";
import { Users, User, Package, ShoppingCart, Store, Star, Heart, DollarSign, Clock, CheckCircle, XCircle, Truck, } from "lucide-react";

function Greet() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    sellers: 0,
    customers: 0,
    shops: 0,
    products: 0,
    orders: 0,
    reviews: 0,
    wishlists: 0,
    pendingRequests: 0,
    orderBreakdown: {
      placed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
  });

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/admin");
        const data = await res.json();
        setStats(data);
        setOrders(data.formattedOrders)
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats.users, icon: <Users className="text-blue-500" />, color: "bg-blue-100" },
    { title: "Sellers", value: stats.sellers, icon: <Store className="text-purple-500" />, color: "bg-purple-100" },
    { title: "Customers", value: stats.customers, icon: <User className="text-indigo-500" />, color: "bg-purple-100" },
    { title: "Shops", value: stats.shops, icon: <Package className="text-green-500" />, color: "bg-green-100" },
    { title: "Products", value: stats.products, icon: <ShoppingCart className="text-orange-500" />, color: "bg-orange-100" },
    { title: "Orders", value: stats.orders, icon: <DollarSign className="text-teal-500" />, color: "bg-teal-100" },
    { title: "Pending Seller Requests", value: stats.pendingRequests, icon: <Clock className="text-yellow-500" />, color: "bg-yellow-100" },
    { title: "Reviews", value: stats.reviews, icon: <Star className="text-pink-500" />, color: "bg-pink-100" },
    { title: "Wishlists", value: stats.wishlists, icon: <Heart className="text-red-500" />, color: "bg-red-100" },
  ];

  const orderCards = [
    { title: "Placed Orders", value: stats.orderBreakdown.placed, icon: <Clock className="text-yellow-600" />, color: "bg-yellow-100" },
    { title: "Shipped Orders", value: stats.orderBreakdown.shipped, icon: <Truck className="text-blue-600" />, color: "bg-blue-100" },
    { title: "Delivered Orders", value: stats.orderBreakdown.delivered, icon: <CheckCircle className="text-green-600" />, color: "bg-green-100" },
    { title: "Cancelled Orders", value: stats.orderBreakdown.cancelled, icon: <XCircle className="text-red-600" />, color: "bg-red-100" },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 font-semibold">
        Loading dashboard...
      </div>
    );


  return (
    <div>
      <main className="p-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Welcome,{user.name} - Admin!</h2>

        {/* ---- Main Stats ---- */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {statCards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className={`p-5 rounded-2xl shadow-md hover:shadow-lg transition  ${card.color}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-700 text-lg font-semibold">{card.title}</h3>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{card.value}</p>
                </div>
                <div className="p-3 rounded-full bg-white shadow-inner">{card.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ---- Order Breakdown ---- */}
        <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-800">Order Summary</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {orderCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl shadow-md  ${card.color}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-gray-700 text-lg font-semibold">{card.title}</h3>
                  <p className="text-3xl font-bold mt-2 text-gray-900">{card.value}</p>
                </div>
                <div className="p-3 rounded-full bg-white shadow-inner">{card.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ---- Recent Orders Table ---- */}
        <div className="mt-10 bg-white p-5 rounded-2xl shadow-md overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-10">No orders found.</p>
          ) : (
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Order ID</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Amount (₹)</th>
                  <th className="px-4 py-2 text-left">Payment</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2 font-mono text-sm text-gray-800">
                      {order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-2">{order.userName}</td>
                    <td className="px-4 py-2 text-gray-500">{order.userEmail}</td>
                    <td className="px-4 py-2 font-semibold">₹{order.totalAmount}/-</td>
                    <td
                      className={`px-4 py-2 font-medium ${order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "failed"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                    >
                      {order.paymentStatus}
                    </td>
                    <td
                      className={`px-4 py-2 font-medium ${order.orderStatus === "delivered"
                          ? "text-green-600"
                          : order.orderStatus === "cancelled"
                            ? "text-red-600"
                            : order.orderStatus === "shipped"
                              ? "text-blue-600"
                              : "text-gray-600"
                        }`}
                    >
                      {order.orderStatus}
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

export default Greet
