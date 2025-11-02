import { dbConnect } from "../../../../../lib/dbConnect";
import User from "../../../../../models/userModel";
import Shop from "../../../../../models/shopModel";
import Product from "../../../../../models/productModel";
import Order from "../../../../../models/orderModel";
import Review from "../../../../../models/reviewModel";
import Wishlist from "../../../../../models/wishlistModel";
import SellerRequest from "../../../../../models/sellerReqModel";

export async function GET() {
  await dbConnect();

  try {
    const [
      users,
      sellers,
      customers,
      shops,
      products,
      orders,
      reviews,
      wishlists,
      pendingRequests,
      placedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      User.countDocuments({ role: "customer" }),
      Shop.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Wishlist.countDocuments(),
      SellerRequest.countDocuments({ status: "pending" }),
      Order.countDocuments({ orderStatus: "placed" }),
      Order.countDocuments({ orderStatus: "shipped" }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
    ]);

    const orderslist = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });

    const formattedOrders = orderslist.map((order) => ({
      id: order._id,
      userName: order.user?.name || "Unknown User",
      userEmail: order.user?.email || "N/A",
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      date: order.createdAt,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        users,
        sellers,
        customers,
        shops,
        products,
        orders,
        reviews,
        wishlists,
        pendingRequests,
        orderBreakdown: {
          placed: placedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        formattedOrders,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
