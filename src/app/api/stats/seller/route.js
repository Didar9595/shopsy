// app/api/stats/seller/route.js
import { dbConnect } from "../../../../../lib/dbConnect";
import { verifyToken } from "../../../../../utils/jwt";
import Product from "../../../../../models/productModel";
import Order from "../../../../../models/orderModel";
import Shop from "../../../../../models/shopModel";
import Review from "../../../../../models/reviewModel";
import Wishlist from "../../../../../models/wishlistModel";

export async function GET(req) {
  await dbConnect();

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token" }),
        { status: 401 }
      );
    }

    const sellerId = decoded.id;

    // Fetch seller's shop
    const shop = await Shop.findOne({ owner: sellerId }).lean();
    if (!shop) {
      return new Response(
        JSON.stringify({ success: false, message: "Shop not found" }),
        { status: 404 }
      );
    }

    // Get seller product ids
    const productIds = await Product.find({ seller: sellerId }).distinct("_id");

    // Total products
    const totalProducts = productIds.length;

    // Find all orders that contain any of these products (items.product references product _id)
    // populate user minimally if needed later
    const sellerOrders = await Order.find({ "items.product": { $in: productIds } }).lean();

    // If no orders, return zeros early
    if (!sellerOrders || sellerOrders.length === 0) {
      const statsEmpty = {
        totalProducts,
        totalOrders: 0,
        placedOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalReviews: await Review.countDocuments({ productId: { $in: productIds } }),
        totalCustomers: 0,
        wishlistCount: await Wishlist.countDocuments({ "items.product": { $in: productIds } }),
      };
      return new Response(JSON.stringify({ success: true, shop, stats: statsEmpty }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // compute order status counts & revenue (only count items that belong to this seller)
    let placedOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let pendingOrders = 0; // interpret as orderStatus === 'placed' or paymentStatus==='pending' if you want
    let totalRevenue = 0; // sum of (priceAtAdd * qty) for items belonging to seller where orderStatus === 'delivered'

    const customerSet = new Set(); // unique customers

    for (const ord of sellerOrders) {
      const status = (ord.orderStatus || "").toLowerCase();

      if (status === "placed") placedOrders++;
      else if (status === "shipped") shippedOrders++;
      else if (status === "delivered") deliveredOrders++;
      else if (status === "cancelled") cancelledOrders++;

      if (status === "placed") pendingOrders++; // you can change logic for "pending" if needed

      // collect unique customer
      if (ord.user) customerSet.add(String(ord.user));

      // revenue calculation: only include items in the order that belong to this seller's products
      // and only if orderStatus is 'delivered' (considered final)
      if (status === "delivered") {
        for (const it of ord.items || []) {
          // it.product may be ObjectId or populated doc; compare as string
          const prodIdStr = it.product ? String(it.product) : null;
          if (prodIdStr && productIds.map(String).includes(prodIdStr)) {
            const itemTotal = (Number(it.priceAtAdd) || 0) * (Number(it.quantity) || 0);
            totalRevenue += itemTotal;
          }
        }
      }
    }

    const totalOrders = sellerOrders.length;
    const totalReviews = await Review.countDocuments({ productId: { $in: productIds } });
    const wishlistCount = await Wishlist.countDocuments({ "items.product": { $in: productIds } });
    const totalCustomers = customerSet.size;

    const stats = {
      totalProducts,
      totalOrders,
      pendingOrders,
      placedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      totalReviews,
      totalCustomers,
      wishlistCount,
    };

    return new Response(JSON.stringify({ success: true, shop, stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
