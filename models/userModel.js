import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain, will encrypt in backend API
  address: { 
    street: { type: String,default:"" },
    city: { type: String,default:"" },
    state: { type: String,default:""  },
    zip: { type: String ,default:"" },
    country: { type: String, default: "" }
  } ,
  role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  isSellerApproved: { type: Boolean, default: false } // tracks if seller is approved
}, { timestamps: true });

export default mongoose.models.NewUser || mongoose.model("NewUser", userSchema);


