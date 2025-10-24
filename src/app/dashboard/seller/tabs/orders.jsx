"use client";
import { useEffect, useState } from "react";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [id,setId]=useState()

  // Fetch seller orders
  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch("/api/orders/seller", {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    };
    fetchOrders();
  }, []);

  // Update order status (Placed → Shipped → Delivered)
  const handleStatusUpdate = async (orderId, newStatus) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ orderId, orderStatus: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    }
    else alert(data.message)
  };

  // Cancel a product item
  const handleCancelItem = async (orderId, itemId) => {
    const res = await fetch("/api/orders/cancel", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ orderId, cancelItemId: itemId }),
    });
    const data = await res.json();
    if (data.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((it) =>
                  it._id === itemId
                    ? { ...it, orderStatus: "cancelled" }
                    : it
                ),
              }
            : order
        )
      );
    }
  };

  return (
    <div className="p-4 max-w-5xl">
      <h1 className="text-xl font-bold mb-4">Seller Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="flex flex-row flex-wrap gap-4 ">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-4 rounded bg-white shadow-sm hover:shadow-md transition sm:max-w-[38%] max-w-[100%]"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800">
                  Order ID: {order._id}
                </p>
                <span className="bg-green-600 text-white px-3 py-1 rounded-sm text-sm capitalize">
                  {order.orderStatus}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                Customer: {order.user?.name} ({order.user?.email})
              </p>

              {/* Order Items */}
              <div className="mt-3 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col justify-center items-center   rounded"
                  >
                    <div className="w-[100%] flex flex-row gap-3 items-center justify-between p-2 bg-gray-50">
                      <img
                        src={item.image || item.product?.images?.[0]}
                        alt={item.product?.title}
                        className="w-20 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{item.product?.title}</p>
                        <p className="text-sm">{item.variantSku}</p>
                        {item.variantAttributes && (
                          <p className="text-sm text-gray-500">
                            Variant:{" "}
                            {Object.entries(item.variantAttributes)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(", ")}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm">
                          Qty: {item.quantity} | ₹{item.priceAtAdd}
                        </p>
                      </div>
                    </div>


                    <div className="w-[100%] flex flex-row items-center justify-between  p-2">
                <div className="flex gap-2 items-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusUpdate(order._id, e.target.value)
                        }
                        className="border rounded px-2 py-1 text-sm cursor-pointer"
                      >
                        <option value="placed">Placed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      {order.orderStatus !== "cancelled" && (
                        <button
                          onClick={() =>
                            handleCancelItem(order._id, item._id)
                          }
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                <div className="text-right  text-sm text-gray-700">
                Total: ₹{order.totalAmount}
              </div>
              </div>
                  </div>
                  
                ))}
              </div>


              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
