import { dbConnect } from "../../../../lib/dbConnect";
import Review from "../../../../models/reviewModel";
import Product from "../../../../models/productModel";
import { verifyToken } from "../../../../utils/jwt";

export async function POST(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return new Response(JSON.stringify({ message: "Login required" }), {
        status: 401,
      });
    }

    const tokenData = verifyToken(token);
    const { productId, rating, comment } = await req.json();

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product)
      return new Response(JSON.stringify({ message: "Product not found" }), {
        status: 404,
      });

    // Seller cannot review their own product
    if (product.seller.toString() === tokenData.id)
      return new Response(JSON.stringify({ message: "You cannot review your own product" }), {
        status: 403,
      });

    // Create or update review (if user already reviewed)
    const review = await Review.findOneAndUpdate(
      { productId, userId: tokenData.id },
      { rating, comment },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return new Response(JSON.stringify({ success: true, review }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const reviews = await Review.find({ productId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return new Response(JSON.stringify({ reviews }), { status: 200 });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
