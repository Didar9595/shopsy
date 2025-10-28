// app/api/products/bulk/route.js
import { dbConnect } from "../../../../../lib/dbConnect";
import Product from "../../../../../models/productModel";
import User from "../../../../../models/userModel";
import Shop from "../../../../../models/shopModel";
import { verifyToken } from "../../../../../utils/jwt";

/**
 * POST /api/products/bulk
 * Body: { products: [ { title, description, category, subcategory, tags, images, variants } ] }
 * Requires Authorization: Bearer <token> (seller)
 */
export async function POST(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

    const body = await req.json();
    const products = body.products;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ message: "No products provided" }), { status: 400 });
    }

    // Fetch user to get shop id (if any)
    
    const sellerId = decoded.id;
    const shop = await Shop.findOne({owner:sellerId}).lean();
    console.log(shop)
    const shopId = shop?._id 

   
    // Attach seller and shop to each product; do basic sanitization
    const docs = products.map((p) => ({
      title: p.title,
      description: p.description || "",
      category: p.category || "",
      subcategory: p.subcategory || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
      images: Array.isArray(p.images) ? p.images : [],
      variants: Array.isArray(p.variants)
        ? p.variants.map((v) => ({
            sku: v.sku || "",
            price: Number(v.price || 0),
            mrp: Number(v.mrp || 0),
            stock: Number(v.stock || 0),
            attributes: v.attributes || {},
            images: Array.isArray(v.images) ? v.images : [],
          }))
        : [],
      seller: sellerId,
      shop: shopId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    console.log(shopId)
    // Insert many
    const inserted = await Product.insertMany(docs);
    

    return new Response(JSON.stringify({ success: true, insertedCount: inserted.length, products: inserted }), { status: 201 });
  } catch (err) {
    console.error("Bulk products error:", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 });
  }
}
