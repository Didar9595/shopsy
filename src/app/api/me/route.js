import { dbConnect } from "../../../../lib/dbConnect";
import userModel from "../../../../models/userModel";
import { verifyToken } from "../../../../utils/jwt";

export async function GET(req) {
  await dbConnect();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  const token = authHeader.split(" ")[1];
  if (!token) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  try {
    const decoded = verifyToken(token);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Token invalid or expired" }), { status: 401 });
  }
}
