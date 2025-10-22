import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "NewUser", required: true },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NewProduct",
          required: true,
        },
        variantSku: { type: String }, // for variant tracking
        variantAttributes: { type: Object }, // optional: color, size, etc.
        quantity: { type: Number, required: true },
        priceAtAdd: { type: Number, required: true },
        image:{type:String,required:true},
      },
    ],

    totalAmount: { type: Number, required: true },

    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["placed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

export default mongoose.models.NewOrder || mongoose.model("NewOrder", orderSchema);
