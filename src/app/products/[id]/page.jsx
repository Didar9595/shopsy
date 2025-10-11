"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, ShoppingCart, Heart } from "lucide-react";
import ProductReviews from "@/app/components/ProductReviews";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
    const [ratingData, setRatingData] = useState({ avgRating: 0, totalReviews: 0 });
    const [error,setError]=useState()


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json()
        
        setProduct(data.product);
        if (data.product?.variants?.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }
        setRatingData({
          avgRating: data.productWithRating.avgRating || 0,
          totalReviews: data.productWithRating.totalReviews || 0,
        });

      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-red-500">Product not found!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-8">
        
        {/* LEFT: Product Images */}
        <div className="flex flex-col items-center md:w-1/2">
          <img
            src={
              selectedVariant?.images?.[0] ||
              product.images?.[0] ||
              "https://via.placeholder.com/400x400?text=No+Image"
            }
            alt={product.title}
            className="w-80 h-80 object-contain mb-4 border rounded-lg"
          />
          <div className="flex gap-3 overflow-x-auto">
            {[...(selectedVariant?.images || product.images || [])].map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`variant-${i}`}
                onClick={() =>
                  setSelectedVariant({ ...selectedVariant, images: [img] })
                }
                className={`w-20 h-20 object-cover border rounded-md cursor-pointer ${
                  selectedVariant?.images?.[0] === img ? "border-blue-500" : "border-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Product Details */}
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-500 mb-2 capitalize">{product.category}</p>

            <div className="flex items-center gap-1 text-yellow-500 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={18}
                fill={i <= Math.round(ratingData.avgRating) ? "gold" : "none"}
                stroke="gold"
              />
            ))}
            <span className="text-gray-600 ml-2">
              ({ratingData.avgRating.toFixed(1)} / 5 • {ratingData.totalReviews} reviews)
            </span>
          </div>

            <p className="text-gray-700 mb-4">{product.description}</p>

            {/* Variant Selector */}
            {product.variants?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold mb-2">Available Variants</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(v)}
                      className={`border px-3 py-1 rounded-md ${
                        selectedVariant?.sku === v.sku
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {v.attributes?.color
                        ? v.attributes.color
                        : `Variant ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            {selectedVariant && (
              <div className="mb-5">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-bold text-green-600">
                    ₹{selectedVariant.price}
                  </h2>
                  <p className="text-gray-500 line-through">
                    ₹{selectedVariant.mrp}
                  </p>
                  <span className="text-sm text-green-500 font-semibold">
                    {Math.round(
                      ((selectedVariant.mrp - selectedVariant.price) /
                        selectedVariant.mrp) *
                        100
                    )}
                    % off
                  </span>
                </div>
                <p className="text-gray-600 mt-1">
                  Stock:{" "}
                  <span
                    className={`font-semibold ${
                      selectedVariant.stock > 0
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {selectedVariant.stock > 0
                      ? `${selectedVariant.stock} available`
                      : "Out of Stock"}
                  </span>
                </p>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 px-3 py-1 text-sm rounded-full border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-1 rounded-lg font-semibold shadow">
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-1 rounded-lg font-semibold shadow">
              Buy Now
            </button>
            <button className="flex items-center justify-center gap-2 border px-6 py-1 rounded-lg font-semibold hover:bg-gray-100">
              <Heart size={20} /> Wishlist
            </button>
          </div>
        </div>
      </div>

      <div>
        <ProductReviews productId={product._id} />
      </div>

      {/* Related Products */}
      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="text-2xl font-semibold mb-4">Similar Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-3 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            >
              <img
                src={product.images?.[0]}
                alt="related"
                className="w-full h-40 object-contain rounded"
              />
              <p className="font-semibold mt-2 text-sm truncate">{product.title}</p>
              <p className="text-green-600 font-bold">₹{selectedVariant?.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
