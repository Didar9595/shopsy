import { dbConnect } from "../../../../../lib/dbConnect";
import Product from "../../../../../models/productModel";

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sortBy") || "relevance";

  let filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ];
  }

  if (category) filter.category = category;
  if (subcategory) filter.subcategory = subcategory;

  if (minPrice || maxPrice) {
    filter.variants = { $elemMatch: {} };
    if (minPrice) filter.variants.$elemMatch.price = { ...filter.variants.$elemMatch.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.variants.$elemMatch.price = { ...filter.variants.$elemMatch.price, $lte: parseFloat(maxPrice) };
  }

  let sortOption = {};
  switch (sortBy) {
    case "priceLowHigh":
      sortOption["variants.0.price"] = 1; // sort by first variant's price
      break;
    case "priceHighLow":
      sortOption["variants.0.price"] = -1;
      break;
    case "newest":
      sortOption.createdAt = -1;
      break;
    default:
      break; // relevance
  }

  try {
    const products = await Product.find(filter).populate("shop","shopName shopLogo").sort(sortOption);
    return new Response(JSON.stringify({ success: true, products }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
  }
}
