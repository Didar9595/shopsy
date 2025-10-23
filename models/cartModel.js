import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewProduct",
    required: true,
  },
  variantSku: { type: String },
  variantAttributes: { type: Object },
  variantImages: [String],
  quantity: { type: Number, required: true, default: 1 },
  priceAtAdd: { type: Number, required: true }, // price at time of adding
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewUser",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.NewCart || mongoose.model("NewCart", cartSchema);
