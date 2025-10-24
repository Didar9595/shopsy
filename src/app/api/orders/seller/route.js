import { dbConnect } from "../../../../../lib/dbConnect";
import { verifyToken } from "../../../../../utils/jwt";
import Order from "../../../../../models/orderModel";
import Product from "../../../../../models/productModel";

export async function GET(req) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const sellerId = decoded.id;

    // 1️⃣ Get all products owned by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select(
      "_id title variants images"
    );

    const productIds = sellerProducts.map((p) => p._id);

    // 2️⃣ Find all orders that include any of seller's products
    const orders = await Order.find({ "items.product": { $in: productIds } })
      .populate("user", "name email")
      .populate("items.product", "title images seller variants")
      .sort({ createdAt: -1 })
      .lean();

    // 3️⃣ Enrich items with variant details
    const enrichedOrders = orders.map((order) => ({
      ...order,
      items: order.items
        .filter((it) => it.product && productIds.some((id) => id.equals(it.product._id))) // Only seller's products
        .map((it) => {
          let variantDetails = null;
          if (it.variantSku && it.product?.variants) {
            variantDetails = it.product.variants.find(
              (v) => v.sku === it.variantSku
            );
          }

          return {
            ...it,
            variantDetails,
          };
        }),
    }));

    return Response.json({ success: true, orders: enrichedOrders });
  } catch (err) {
    console.error("Seller order fetch error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
