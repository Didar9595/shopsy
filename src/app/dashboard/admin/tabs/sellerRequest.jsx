"use client";
import { useEffect, useState } from "react";

export default function SellerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/seller-requests");
    const data = await res.json();
    setRequests(data);
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    await fetch(`/api/admin/seller-requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchRequests(); // refresh after update
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Pending Seller Requests</h2>

      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded shadow p-4 flex flex-col justify-between"
            >
              <div>
                {req.shopLogo && (
                  <div className="flex items-center justify-center w-[100%]">
                    <img
                    src={req.shopLogo}
                    alt="Shop Logo"
                    className="h-20 w-20 object-cover mt-2 rounded-full"
                  />
                  </div>
                )}
                <h3 className="text-lg font-semibold">{req.shopName}</h3>
                <p className="text-sm text-gray-600 mb-2 overflow-hidden">{req.shopDescription}</p>

                {/* Seller Info */}
                <div className="text-sm text-gray-700 mb-2">
                  <p><strong>Name:</strong> {req.userId?.name}</p>
                  <p><strong>Email:</strong> {req.userId?.email}</p>
                </div>

                

                {req.shopCertificate && (
                  <img
                    src={req.shopCertificate}
                    alt="Certificate pics"
                    className="rounded-md h-60 shadow-sm"
                  />
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleStatusChange(req._id, "accepted")}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleStatusChange(req._id, "rejected")}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
