"use client";
import { useEffect, useState } from "react";
import { Package, IndianRupee, XCircle, Loader2 } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchOrders = async (status = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders${status ? `?status=${status}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    if (!confirm("Do you want to cancel this order?")) return;

    setCancelling(orderId);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/orders/cancel", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Order cancelled successfully");
        fetchOrders(filter);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Cancel order error:", err);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="p-2 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Package className="text-blue-600" size={28} />
          <h2 className="text-2xl font-bold">Orders Management</h2>
        </div>

        {/* Filter */}
        <select
          className="shadow-md rounded-md  px-3 py-2 bg-green-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            fetchOrders(e.target.value);
          }}
        >
          <option value="">All Status</option>
          <option value="placed">Placed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-600">
          <Loader2 className="animate-spin mr-2" /> Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 py-6">No orders found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-400 hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-semibold">{order.user?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500">{order.user?.email}</p>
                  </td>

                  <td className="p-3">
                    <ul className="space-y-1">
                      {order.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt={item.product?.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="text-sm text-gray-700">{item.product?.title}</span>
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-3 font-semibold flex items-center gap-1">
                    <IndianRupee size={14} className="text-gray-600" />
                    {order.totalAmount}
                  </td>

                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        order.orderStatus === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.orderStatus === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    {order.orderStatus !== "cancelled" &&
                    order.orderStatus !== "delivered" ? (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        disabled={cancelling === order._id}
                        className="flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm mx-auto"
                      >
                        {cancelling === order._id ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle size={16} /> Cancel
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">No Action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
