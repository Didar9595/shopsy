import { dbConnect } from "../../../../../lib/dbConnect";
import Product from "../../../../../models/productModel";

export async function GET() {
  await dbConnect();

  try {
    // Latest products
    const latest = await Product.find().populate("shop", "shopName shopLogo") .sort({ createdAt: -1 }).limit(10).lean();

    // Best deals = highest discount percentage
    const allProducts = await Product.find() .populate("shop", "shopName shopLogo") .lean();
    const bestDeals = allProducts
      .map(p => ({
        ...p,
        discount: Math.max(...p.variants.map(v => ((v.mrp - v.price) / v.mrp) * 100 || 0)),
      }))
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 10);

    // Category-wise sections (limit to some popular ones)
    const categories = ["Electronics", "Clothes","Sports","Beauty","Books","Home & Kitchen"];
    const categoryWise = {};
    for (const cat of categories) {
      categoryWise[cat] = await Product.find({ category: cat }).populate("shop", "shopName shopLogo") .limit(8).lean();
    }

    return new Response(
      JSON.stringify({ latest, bestDeals, categoryWise }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Home API Error:", err);
    return new Response(JSON.stringify({ message: "Error fetching home products" }), { status: 500 });
  }
}
