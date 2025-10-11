// models/reviewModel.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewProduct",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewUser",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews by same user on same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });


export default  mongoose.models.Review || mongoose.model("Review", reviewSchema);

