import { dbConnect } from "../../../../lib/dbConnect";
import userModel from "../../../../models/userModel";
import { verifyToken } from "../../../../utils/jwt";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
  await dbConnect();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await userModel.findById(decoded.id);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    const body = await req.json();
    const { name, password } = body;

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return new Response(JSON.stringify({ message: "Profile updated successfully" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
