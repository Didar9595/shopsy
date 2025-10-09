"use client";

import { useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../../../firebase/firebase";

export default function AddEditProduct({ existing = null, onDone, onCancel }) {
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [category, setCategory] = useState(existing?.category || "");
  const [subcategory, setSubcategory] = useState(existing?.subcategory || "");
  const [tagsText, setTagsText] = useState((existing?.tags || []).join(", "));
  const [productImages, setProductImages] = useState([]);
  const [imageURLs, setImageURLs] = useState(existing?.images || []);
  const [variants, setVariants] = useState(
    existing?.variants || [
      { sku: "", price: 0, mrp: 0, stock: 0, attributes: {}, images: [] },
    ]
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  //  Category/Subcategory Options
  const categoryOptions = {
    Electronics: ["Mobiles", "TVs", "Refrigerators", "Laptops", "Headphones"],
    Clothes: ["Men", "Women", "Kids"],
    "Home & Kitchen": ["Furniture", "Cookware", "Decor", "Appliances"],
    Beauty: ["Makeup", "Skincare", "Fragrance", "Haircare"],
    Sports: ["Cricket", "Football", "Fitness", "Cycling"],
    Books: ["Fiction", "Non-fiction", "Educational", "Comics"],
  };

  //  Firebase Upload Function
  const handleImageUpload = async (files, callback) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const storage = getStorage(app);
    const uploadedURLs = [];

    for (const file of files) {
      const fileName = `product-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `shopsy/products/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error("Upload failed:", error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            uploadedURLs.push(downloadURL);
            resolve();
          }
        );
      });
    }

    setUploading(false);
    setUploadProgress(0);
    callback(uploadedURLs);
  };

  //  Variant Helpers
  const addVariant = () => {
    setVariants([...variants, { sku: "", price: 0, mrp: 0, stock: 0, attributes: {}, images: [] }]);
  };

  const updateVariant = (index, field, value) => {
    const next = [...variants];
    if (field === "attributes") {
      next[index].attributes = { ...next[index].attributes, ...value };
    } else if (field === "images") {
      next[index].images = value;
    } else {
      next[index][field] = value;
    }
    setVariants(next);
  };

  const removeVariant = (index) => {
    const next = variants.filter((_, i) => i !== index);
    setVariants(next.length ? next : [{ sku: "", price: 0, mrp: 0, stock: 0, attributes: {}, images: [] }]);
  };

  //  Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        category,
        subcategory,
        tags: tagsText.split(",").map((s) => s.trim()).filter(Boolean),
        images: imageURLs,
        variants,
      };

      const token = localStorage.getItem("token");
      const url = existing ? `/api/products/${existing._id}` : "/api/products";
      const method = existing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save product");
      onDone && onDone();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
      <div>
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        {/*  Category Dropdown */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory(""); // reset subcategory when category changes
            }}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {Object.keys(categoryOptions).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/*  Subcategory Dropdown */}
        {category && (
          <div>
            <label className="block text-sm font-medium">Subcategory</label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Subcategory</option>
              {categoryOptions[category].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        {/*  Product Image Upload */}
        <div>
          <label className="block text-sm font-medium">Product Images</label>
          <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-start">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setProductImages([...e.target.files])}
              className="border p-2 rounded w-[70%] sm:w-[100%]"
            />
            <button
              type="button"
              disabled={uploading || productImages.length === 0}
              onClick={() => handleImageUpload(productImages, (urls) => setImageURLs([...imageURLs, ...urls]))}
              className="ml-2 bg-blue-500 text-white px-3 py-1 rounded mt-2"
            >
              {uploading ? `Uploading... ${uploadProgress}%` : "Upload"}
            </button>
          </div>

          {imageURLs.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {imageURLs.map((url, i) => (
                <img key={i} src={url} alt="product" className="w-16 h-16 rounded border" />
              ))}
            </div>
          )}
        </div>

        {/*  Variants */}
        <div>
          <h4 className="font-semibold mb-2">Variants</h4>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="p-3 border rounded">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div >
                    <label className="block text-sm font-medium">SKU</label>
                    <input placeholder="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Price</label>
                    <input placeholder="Price" type="number" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} className="border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">MRP</label>
                    <input placeholder="MRP" type="number" value={v.mrp} onChange={(e) => updateVariant(i, "mrp", e.target.value)} className="border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Stock</label>
                    <input placeholder="Stock" type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className="border p-2 rounded" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  

                  {/*  Variant Image Upload */}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files, (urls) => updateVariant(i, "images", [...v.images, ...urls]))}
                    className="border p-2 rounded w-[70%]"
                  />
                </div>

                {v.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {v.images.map((url, idx) => (
                      <img key={idx} src={url} alt="variant" className="w-12 h-12 rounded border" />
                    ))}
                  </div>
                )}

                <div className="mt-2">
                  <label className="block text-sm">Attributes (e.g. size:M,color:Red)</label>
                  <input
                    value={Object.entries(v.attributes || {})
                      .map(([k, val]) => `${k}:${val}`)
                      .join(", ")}
                    onChange={(e) => {
                      const obj = {};
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .forEach((pair) => {
                          if (!pair) return;
                          const [k, val] = pair.split(":").map((x) => x.trim());
                          if (k) obj[k] = val || "";
                        });
                      updateVariant(i, "attributes", obj);
                    }}
                    className="w-full border p-2 rounded"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => removeVariant(i)} className="bg-red-500 text-white px-3 py-1 rounded">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button type="button" onClick={addVariant} className="bg-blue-500 text-white px-3 py-1 rounded">
              + Add Variant
            </button>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button type="button" onClick={onCancel} disabled={saving} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading} className="px-4 py-2 bg-green-600 text-white rounded">
            {saving ? "Saving..." : existing ? "Update Product" : "Create Product"}
          </button>
        </div>


      </div>
    </form>
  );
}
