import { dbConnect } from "../../../../../lib/dbConnect";
import { verifyToken } from "../../../../../utils/jwt";
import Order from "../../../../../models/orderModel";
import Wishlist from "../../../../../models/wishlistModel";
import Cart from "../../../../../models/cartModel";
import User from "../../../../../models/userModel";

export async function GET(req) {
  await dbConnect();

  try {
    // ✅ Verify token
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return new Response(JSON.stringify({ success: false, message: "No token provided" }), { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return new Response(JSON.stringify({ success: false, message: "Invalid token" }), { status: 401 });

    const userId = decoded.id;

    // ✅ Fetch all orders for this customer
    const orders = await Order.find({ user: userId }).lean();

    const totalOrders = orders.length;
     const [placedOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments({ user: userId, orderStatus: "placed" }),
      Order.countDocuments({ user: userId, orderStatus: "shipped" }),
      Order.countDocuments({ user: userId, orderStatus: "delivered" }),
      Order.countDocuments({ user: userId, orderStatus: "cancelled" }),
    ]);

    // ✅ Wishlist count
    const totalWishlist = await Wishlist.countDocuments({ user: userId });

    // ✅ Cart item count
    const cart = await Cart.findOne({ user: userId }).lean();
    const totalCartItems = cart?.items?.length || 0;

    // ✅ Profile completion (basic metric based on filled fields)
    const user = await User.findById(userId).lean();
    let profileCompletion = 50;
    if (user) {
      let filledFields = 0;
      const totalFields = 3; // name, email, phone, address
      if (user.name) filledFields++;
      if (user.email) filledFields++;
      //if (user.phone) filledFields++;
      if (user.address?.city || user.address?.street) filledFields++;
      profileCompletion = Math.round((filledFields / totalFields) * 100);
    }

     // ✅ Total amount spent (from delivered orders only)
    const delivered = await Order.find({ user: userId, orderStatus: "delivered" }).select("totalAmount");
    const totalSpent = delivered.reduce((sum, order) => sum + (order.totalAmount || 0), 0);


    // ✅ Prepare stats object
    const stats = {
      totalOrders,
      placedOrders,
      deliveredOrders,
      cancelledOrders,
      shippedOrders,
      totalSpent,
      totalWishlist,
      totalCartItems,
      profileCompletion,
    };

    return new Response(JSON.stringify({ success: true, stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
