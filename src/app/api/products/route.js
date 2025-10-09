import { dbConnect } from "../../../../lib/dbConnect";
import { verifyToken } from "../../../../utils/jwt";
import Product from "../../../../models/productModel";
import Shop from "../../../../models/shopModel";

export async function POST(req) {
  await dbConnect();
  try {
     const token = req.headers.get("authorization")?.split(" ")[1];
    const tokenData = verifyToken(token);
    const { title, description, category, subcategory, tags, images, variants } = await req.json();
    console.log(tokenData.id)
    const shop = await Shop.findOne({ owner: tokenData.id });
    if (!shop) {
      return new Response(JSON.stringify({ message: "Shop not found" }), { status: 404 });
    }

    const product = await Product.create({
      title,
      description,
      category,
      subcategory,
      tags,
      images,
      variants,
      shop: shop._id,
      seller: tokenData.id,
    });

    return new Response(JSON.stringify({ success: true, product }), { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();
  try {
         const token = req.headers.get("authorization")?.split(" ")[1];
    const tokenData = verifyToken(token);
    const shop = await Shop.findOne({ owner: tokenData.id });
    if (!shop)
      return new Response(JSON.stringify({ message: "Shop not found" }), { status: 404 });

    const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 });
    return new Response(JSON.stringify({ success: true, products }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), { status: 500 });
  }
}
