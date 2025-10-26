import { dbConnect } from "../../../../../lib/dbConnect";
import Product from "../../../../../models/productModel";
import Shop from "../../../../../models/shopModel";

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const excludeId = searchParams.get("exclude");

    const filter = {
      _id: { $ne: excludeId }, // exclude current product
      $or: [
        { category },
        { subcategory }
      ]
    };

    const products = await Product.find(filter)
    .populate("shop","shopName shopLogo")
      .limit(8)
      .select("title images variants");

    return new Response(JSON.stringify({ success: true, products }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
