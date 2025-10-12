// app/api/wishlist/route.js
import { dbConnect } from "../../../../lib/dbConnect";
import Wishlist from "../../../../models/wishlistModel";
import Product from "../../../../models/productModel";
import { verifyToken } from "../../../../utils/jwt";

export async function GET(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    const td = verifyToken(token);

    const wishlist = await Wishlist.findOne({ user: td.id }).populate("items.product");
    return new Response(JSON.stringify({ wishlist }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Error fetching wishlist" }), { status: 500 });
  }
}

export async function POST(req) {
  // add product to wishlist
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    const td = verifyToken(token);
    const { productId } = await req.json();

    const product = await Product.findById(productId);
    if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

   const wl = await Wishlist.findOneAndUpdate(
      { user: td.id },
      { $addToSet: { items: { product: productId } } }, 
      { upsert: true, new: true }
    ).populate("items.product"); 

    return new Response(JSON.stringify({ wishlist: wl }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Error adding to wishlist" }), { status: 500 });
  }
}

export async function DELETE(req) {
  // remove product from wishlist: expects JSON body { productId } or query param
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    const td = verifyToken(token);
    const body = await req.json().catch(() => ({}));
    const productId = body.productId;
    console.log(productId)
    if (!productId) return new Response(JSON.stringify({ message: "productId required" }), { status: 400 });

    const wl = await Wishlist.findOneAndUpdate({ user: td.id },  { $pull: { items: { product: productId } } }, { new: true }).populate("items.product");
    return new Response(JSON.stringify({ wishlist: wl }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Error removing from wishlist" }), { status: 500 });
  }
}
