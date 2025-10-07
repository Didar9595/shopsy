"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthProvider";
import { User } from "lucide-react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../../../firebase/firebase";


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

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    shopName: "",
    shopDescription: "",
    shopLogo: "",
    shopCertificate: "",
  });

  const [shopLogoFile, setShopLogoFile] = useState(null);
  const [shopCertificateFile, setShopCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  //  Check if seller request already exists
  useEffect(() => {
    const checkRequest = async () => {
      try {
        const res = await fetch(`/api/seller-request?userId=${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setRequestStatus(data.status);
        }
      } catch (err) {
        console.error("Error checking request:", err);
      }
    };
    if (user?._id) checkRequest();
  }, [user]);

  //  Prefill user data
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

  //  Handle input change
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

  //  Update profile
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
      setMessage(res.ok ? "Profile updated successfully" : data.message || "Update failed");
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setLoading(false);
    }

  };

  //  Firebase upload helper
  const handleImageUpload = (file, type) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject("No file selected");
        return;
      }


      setUploading(true);
      setUploadError(null);

      const storage = getStorage(app);
      const fileName = `${type}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `shopsy/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed", error);
          setUploading(false);
          setUploadError("Upload failed");
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);
          resolve(downloadURL);
        }
      );
    });
    

};

//  Submit seller request
const handleSubmit = async (e) => {
e.preventDefault();


    try {
      // Auto-upload if user forgot to click upload buttons
      if (!form.shopLogo && shopLogoFile)
        form.shopLogo = await handleImageUpload(shopLogoFile, "shopLogo");

      if (!form.shopCertificate && shopCertificateFile)
        form.shopCertificate = await handleImageUpload(shopCertificateFile, "shopCertificate");

      if (!form.shopLogo || !form.shopCertificate) {
        alert("Please upload both Shop Logo and Shop Certificate images before submitting.");
        return;
      }

      const res = await fetch("/api/seller-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, ...form }),
      });

      if (res.ok) {
        alert("Request submitted successfully!");
        setShowForm(false);
        setRequestStatus("pending");
      } else {
        alert("Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request");
    }

  };

  return (<div className="p-2 sm:p-0">
  
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow mt-6 border-2 border-dashed border-green-500"> <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>


      <div className="w-full flex items-center justify-center">
        <User size={80} className="shadow-sm rounded-full p-2" />
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

    {/* Become Seller Button */}
    <div className="w-full flex items-center justify-center p-5">
      {user && user.role === "customer" && (
        <button
          onClick={() => setShowForm(true)}
          disabled={loading || requestStatus === "pending"}
          className={`px-6 py-2 rounded-md text-white transition ${requestStatus === "pending" ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {loading ? "Submitting..." : requestStatus === "pending" ? "Request Pending" : "Become a Seller"}
        </button>
      )}
    </div>

    {/* Seller Request Modal */}
    {showForm && (
      <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-1 sm:p-0">
        <div className="bg-white p-6 rounded w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center text-green-500">Request to Open a Shop</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Shop Name"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              className="border p-2 rounded"
              required
            />
            <textarea
              placeholder="Shop Description"
              value={form.shopDescription}
              onChange={(e) => setForm({ ...form, shopDescription: e.target.value })}
              className="border p-2 rounded"
            />

            {/* Shop Logo Upload */}
            <label className="block text-sm font-medium text-gray-700">Shop Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setShopLogoFile(e.target.files[0])}
              className="border p-2 rounded"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const url = await handleImageUpload(shopLogoFile, "shopLogo");
                  setForm((prev) => ({ ...prev, shopLogo: url }));
                } catch (err) {
                  setUploadError(err.toString());
                }
              }}
              disabled={!shopLogoFile || uploading}
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
            >
              {uploading ? "Uploading..." : "Upload Logo"}
            </button>
            {form.shopLogo && <p className="text-green-600 text-sm mt-1">Logo uploaded </p>}

            {/* Certificate Upload */}
            <label className="block text-sm font-medium text-gray-700 mt-4">Shop Certificate</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setShopCertificateFile(e.target.files[0])}
              className="border p-2 rounded"
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  const url = await handleImageUpload(shopCertificateFile, "shopCertificate");
                  setForm((prev) => ({ ...prev, shopCertificate: url }));
                } catch (err) {
                  setUploadError(err.toString());
                }
              }}
              disabled={!shopCertificateFile || uploading}
              className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
            >
              {uploading ? "Uploading..." : "Upload Certificate"}
            </button>
            {form.shopCertificate && <p className="text-green-600 text-sm mt-1">Certificate uploaded </p>}

            {uploadError && <p className="text-red-500 text-sm">{uploadError}</p>}
<p className="italic text-sm text-rose-400">Note: Image size should be less than 2MB.</p>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                disabled={uploading || !form.shopLogo || !form.shopCertificate}
              >
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
