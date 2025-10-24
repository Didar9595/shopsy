import { dbConnect } from "../../../../lib/dbConnect";
import { verifyToken } from "../../../../utils/jwt";
import Order from "../../../../models/orderModel";
import Cart from "../../../../models/cartModel";
import User from "../../../../models/userModel";

export async function POST(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(decoded.id);
    if (!user) return Response.json({ message: "User not found" }, { status: 404 });

    const body = await req.json();
    const { fromCart, address, productId, quantity, price, variantSku, variantAttributes,image } = body;

    let items = [];

    if (fromCart) {
      const cart = await Cart.findOne({ user: decoded.id }).populate("items.product");
      if (!cart || !cart.items.length)
        return Response.json({ message: "Cart empty" }, { status: 400 });
        items = cart.items.map((it) => ({
        product: it.product._id,
        variantSku: it.variantSku,
        variantAttributes: it.variantAttributes?.[0],
        quantity: it.quantity,
        priceAtAdd: it.priceAtAdd,
        image:it.variantImages?.[0],
      }));


      await Cart.findOneAndUpdate({ user: decoded.id }, { items: [] });
    } else {
      items = [
        {
          product: productId,
          variantSku,
          variantAttributes,
          quantity,
          priceAtAdd: price,
          image:image,
        },
      ];
    }

    const totalAmount = items.reduce(
      (sum, it) => sum + it.priceAtAdd * it.quantity,
      0
    );

    const shippingAddress = address || user.address || {};

    const order = await Order.create({
      user: decoded.id,
      items,
      totalAmount,
      shippingAddress,
      paymentStatus: "paid",
      orderStatus: "placed",
    });

    return Response.json({ success: true, order });
  } catch (err) {
    console.log(err);
    return Response.json({ message: "Failed to place order" }, { status: 500 });
  }
}

// GET Orders
export async function GET(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ message: "Unauthorized" }, { status: 401 });

    const orders = await Order
      .find({ user: decoded.id })
      .populate("items.product", "title images")
      .sort({ createdAt: -1 });

    return Response.json({ orders });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Error fetching orders" }, { status: 500 });
  }
}

// PATCH to update orderStatus or paymentStatus
export async function PATCH(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return Response.json({ message: "Unauthorized" }, { status: 401 });

    const { orderId, orderStatus } = await req.json();

    const orders = await Order.findById(orderId).populate("items.product", "seller");
     if (["cancelled", "delivered"].includes(orders.orderStatus))
      return Response.json({ message: "Cannot change the staus of cancelled or delivered order" }, { status: 400 });

    const update = {};
    //if (paymentStatus) update.paymentStatus = paymentStatus;
    if (orderStatus) update.orderStatus = orderStatus;

    


    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
    if (!order) return Response.json({ message: "Order not found" }, { status: 404 });

    return Response.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return Response.json({ message: "Failed to update order" }, { status: 500 });
  }
}
