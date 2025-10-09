"use client";

import { useEffect, useState } from "react";
import AddEditProduct from "@/app/components/AddEditProducts";

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

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {products.map((p) => (
          <div key={p._id} className="border rounded-lg bg-white p-4 shadow">
            <img
              src={p.images[0]}
              alt={p.title}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="font-semibold mt-2">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.category}</p>
            <p className="text-gray-700 font-bold mt-1">
              ₹{p.variants?.[0]?.price || "N/A"}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setEditing(p)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
