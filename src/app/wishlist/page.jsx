// app/wishlist/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const router = useRouter();

  const fetchWishlist = async () => {
    const res = await fetch("/api/wishlist", { 
    headers: { authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    if (res.ok) {
      const data = await res.json();
      setWishlist(data.wishlist.items);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const remove = async (productId) => {
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) fetchWishlist();
  };

  if (!wishlist || wishlist.length==0) return(
     <div className="h-[80vh]">
        <p className="bg-slate-700 text-white text-xl md:text-2xl font-bold p-2 md:px-8 md:py-3 w-full">My Wishlist</p>
     <p className="p-6 text-center text-lg ">No items in wishlist...</p>;
     </div>
  )

  return (
    <div className="">
        <p className="bg-slate-700 text-white text-xl md:text-2xl font-bold p-2 md:px-8 md:py-3 w-full">My Wishlist</p>
        <div className="p-6 max-w-[fit-content] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {wishlist.map((p) => (
        <div key={p.product._id} className="bg-white px-6 py-3 rounded shadow">
          <img src={p?.product?.images?.[0]} alt={p.product.title} className="w-[30vh] object-cover rounded" />
          <h3 className="font-semibold mt-2">{p.product.title}</h3>
          <p className="text-green-700 font-bold mt-1">₹{p.product.variants?.[0]?.price}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => router.push(`/products/${p.product._id}`)} className="bg-green-600 cursor-pointer text-white px-3 py-1 rounded">View</button>
            <button onClick={() => remove(p.product._id)} className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer">Remove</button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
