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
    </div>
  );
}
