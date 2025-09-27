import { dbConnect } from "../../../../lib/dbConnect";
import userModel from "../../../../models/userModel";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../../utils/jwt";

export async function POST(req) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    const user = await userModel.findOne({ email });
    if (!user) 
      return new Response(JSON.stringify({ message: "No User Exist for this Credentials" }), { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) 
      return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });

    const token = generateToken(user);

    return new Response(JSON.stringify({ message:"Login Successful!!!",token }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
