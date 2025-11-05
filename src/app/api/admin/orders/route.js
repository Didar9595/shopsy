import { dbConnect } from "../../../../../lib/dbConnect";
import { verifyToken } from "../../../../../utils/jwt";
import Order from "../../../../../models/orderModel";
import Product from "../../../../../models/productModel";
import User from "../../../../../models/userModel";

export async function GET(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin")
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("items.product", "title images")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
