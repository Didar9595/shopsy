// app/api/admin/seller-requests/route.js
import { dbConnect } from "../../../../../lib/dbConnect";
import SellerRequest from "../../../../../models/sellerReqModel";

export async function GET() {
  await dbConnect();
  try {
    const requests = await SellerRequest.find({ status: "pending" })
      .populate("userId", "name email"); // include name, email & id

    return new Response(JSON.stringify(requests), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error fetching requests" }), { status: 500 });
  }
}
