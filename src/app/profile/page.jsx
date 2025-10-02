"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { User } from "lucide-react";


export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const[showForm,setShowForm]=useState(false);
  const [form, setForm] = useState({shopName: "",shopDescription: "",shopLogo: "",shopCertificate: "",});

  const [requestStatus, setRequestStatus] = useState(null);
   useEffect(() => {
    const checkRequest = async () => {
      try {
const res = await fetch(`/api/seller-request?userId=${user._id}`, {
      method: "GET",
    });        
    const data = await res.json();
        if (res.status==200) {
          setRequestStatus(data.status); 
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user?._id) {
      checkRequest();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zip: user.address?.zip || "",
          country: user.address?.country || "",
        },
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["street", "city", "state", "zip", "country"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) setMessage(data.message || "Update failed");
      else setMessage("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };




  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/seller-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user._id,
        ...form,
      }),
    });

    if (res.ok) {
      alert("Request submitted successfully!");
      setShowForm(false);
    } else {
      alert("Failed to submit request");
    }
  };

  return (
    <div className="p-2 sm:p-0">
      <div className="max-w-lg mx-auto bg-white p-6 rounded shadow mt-6 border-2 border-dashed border-green-500">
        <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
        
        <div className="w-[100%] flex items-center justify-center">
            <User size={80} className="shadow-sm rounded-full p-2"/>
        </div>
       
        {user && (
          <>
            <p className="mb-2 text-lg">Email: {user.email}</p>
            <p className="mb-4 text-lg">Role: {user.role}</p>
          </>
        )}

        {message && <p className="text-green-500 mb-4">{message}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <h3 className="text-lg font-semibold mt-4">Address</h3>

          {["street", "city", "state", "zip", "country"].map((field) => (
            <div key={field} className="grid grid-cols-1 sm:grid-cols-2 items-center">
              <label className="block mb-1 capitalize">{field}</label>
              <input
                type="text"
                name={field}
                value={formData.address[field]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      <div className="w-full flex items-center justify-center p-5">
      {
        user && user.role=="customer" &&
         <button
          onClick={()=>setShowForm(true)}
          disabled={loading || requestStatus === "pending"}
          className={`px-6 py-2 rounded-md text-white transition ${
            requestStatus === "pending"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading
            ? "Submitting..."
            : requestStatus === "pending"
            ? "Request Pending"
            : "Become a Seller"}
        </button>
        
      }
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-1 sm:p-0">
          <div className="bg-white  p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-green-500" >Request to Open a Shop</h2>
            <form onSubmit={handleSubmit}  className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Shop Name"
                value={form.shopName}
                onChange={(e) =>
                  setForm({ ...form, shopName: e.target.value })
                }
                className="border p-2 rounded"
                required
              />
              <textarea
                placeholder="Shop Description"
                value={form.shopDescription}
                onChange={(e) =>
                  setForm({ ...form, shopDescription: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Shop Logo URL"
                value={form.shopLogo}
                onChange={(e) =>
                  setForm({ ...form, shopLogo: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Shop Certificate URL"
                value={form.shopCertificate}
                onChange={(e) =>
                  setForm({ ...form, shopCertificate: e.target.value })
                }
                className="border p-2 rounded"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
