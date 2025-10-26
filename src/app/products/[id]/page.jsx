"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, ShoppingCart, Heart } from "lucide-react";
import ProductReviews from "@/app/components/ProductReviews";
import { useAuth } from "../../../../context/AuthProvider";
import { Spinner } from "flowbite-react";
import { useRouter } from "next/navigation";
import ProductCard from "@/app/components/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState({ avgRating: 0, totalReviews: 0 });
  const { user } = useAuth();

  const [inWishlist, setInWishlist] = useState(false)
  const [isSellerOfThisProduct, setIsSellerOfThisProduct] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);

  const router = useRouter()




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

        // Check if product is in wishlist
        if (user) {
          const wlRes = await fetch("/api/wishlist", {
            method: "GET",
            headers: { authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          if (wlRes.ok) {
            const wlData = await wlRes.json();
            const exists = wlData.wishlist?.items?.some(
              (item) => item.product._id === data.product._id
            );
            setInWishlist(exists);
          }
        }

        // ✅ Fetch related products
        if (data.product?.category) {
          const relRes = await fetch(
            `/api/products/related?category=${data.product?.category}&subcategory=${data.product?.subcategory}&exclude=${data.product._id}`
          );
          const relData = await relRes.json();
          if (relData.success) setRelatedProducts(relData.products);
        }

      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }



    };
    if (id) fetchProduct();
  }, [id]);



  const handleAddToWishlist = async () => {
    if (!user) { router.push("/login"); return; }

    const method = inWishlist ? "DELETE" : "POST";
    const res = await fetch("/api/wishlist", {
      method,
      headers: { "Content-Type": "application/json", authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ productId: product._id }),
    });

    if (res.ok) {
      setInWishlist(!inWishlist); // toggle state
      //alert(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    } else {
      const e = await res.json();
      alert(e.message || "Failed");
    }
  };

  //disable wishlist button for the seller of that product
  useEffect(() => {
    if (
      user &&
      product?.seller &&
      (user._id === product.seller._id || user._id === product.seller)
    ) {
      setIsSellerOfThisProduct(true);
    } else {
      setIsSellerOfThisProduct(false);
    }
  }, [user, product]);

  //add to cart
  const handleAddToCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          variantSku: selectedVariant?.sku || "",
          variantAttributes: selectedVariant?.attributes || {},
          variantImages: selectedVariant?.images || [],
          priceAtAdd: selectedVariant?.price || product.price,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated")); // refresh navbar
      }
      else alert(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  // Buy Now → Create a direct order then redirect
  const handleBuyNow = () => {
    if (!user) return router.push("/login");

    const params = new URLSearchParams({
      productId: product._id,
      variantSku: selectedVariant?.sku || "",
      price: selectedVariant?.price || product.price || 0,
      quantity: "1",
      fromCart: "false",
      image: selectedVariant?.images[0],
    }).toString();

    router.push(`/checkout?${params}`);
  };





  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10 text-red-500">Product not found!</div>;
  }

  return (
    <div className="max-h-[fit-content] bg-gray-100 p-6">
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
                className={`w-20 h-20 object-cover border rounded-md cursor-pointer ${selectedVariant?.images?.[0] === img ? "border-blue-500" : "border-gray-300"
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
                      className={`border px-3 py-1 rounded-md cursor-pointer ${selectedVariant?.sku === v.sku
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
                    className={`font-semibold ${selectedVariant.stock > 0
                      ? "text-green-600"
                      : "text-red-500"
                      }`}
                  >
                    {selectedVariant.stock > 0
                      ? `${selectedVariant.stock} available`
                      : "Out of Stock"}
                  </span>
                </p>
                <div className="border-2 border-dashed border-green-500 w-[fit-content] px-6 py-1 rounded-md">
                  <h1 className="font-bold text-lg ">Offered by:-</h1>
                  <div className="flex flex-row gap-1 items-center">
                    <img src={product.shop.shopLogo} alt="logo" className="w-12 rounded-full shadow-sm" />
                    <p className="font-normal">{product.shop.shopName}</p>
                  </div>
                </div>
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

            {/* Order Button */}
            <button
              onClick={handleBuyNow}
              disabled={isSellerOfThisProduct}
              className={`cursor-pointer flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold shadow ${isSellerOfThisProduct ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Buy Now
            </button>

            {/* Add to Cart Button */}
            <button disabled={isSellerOfThisProduct} onClick={handleAddToCart} className={`bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex flex-row justify-center items-center ${isSellerOfThisProduct
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100 cursor-pointer"
              }`}><ShoppingCart /> Add to Cart</button>

            {/* Wishlist Button */}
            <button
              onClick={handleAddToWishlist}
              disabled={isSellerOfThisProduct}
              className={`p-2 rounded-full border flex items-center justify-center transition-all ${isSellerOfThisProduct
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer"
                }`}
              title={
                isSellerOfThisProduct
                  ? "You cannot add your own product to wishlist"
                  : "Add to wishlist"
              }
            >
              <Heart size={20} fill={inWishlist ? "red" : "none"} stroke={inWishlist ? "red" : "black"} />
            </button>
          </div>

        </div>
      </div>

      <div>
        <ProductReviews productId={product._id} />
      </div>


      <div className="min-h-screen bg-gray-100 p-6">

        {/* Product section (same as yours) */}
        <div className="max-w-6xl mt-10">
          <h2 className="text-2xl font-semibold mb-4">Similar Products</h2>

          {relatedProducts.length === 0 ? (
            <p className="text-gray-500">No related products found.</p>
          ) : (
            <div className="flex flex-row flex-wrap gap-6">
              {relatedProducts.map((item) => (
                <ProductCard product={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
