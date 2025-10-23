"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "", country: "", });
  const [editingAddress, setEditingAddress] = useState(false);
  const { user } = useAuth()

  // 🔹 Fetch cart
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/cart", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    setAddress(user?.address)
  };

  // 🔹 Quantity update
  const updateQuantity = async (productId, variantSku, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId, variantSku, quantity }),
      });
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // 🔹 Remove item
  const removeItem = async (productId, variantSku) => {
    try {
      const res = await fetch(
        `/api/cart?productId=${productId}&variantSku=${variantSku}`,
        {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) {
        fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // 🔹 Checkout (placeholder for now)
  // 💳 Handle Checkout
  const handleCheckout = async () => {
    if (!address?.street || !address?.city) {
      alert("Please add your delivery address first!");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          fromCart: true, //  Important flag
          items: cart.items.map((it) => ({
            product: it.product._id,
            variantSku: it.variant?.sku || "",
            variantAttributes: it.variant?.attributes || {},
            quantity: it.quantity,
            priceAtAdd: it.priceAtAdd,
            image: it.variant?.images?.[0] || it.product.images?.[0] || "", //  fallback
          })),
          totalAmount: totalAmount,
          shippingAddress: address,
        }),
      });
      

      if (res.ok) {
        alert("✅ Order placed successfully!");
        window.dispatchEvent(new Event("cartUpdated"));
        router.push("/order");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Error placing order!");
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUser();
    // Listen to global event for counter update
    // const handler = () => fetchCart();
    // window.addEventListener("cartUpdated", handler);
    // return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  if (loading)
    return <p className="text-center mt-10 text-gray-600 min-h-[70vh]">Loading cart...</p>;

  if (!cart || !cart.items?.length)
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-gray-600 min-h-[70vh]">
        <p className="text-lg mb-4">Your cart is empty 🛍️</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Continue Shopping
        </button>
      </div>
    );

  const totalAmount = cart.items.reduce(
    (sum, it) => sum + it.priceAtAdd * it.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-white bg-green-600 p-2">My Cart</h1>

      <div className="space-y-4">
        {cart.items.map((it) => (
          <div
            key={`${it.product._id}-${it.variantSku || "default"}`}
            className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm"
          >
            <img
              src={
                it.variantImages?.[0] ||
                it.product?.images?.[0] ||
                "/no-image.png"
              }
              alt={it.product?.title}
              className="w-28 object-cover rounded"
            />

            <div className="flex-1">
              <h3 className="font-semibold">{it.product?.title}</h3>

              {/* Variant Info */}
              {it.variantAttributes &&
                Object.keys(it.variantAttributes).length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {Object.entries(it.variantAttributes)
                      .map(([key, val]) => `${key}: ${val}`)
                      .join(", ")}
                  </p>
                )}

              <p className="text-gray-700 mt-1">
                ₹{it.priceAtAdd} × {it.quantity} ={" "}
                <span className="font-semibold">
                  ₹{it.priceAtAdd * it.quantity}
                </span>
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2 mt-3">
                <div>
                  <button
                  onClick={() =>
                    updateQuantity(it.product._id, it.variantSku, it.quantity - 1)
                  }
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  -
                </button>
                <span className="px-2">{it.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(it.product._id, it.variantSku, it.quantity + 1)
                  }
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
                >
                  +
                </button>
                </div>

                <button
                  onClick={() => removeItem(it.product._id, it.variantSku)}
                  className="ml-4 text-red-600 hover:text-red-800 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 border-t pt-6 flex flex-col justify-between items-center">
        <div className="w-[100%] flex flex-col justify-center items-center sm:flex-row-reverse sm:items-between sm:justify-between">
          <div className="border-dashed border-2 border-green-600 p-2 rounded-sm">
          <p className="text-lg font-semibold">
            Total Amount: ₹{totalAmount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            ({cart.items.length} item{cart.items.length > 1 ? "s" : ""})
          </p>
        </div>

        {/* 📍 Address Section */}
        <div className="mt-6">
          <h4 className="font-semibold">Delivery Address</h4>
          {editingAddress ? (
            <div className="grid gap-2 mt-2">
              {["street", "city", "state", "zip", "country"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={address[field] || ""}
                  onChange={(e) =>
                    setAddress({ ...address, [field]: e.target.value })
                  }
                  className="border p-2 rounded text-sm"
                />
              ))}
              <button
                onClick={() => setEditingAddress(false)}
                className="text-green-600 mt-1 hover:underline cursor-pointer"
              >
                Save Address
              </button>
            </div>
          ) : (
            <div className="text-gray-700 mt-1 space-y-1">
              <p>{address?.street}</p>
              <p>
                {address?.city}, {address?.state} - {address?.zip}
              </p>
              <p>{address?.country}</p>
              <button
                onClick={() => setEditingAddress(true)}
                className="text-green-600 mt-2 hover:underline cursor-pointer"
              >
                Change Address
              </button>
            </div>
          )}
        </div>
        </div>

        <button
          onClick={handleCheckout}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition mt-4 cursor-pointer"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
