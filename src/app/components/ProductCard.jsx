"use client";
import Link from "next/link";

export default function ProductCard({ product }) {
  const firstVariant = product.variants?.[0] || {};
  const discount = firstVariant.mrp
    ? Math.round(((firstVariant.mrp - firstVariant.price) / firstVariant.mrp) * 100)
    : 0;

  return (
    <Link href={`/products/${product._id}`} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-3 flex flex-col">
      <div className="relative flex justify-center items-center">
        <img
          src={product.images?.[0] || firstVariant.images?.[0] || "/placeholder.jpg"}
          alt={product.title}
          className="h-40 w-auto object-contain"
        />
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm font-semibold line-clamp-2">{product.title}</h3>
        <p className="text-gray-600 text-xs line-clamp-1">{product.category}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-green-600">₹{firstVariant.price}</span>
          {firstVariant.mrp && (
            <span className="text-sm text-gray-400 line-through">₹{firstVariant.mrp}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
