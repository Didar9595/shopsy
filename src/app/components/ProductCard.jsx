"use client";
import Link from "next/link";

/**
 * Simple ProductCard used in seller and public listing
 */
export default function ProductCard({ product }) {
  const image = (product.images && product.images.length) ? product.images[0] : (product.variants?.[0]?.images?.[0] || "");
  return (
    <div className="border rounded overflow-hidden bg-white">
      <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
        {image ? <img src={image} alt={product.title} className="h-full object-contain" /> : <div className="text-gray-400">No Image</div>}
      </div>
      <div className="p-3">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-sm text-gray-600 truncate">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold">₹{product.price}</div>
          <Link href={`/product/${product._id}`}>
            <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded">View</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
