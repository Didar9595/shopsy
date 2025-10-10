import { dbConnect } from "../../../../../lib/dbConnect";
import Product from "../../../../../models/productModel";
import { verifyToken } from "../../../../../utils/jwt";
import Shop from "../../../../../models/shopModel";
import User from "../../../../../models/userModel";

export async function PUT(req, { params }) {
  await dbConnect();
  try {
     const token = req.headers.get("authorization")?.split(" ")[1];
    const tokenData = verifyToken(token);
    const { id } = params;
    const updates = await req.json();

    const product = await Product.findOneAndUpdate(
      { _id: id, seller: tokenData.id },
      updates,
      { new: true }
    );

    if (!product)
      return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, product }), { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
         const token = req.headers.get("authorization")?.split(" ")[1];

    const tokenData = verifyToken(token);
    const { id } = params;

    const product = await Product.findOneAndDelete({ _id: id, seller: tokenData.id });
    if (!product)
      return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

    return new Response(JSON.stringify({ success: true, message: "Product deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}


export async function GET(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;

    const product = await Product.findById(id)
      .populate("seller", "name email")
      .populate("shop", "shopName");

    if (!product) {
      return new Response(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, product }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}