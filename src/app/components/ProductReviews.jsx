"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "../../../context/AuthProvider";
import { useRouter } from "next/navigation";

export default function ProductReviews({ productId}) {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error,setError]=useState()

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ productId, rating, comment }),
    });

    if (res.ok) {
      setRating(0);
      setComment("");
      const data = await res.json();
      setReviews((prev) => [data.review, ...prev.filter(r => r._id !== data.review._id)]);
    }
    else{
        const data = await res.json()
        setError(data.message)
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-6 border-b pb-4">
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer ${
                  star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="mt-3 bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
          >
            Submit Review
          </button>
        </form>
      )}

      {
        error && (
            <p className="text-rose-400 italic taxt-md">{error}</p>
        )
      }
      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="border p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.userId?.name}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-gray-700 mt-1">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
