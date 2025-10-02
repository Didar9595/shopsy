import { dbConnect } from "../../../../lib/dbConnect";
import SellerRequest from "../../../../models/sellerReqModel";

export async function POST(req) {
  await dbConnect();
  try {

    const body = await req.json();
    const { userId, shopName, shopDescription, shopLogo, shopCertificate } = body;

    const existingRequest = await SellerRequest.collection.findOne({ userId });
    if (existingRequest) {
      return new Response(
        JSON.stringify({ message: "Request already submitted and you cannot submit two requests!!!"}),
        { status: 400 }
      );
    }

     await SellerRequest.collection.insertOne({
      userId,
      shopName,
      shopDescription,
      shopLogo,
      shopCertificate,
      status: "pending",
    });

    return new Response(
      JSON.stringify({ message: "Seller request submitted successfully" }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Error submitting request" }),
      { status: 500 }
    );
  }
}


export async function GET(req){
    await dbConnect()
    try {
        const { searchParams } = new URL(req.url, "https://shopsy-opal-chi.vercel.app");
    const userId = searchParams.get("userId");

if (!userId) {
  return new Response(JSON.stringify({ message: "userId required" }), { status: 400 });
}
const existingRequest = await SellerRequest.collection.findOne({userId});

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          message: "Request already submitted",
          status: existingRequest.status,
          existingRequest,
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({message:"Cannot find request!!!!"}),{status:404})
        
    } catch (error) {
        return new Response(JSON.stringify({message:"Error getting Shop request!!!"}),{status:500})
    }
}