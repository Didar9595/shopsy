import { dbConnect } from "../../../../../lib/dbConnect";
import { verifyToken } from "../../../../../utils/jwt";
import Order from "../../../../../models/orderModel";
import Product from "../../../../../models/productModel";

export async function PATCH(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ message: "Unauthorized" }, { status: 401 });

    const { orderId } = await req.json();

    const order = await Order.findById(orderId).populate("items.product", "seller");
    if (!order) return Response.json({ message: "Order not found" }, { status: 404 });

    const userId = decoded.id;
    const isSeller = order.items.some((it) => it.product?.seller?.toString() === userId);

    // Allow only order owner or seller
    if (order.user.toString() !== userId && !isSeller)
      return Response.json({ message: "Forbidden" }, { status: 403 });

    if (["cancelled", "delivered"].includes(order.orderStatus))
      return Response.json({ message: "Cannot change the staus of cancelled or delivered order" }, { status: 400 });

    order.orderStatus = "cancelled";
    await order.save();

    return Response.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
