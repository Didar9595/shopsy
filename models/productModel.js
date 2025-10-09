import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  sku: String,
  price: Number,
  mrp: Number,
  stock: Number,
  attributes: { type: Object, default: {} },
  images: [String], // Firebase URLs for variant-level images
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    subcategory: { type: String },
    tags: [String],
    images: [String], // Firebase URLs for product-level images
    variants: [variantSchema],
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.NewProduct || mongoose.model("NewProduct", productSchema);
