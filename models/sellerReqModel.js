import mongoose from "mongoose";

const sellerRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewUser",
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    shopDescription: {
      type: String,
    },
    shopLogo: {
      type: String, 
      default: "",
    },
    shopCertificate: {
      type: String, 
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SellerRequest ||mongoose.model("SellerRequest", sellerRequestSchema);
