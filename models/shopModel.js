// models/shopModel.js
import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewUser",
      required: true,
      unique: true, // each user can own only one shop
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    shopDescription: {
      type: String,
      default: "",
    },
    shopLogo: {
      type: String, // URL or file path
      default: "",
    },
    shopCertificate: {
      type: String, // URL or file path of certificate
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Shop || mongoose.model("Shop", shopSchema);

