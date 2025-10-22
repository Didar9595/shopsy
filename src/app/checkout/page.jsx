"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";

export default function CheckoutPage() {
    const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState({});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {user}=useAuth()

  const fromCart = searchParams.get("fromCart") === "true";
  const productId = searchParams.get("productId");
  const variantSku = searchParams.get("variantSku");
  const quantity = Number(searchParams.get("quantity") || 1);
  const price = Number(searchParams.get("price") || 0);
  const image=searchParams.get("image");

  useEffect(() => {
    const fetchUserAndCart = async () => {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");

      setAddress(user?.address);

      if (fromCart) {
        const cartRes = await fetch("/api/cart", {
          headers: { authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();
        setCartItems(cartData.items || []);
      } else {
        setCartItems([
          { _id: productId, variantSku, quantity, priceAtAdd: price ,image},
        ]);
      }
    };
    fetchUserAndCart();
  }, [fromCart, productId, router]);

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromCart,
          productId,
          quantity,
          price,
          variantSku,
          address,
          image,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/order");
      } else {
        alert("Failed to place order");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading Checkout…</div>}>
      <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 bg-green-500 text-white p-4">Checkout</h1>

      {/* Shipping Address */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Delivery Address</h2>
        {address ? (
          <div>
            <p>{address.street}, {address.city}</p>
            <p>{address.state} - {address.zip}</p>
            <p>{address.country}</p>
          </div>
        ) : (
          <p className="text-gray-500">No address found.</p>
        )}
        <button
          onClick={() => setShowAddressModal(true)}
          className="mt-2 text-green-600 underline"
        >
          Change Address
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Order Summary</h2>
        {cartItems.map((it, idx) => (
          <div key={idx} className="flex justify-between mb-2">
            <span>Product: <img src={image} alt="product-img" className="w-60  object-cover"/></span>
            <span>Variant: {variantSku}</span>
            <span>Qty: {it.quantity}</span>
            <span>₹{it.priceAtAdd * it.quantity}</span>
            
          </div>
        ))}
        <hr className="my-2" />
        <div className="flex justify-between font-semibold ">
          <span>Total:</span>
          <span>
            ₹
            {cartItems.reduce(
              (sum, i) => sum + i.priceAtAdd * i.quantity,
              0
            )}
          </span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>

      {showAddressModal && (
        <AddressModal
          address={address}
          setAddress={setAddress}
          onClose={() => setShowAddressModal(false)}
        />
      )}
    </div>
    </Suspense>
  );
}

function AddressModal({ address, setAddress, onClose }) {
  const [form, setForm] = useState(address || {});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setAddress(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-3">Change Address</h2>

        {["street", "city", "state", "zip", "country"].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f}
            value={form[f] || ""}
            onChange={handleChange}
            className="border rounded w-full p-2 mb-2"
          />
        ))}

        <div className="flex justify-end mt-2 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
