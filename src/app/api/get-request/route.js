import { dbConnect } from "../../../../lib/dbConnect";
import SellerRequest from "../../../../models/sellerReqModel";

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "userId is required" }),
        { status: 400 }
      );
    }

    const request = await SellerRequest.collection.findOne({ userId })

    return new Response(
      JSON.stringify({ request: request}),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Error fetching request" }),
      { status: 500 }
    );
  }
}


export async function DELETE(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const reqId=body.reqId;
    if (!reqId) {
      return new Response(
        JSON.stringify({ message: "Request Id is required" }),
        { status: 400 }
      );
    }
    const request = await SellerRequest.findByIdAndDelete(reqId )
    return new Response(JSON.stringify({ message:"Deleted Successfully!!!",request}),{ status: 200 });
    
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error Deleting request" }),{ status: 500 });
  }
  
}