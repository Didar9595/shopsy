"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const router=useRouter()
  const {isLogin}=useAuth()

  useEffect(() => {
    if(!isLogin) router.push('/login')
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    };
    fetchOrders();
  }, []);

  const handleCancelItem = async (orderId) => {
    const confirmCancel = confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders/cancel", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Order cancelled successfully!");
        // Update UI immediately
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, orderStatus: "cancelled" } : o
          )
        );
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancel order error:", error);
      alert("Something went wrong while cancelling order");
    }
  };


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 p-3 bg-green-600 text-white">My Orders History</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500 min-h-[70vh]">No orders yet.</p>
      ) : (
        orders.map((o) => (
          <div
            key={o._id}
            className="rounded-lg p-4 mb-4 bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Order #{o._id.slice(-6)}</h2>
              <div className="flex gap-2">
                <StatusBadge type="order" status={o.orderStatus} />
                <StatusBadge type="payment" status={o.paymentStatus} />
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              Ordered on {new Date(o.createdAt).toLocaleString()}
            </p>

            <div className="mb-2">
              {o.items.map((it, idx) => (
                <div className="flex flex-col-reverse sm:flex-row items-center gap-2 border-b p-1">
                  
                  <div key={idx} className="w-[100%] flex flex-col gap-2  text-sm mb-1">
                    <h1 className="text-xl font-semibold">Product Details : </h1>
                  <span>Name: {it.product?.title || "Product"}</span>
                   <span>Variant: {it.variantSku}</span>
                  <span>Qty: {it.quantity}</span>
                  <span>Price: ₹{it.priceAtAdd * it.quantity}</span>
                  
                </div>
                <img src={it.image} alt="product-img" className="w-40" />
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-700">
              <strong>Ship To:</strong> {o.shippingAddress?.street},{" "}
              {o.shippingAddress?.city}, {o.shippingAddress?.state} -{" "}
              {o.shippingAddress?.zip}, {o.shippingAddress?.country}
            </p>

            <div className="flex justify-end mt-3 font-semibold">
              Total: ₹{o.totalAmount}
            </div>
            {o.orderStatus !== "cancelled" &&
                o.orderStatus !== "delivered" && (
                  <button
                    onClick={() => handleCancelItem(o._id)}
                    className="py-1 px-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    Cancel Order
                  </button>
                )}
          </div>
        ))
      )}
    </div>
  );
}

function StatusBadge({ type, status }) {
  const colors = {
    placed: "bg-blue-100 text-blue-700",
    shipped: "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-gray-100 text-gray-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${colors[status]}`}
    >
      {type === "order" ? status : `payment: ${status}`}
    </span>
  );
}
