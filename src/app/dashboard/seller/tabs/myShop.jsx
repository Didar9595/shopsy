"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Store, Trash2 } from "lucide-react";
import { useAuth } from "../../../../../context/AuthProvider";

export default function MyShop() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await fetch("/api/shops/my", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const handleDeleteShop = async () => {
    if (!confirm("Are you sure you want to delete your shop? This action cannot be undone.")) return;

    try {
      const res = await fetch("/api/shops/my", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        alert("Your shop has been deleted. You are now a customer again.");
        setUser((prev) => ({ ...prev, role: "customer" }));
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete shop.");
      }
    } catch (err) {
      console.error(err);
    }
  };

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
    <div className="flex flex-col h-fit bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Store size={24} /> My Shop
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => alert("Add Product form opens here")}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            + Add Product
          </button>
          <button
            onClick={handleDeleteShop}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md flex items-center gap-1"
          >
            <Trash2 size={18} /> Delete Shop
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
          {shop.shopLogo && (
            <div className="flex justify-center mb-6">
              <img
                src={shop.shopLogo}
                alt="Shop Logo"
                className="w-32 h-32 object-cover rounded-full border"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-center mb-2">{shop.shopName}</h2>
          <p className="text-gray-600 text-center mb-4">{shop.shopDescription}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold text-gray-700">Owner</h3>
              <p>{user?.name || "Unknown"}</p>
            </div>
            <div className="p-4 border rounded-md">
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p
                className={`font-bold ${shop.isActive ? "text-green-600" : "text-red-600"}`}
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
