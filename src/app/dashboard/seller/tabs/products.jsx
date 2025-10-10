"use client";

import { useEffect, useState } from "react";
import AddEditProduct from "@/app/components/AddEditProducts";
import Link from "next/link";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setProducts(data.products || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchProducts();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">My Products</h2>
        <button
          onClick={() => setAdding(true)}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          + Add Product
        </button>
      </div>

      {(adding || editing) && (
        <AddEditProduct
          existing={editing}
          onDone={() => {
            setAdding(false);
            setEditing(null);
            fetchProducts();
          }}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {products.map((p) => (
          <Link href={`/products/${p._id}`}>
            <div
              key={p._id}
              className="group relative border rounded-xl bg-white p-4 shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/products/${p._id}`)}
            >
              {/* Product Image */}
              <div className="relative w-full h-48 overflow-hidden rounded-lg">
                <img
                  src={p.images?.[0] || "/placeholder.jpg"}
                  alt={p.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="mt-3">
                <h3 className="font-semibold text-gray-800 line-clamp-1">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.category}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  ₹{p.variants?.[0]?.price || "N/A"}
                </p>
              </div>

              {/* Buttons */}
              <div
                className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()} // prevent card click navigation
              >
                <button
                  onClick={() => setEditing(p)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded-lg shadow"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg shadow"
                >
                  Delete
                </button>
              </div>
            </div>

          </Link>
        ))}
      </div>
    </div>
  );
}
