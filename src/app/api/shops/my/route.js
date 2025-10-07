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


import User from "../../../../../models/userModel";
//import productModel from "../../../../../models/productModel"; // if you have product model
import SellerRequest from "../../../../../models/sellerReqModel";

export async function DELETE(req) {
  await dbConnect();

  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const tokenData = verifyToken(token);
    const userId = tokenData.id;

    // find shop by owner, not by _id
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return new Response(
        JSON.stringify({ message: "Shop not found" }),
        { status: 404 }
      );
    }

    // Optionally: delete all products under that shop
    // await Product.deleteMany({ shopId: shop._id });

    // Delete the shop itself
    await Shop.findByIdAndDelete(shop._id);

    console.log(userId)
    // Delete seller request by userId (not findById)
    await SellerRequest.collection.findOneAndDelete({ userId:userId });

    // Update user back to customer
    await User.findByIdAndUpdate(userId, {
      role: "customer",
      isSellerApproved: false,
    });

    return new Response(
      JSON.stringify({ message: "Shop and related data deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting shop:", error);
    return new Response(
      JSON.stringify({ message: "Error deleting shop" }),
      { status: 500 }
    );
  }
}
