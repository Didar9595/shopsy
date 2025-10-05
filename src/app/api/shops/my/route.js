// app/api/shops/my/route.js
import { dbConnect } from "../../../../../lib/dbConnect";
import Shop from "../../../../../models/shopModel";
import { verifyToken } from "../../../../../utils/jwt";

export async function GET(req) {
  await dbConnect();
  try {
    // Extract userId from JWT (assuming you’re storing token in headers)
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.id;

    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return new Response(JSON.stringify({ message: "Shop not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ shop }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error fetching shop" }), { status: 500 });
  }
}
