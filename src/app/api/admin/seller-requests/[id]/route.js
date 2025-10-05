// app/api/admin/seller-requests/[id]/route.js
import { dbConnect } from "../../../../../../lib/dbConnect";
import SellerRequest from "../../../../../../models/sellerReqModel";
import NewUser from "../../../../../../models/userModel";
import Shop from "../../../../../../models/shopModel";

export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { status } = await req.json();
    if (!["accepted", "rejected"].includes(status)) {
      return new Response(JSON.stringify({ message: "Invalid status" }), { status: 400 });
    }

    const request = await SellerRequest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!request) {
      return new Response(JSON.stringify({ message: "Request not found" }), { status: 404 });
    }

    if (status === "accepted") {
      const updatedUser = await NewUser.findByIdAndUpdate(request.userId, 
        {role: "seller",isSellerApproved: true,} ,
        { new: true }
      );

       await Shop.create({
        owner: updatedUser._id,
        shopName: request.shopName,
        shopDescription: request.shopDescription,
        shopLogo: request.shopLogo,
        shopCertificate: request.shopCertificate,
        isActive: true,
      });
    }

    

    return new Response(JSON.stringify({ message: `Request ${status}`, request }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating status" }), { status: 500 });
  }
}
