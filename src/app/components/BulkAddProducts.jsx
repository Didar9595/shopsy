// BulkAddProducts.jsx
"use client";

import React, { useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../../../firebase/firebase"; // adjust import path to your firebase file
import { Plus, Trash, Upload } from "lucide-react";

// Helper: upload files to firebase and return array of urls (same approach you saved earlier)
async function uploadFilesToFirebase(files, setProgress) {
  if (!files || files.length === 0) return [];
  const storage = getStorage(app);
  const uploaded = [];

  for (const file of files) {
    const fileName = `product-${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `shopsy/products/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (setProgress) {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(progress);
          }
        },
        (err) => {
          console.error("Upload failed:", err);
          reject(err);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          uploaded.push(url);
          resolve();
        }
      );
    });
  }

  if (setProgress) setProgress(0);
  return uploaded;
}

// default empty product shape
const emptyVariant = () => ({
  sku: "",
  price: 0,
  mrp: 0,
  stock: 0,
  attributes: {},
  images: [],
});

const emptyProduct = () => ({
  title: "",
  description: "",
  category: "",
  subcategory: "",
  tagsText: "",
  images: [], // product-level image urls
  imageFiles: [], // File objects before upload
  variants: [emptyVariant()],
});

export default function BulkAddProducts({ onDone }) {
  const [products, setProducts] = useState([emptyProduct()]);
  const [uploadingProgress, setUploadingProgress] = useState({}); // { productIndex: progressNumber }
  const [saving, setSaving] = useState(false);
  const categoryOptions = {
    Electronics: ["Mobiles", "TVs", "Refrigerators", "Laptops", "Headphones"],
    Clothes: ["Men", "Women", "Kids"],
    "Home & Kitchen": ["Furniture", "Cookware", "Decor", "Appliances"],
    Beauty: ["Makeup", "Skincare", "Fragrance", "Haircare"],
    Sports: ["Cricket", "Football", "Fitness", "Cycling"],
    Books: ["Fiction", "Non-fiction", "Educational", "Comics"],
  };

  // Product handlers
  const addProduct = () => setProducts((p) => [...p, emptyProduct()]);
  const removeProduct = (idx) => setProducts((p) => p.filter((_, i) => i !== idx));

  const updateProductField = (idx, field, value) =>
    setProducts((p) => {
      const next = [...p];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });

  // Variant handlers
  const addVariant = (prodIdx) =>
    setProducts((p) => {
      const next = [...p];
      next[prodIdx].variants = [...(next[prodIdx].variants || []), emptyVariant()];
      return next;
    });

  const removeVariant = (prodIdx, varIdx) =>
    setProducts((p) => {
      const next = [...p];
      next[prodIdx].variants = next[prodIdx].variants.filter((_, i) => i !== varIdx);
      if (next[prodIdx].variants.length === 0) next[prodIdx].variants = [emptyVariant()];
      return next;
    });

  const updateVariantField = (prodIdx, varIdx, field, value) =>
    setProducts((p) => {
      const next = [...p];
      next[prodIdx].variants = [...next[prodIdx].variants];
      next[prodIdx].variants[varIdx] = { ...next[prodIdx].variants[varIdx], [field]: value };
      return next;
    });

  // Attribute input: accepts "key:value, key2:value2" -> object
  const parseAttributesString = (str) => {
    const obj = {};
    str
      .split(",")
      .map((s) => s.trim())
      .forEach((pair) => {
        if (!pair) return;
        const [k, v] = pair.split(":").map((x) => x?.trim());
        if (k) obj[k] = v ?? "";
      });
    return obj;
  };

  // Product-level image file selection
  const handleProductFilesSelected = (prodIdx, files) =>
    updateProductField(prodIdx, "imageFiles", Array.from(files));

  // Upload product images (product-level)
  const uploadProductImages = async (prodIdx) => {
    const prod = products[prodIdx];
    if (!prod.imageFiles || prod.imageFiles.length === 0) return;
    setUploadingProgress((s) => ({ ...s, [prodIdx]: 1 }));
    try {
      const urls = await uploadFilesToFirebase(prod.imageFiles, (p) =>
        setUploadingProgress((s) => ({ ...s, [prodIdx]: p }))
      );
      // append to existing product images
      updateProductField(prodIdx, "images", [...(prod.images || []), ...urls]);
      // clear file list
      updateProductField(prodIdx, "imageFiles", []);
    } catch (err) {
      alert("Product image upload failed. See console.");
      console.error(err);
    } finally {
      setUploadingProgress((s) => ({ ...s, [prodIdx]: 0 }));
    }
  };

  // Upload variant images
  const handleVariantFilesSelected = (prodIdx, varIdx, files) => {
    const fileArr = Array.from(files);
    // temporarily set on variant as `pendingFiles` (not stored in model, just local)
    setProducts((p) => {
      const next = [...p];
      const variant = { ...(next[prodIdx].variants[varIdx] || {}) };
      variant.pendingFiles = fileArr;
      next[prodIdx].variants[varIdx] = variant;
      return next;
    });
  };

  const uploadVariantImages = async (prodIdx, varIdx) => {
    const variant = products[prodIdx].variants[varIdx];
    const pending = variant.pendingFiles || [];
    if (!pending.length) return;
    setUploadingProgress((s) => ({ ...s, [`v-${prodIdx}-${varIdx}`]: 1 }));
    try {
      const urls = await uploadFilesToFirebase(pending, (p) =>
        setUploadingProgress((s) => ({ ...s, [`v-${prodIdx}-${varIdx}`]: p }))
      );
      // append to variant.images
      setProducts((p) => {
        const next = [...p];
        const v = { ...(next[prodIdx].variants[varIdx] || {}) };
        v.images = [...(v.images || []), ...urls];
        delete v.pendingFiles;
        next[prodIdx].variants[varIdx] = v;
        return next;
      });
    } catch (err) {
      alert("Variant image upload failed. See console.");
      console.error(err);
    } finally {
      setUploadingProgress((s) => ({ ...s, [`v-${prodIdx}-${varIdx}`]: 0 }));
    }
  };

  // Submit all products: validate, then send to backend
  const handleSubmitAll = async () => {
    // basic validation
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.title || !p.category || !p.subcategory) {
        return alert(`Product #${i + 1} requires Title, Category and Subcategory`);
      }
      // ensure at least one image exists (you can relax this)
      if (!p.images || p.images.length === 0) {
        return alert(`Please upload at least one image for product #${i + 1}`);
      }
      for (let j = 0; j < p.variants.length; j++) {
        const v = p.variants[j];
        if (!v.sku) return alert(`Variant ${j + 1} of product #${i + 1} requires SKU`);
      }
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please login first");

      // Build payload: map tagsText -> tags array, attributes string -> object
      const payload = products.map((p) => ({
        title: p.title,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        tags: (p.tagsText || "").split(",").map((t) => t.trim()).filter(Boolean),
        images: p.images || [],
        variants: (p.variants || []).map((v) => ({
          sku: v.sku,
          price: Number(v.price || 0),
          mrp: Number(v.mrp || 0),
          stock: Number(v.stock || 0),
          attributes: typeof v.attributes === "string" ? parseAttributesString(v.attributes) : v.attributes || {},
          images: v.images || [],
        })),
      }));

      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ products: payload }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert(data.message || "Bulk upload failed");
      } else {
        alert("Products added successfully!");
        onDone && onDone();
        // reset to single empty product
        setProducts([emptyProduct()]);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting products. See console.");
    } finally {
      setSaving(false);
    }
  };

  // Small UI helpers
  const updateVariantAttributeString = (prodIdx, varIdx, str) => {
    const obj = parseAttributesString(str);
    updateVariantField(prodIdx, varIdx, "attributes", obj);
  };

  return (
    <div className="mt-5">
      <h2 className="text-xl font-semibold mb-4">Bulk Add Products</h2>
      <div className="space-y-6">
        {products.map((prod, pi) => (
          <div key={pi} className="p-4 shadow-md rounded bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Product #{pi + 1}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeProduct(pi)}
                  className="px-2 py-1 bg-red-500 text-white rounded flex items-center gap-2 cursor-pointer"
                >
                  <Trash size={14} /> Remove Product
                </button>
              </div>
            </div>

            <div className="flex sm:flex-row flex-col sm:flex-wrap gap-3">
              <input
                placeholder="Title"
                value={prod.title}
                onChange={(e) => updateProductField(pi, "title", e.target.value)}
                className="border px-2 py-2 rounded  sm:w-[60%]"
              />
              <select
                className="border px-2 py-2 rounded sm:w-[35%]"
                value={prod.category}
                onChange={(e) => {
                  updateProductField(pi, "category", e.target.value);
                  updateProductField(pi, "subcategory", "");
                }}
              >
                <option value="">Select Category</option>
                {Object.keys(categoryOptions).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <textarea
                placeholder="Description"
                value={prod.description}
                onChange={(e) => updateProductField(pi, "description", e.target.value)}
                className="border px-2 py-2 rounded md:col-span-2 sm:w-[60%]"
              />

              <select
                className="border px-2 py-2 rounded sm:w-[35%]"
                value={prod.subcategory}
                onChange={(e) => updateProductField(pi, "subcategory", e.target.value)}
              >
                <option value="">Select Subcategory</option>
                {(categoryOptions[prod.category] || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                placeholder="Tags (comma separated)"
                value={prod.tagsText}
                onChange={(e) => updateProductField(pi, "tagsText", e.target.value)}
                className="border px-2 py-2 rounded md:col-span-3"
              />
            </div>

            {/* Product images */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Product Images</label>
              <div className="flex sm:flex-row flex-col gap-2 items-start sm:items-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleProductFilesSelected(pi, e.target.files)}
                  className="border p-2 rounded w-[100%]"
                />
                <button
                  onClick={() => uploadProductImages(pi)}
                  className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2 cursor-pointer"
                  disabled={!prod.imageFiles || prod.imageFiles.length === 0}
                >
                  <Upload size={14} /> Upload
                </button>
                {uploadingProgress[pi] > 0 && <span>{uploadingProgress[pi]}%</span>}
              </div>

              {prod.images && prod.images.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {prod.images.map((u, i) => (
                    <img key={i} src={u} alt={`prod-${pi}-${i}`} className="w-20 h-20 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>

            {/* Variants block */}
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Variants</h4>
                <button
                  onClick={() => addVariant(pi)}
                  className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              {prod.variants.map((v, vi) => (
                <div key={vi} className="p-2 border-1 border-dashed border-green-600 rounded">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center items-start  mb-2">
                    <div className="flex flex-col gap-1 sm:w-[100%] ">
                      <label htmlFor="">SKU:</label>
                      <input
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => updateVariantField(pi, vi, "sku", e.target.value)}
                      className="border px-2 py-1 rounded flex-1"
                    />
                    </div>

                    <div className="flex flex-col gap-1 sm:w-[100%]">
                      <label htmlFor="">Price:</label>
                      <input
                      placeholder="Price"
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariantField(pi, vi, "price", e.target.value)}
                      className="border px-2 py-1 rounded sm:w-28 w-[100%]"
                    />
                    </div>

                    <div className="flex flex-col gap-1 sm:w-[100%]">
                      <label htmlFor="">MRP:</label>
                      <input
                      placeholder="MRP"
                      type="number"
                      value={v.mrp}
                      onChange={(e) => updateVariantField(pi, vi, "mrp", e.target.value)}
                      className="border px-2 py-1 rounded sm:w-28 w-[100%]"
                    />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="">Stocks:</label>
                      <input
                      placeholder="Stock"
                      type="number"
                      value={v.stock}
                      onChange={(e) => updateVariantField(pi, vi, "stock", e.target.value)}
                      className="border px-2 py-1 rounded sm:w-28 w-[100%]"
                    />
                    </div>

                    <button
                      onClick={() => removeVariant(pi, vi)}
                      className="px-2 py-1 bg-red-500 text-white rounded cursor-pointer mt-5"
                    >
                      <Trash size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 items-center mb-2 mt-5">
                    <input
                      placeholder="Attributes (size:M,color:Red)"
                      value={
                        typeof v.attributes === "string"
                          ? v.attributes
                          : Object.entries(v.attributes || {})
                              .map(([k, val]) => `${k}:${val}`)
                              .join(", ")
                      }
                      onChange={(e) => updateVariantAttributeString(pi, vi, e.target.value)}
                      className="border px-2 py-1 rounded flex-1"
                    />

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleVariantFilesSelected(pi, vi, e.target.files)}
                      className="border px-2 py-1 rounded w-[100%] sm:w-[40%]"
                    />
                    <button
                      onClick={() => uploadVariantImages(pi, vi)}
                      className="px-2 py-1 bg-blue-600 text-white rounded cursor-pointer"
                    >
                      Upload Variant Imgs
                    </button>
                    {uploadingProgress[`v-${pi}-${vi}`] > 0 && <span>{uploadingProgress[`v-${pi}-${vi}`]}%</span>}
                  </div>

                  {v.images && v.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {v.images.map((u, idx) => (
                        <img key={idx} src={u} alt={`variant-${pi}-${vi}-${idx}`} className="w-16 h-16 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2">
          <button onClick={addProduct} className="px-4 py-1 bg-gray-700 text-white rounded flex items-center gap-2 cursor-pointer">
            <Plus size={16} /> Add Product
          </button>

          <button
            onClick={handleSubmitAll}
            disabled={saving}
            className="px-4 py-1 bg-green-600 text-white rounded cursor-pointer"
          >
            {saving ? "Saving..." : "Submit All"}
          </button>
        </div>
      </div>
    </div>
  );
}
