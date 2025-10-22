"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });  const [editingAddress, setEditingAddress] = useState(false);
  const {user}=useAuth()

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setCart(data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
    const fetchUser = async () => {
    setAddress(user?.address);
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (res.ok) {
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated")); // 🔔 refresh navbar

    }
  };

  const removeItem = async (productId) => {
    const res = await fetch(`/api/cart?productId=${productId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) {
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated")); // 🔔 refresh navbar
    }
  };

  const handleCheckout = async () => {
    if (!address || !address.street) {
      return alert("Please add your delivery address first!");
    }

    const orderBody = {
      items: cart.items.map((it) => ({
        product: it.product._id,
        variantSku: it.variant?.sku || "",
        variantAttributes: it.variant?.attributes || {},
        quantity: it.quantity,
        priceAtAdd: it.priceAtAdd,
        image: it.variant?.images?.[0] || it.product.images?.[0] || "", //  fallback
      })),
      totalAmount: subtotal,
      shippingAddress: address,
      fromCart:true,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderBody),
      });

      if (res.ok) {
        alert("✅ Order placed successfully!");
        window.dispatchEvent(new Event("cartUpdated")); // 🔔 refresh navbar
        router.push("/order");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Error placing order.");
    }
  };


  useEffect(() => {
    fetchCart();
    fetchUser();
  }, []);

  if (loading) return <p className="p-6 h-[90vh] text-center text-xl">Loading cart...</p>;
  if (!cart || !cart.items?.length)
    return <p className="p-6 h-[90vh] text-center text-xl">Your cart is empty.</p>;

  const subtotal = cart.items.reduce(
    (sum, it) => sum + (it.priceAtAdd || 0) * it.quantity,
    0
  );

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {cart.items.map((it) => (
          <div
            key={it._id}
            className="flex gap-4 p-4 border rounded bg-white shadow-sm"
          >
            <img
              src={it.product?.images?.[0] || "/no-image.png"}
              alt={it.product?.title}
              className="w-28 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{it.product?.title}</h3>
              <p className="text-sm text-gray-600">
                ₹{it.priceAtAdd} × {it.quantity}
              </p>
              <div className="flex items-center flex-wrap gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(it.product._id, it.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span>{it.quantity}</span>
                <button
                  onClick={() => updateQuantity(it.product._id, it.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(it.product._id)}
                  className="ml-4 text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold text-lg">Order Summary</h3>
        <div className="mt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between font-bold mt-3">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>
        </div>

        {/* Address Section */}
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
                className="text-blue-600 mt-1"
              >
                Save Address
              </button>
            </div>
          ) : (
            <div className="text-gray-700 mt-1 space-y-1">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} - {address.zip}
              </p>
              <p>{address.country}</p>
              <button
                onClick={() => setEditingAddress(true)}
                className="text-blue-600 mt-2"
              >
                Change Address
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleCheckout}
          className="mt-6 w-full bg-green-600 text-white py-2 rounded cursor-pointer"
        >
          Checkout
        </button>
        {/* <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Proceed to Checkout
        </button> */}
      </aside>
    </div>
  );
}
