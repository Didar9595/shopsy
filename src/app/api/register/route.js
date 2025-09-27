import { dbConnect } from "../../../../lib/dbConnect";
import userModel from "../../../../models/userModel";
import bcrypt from "bcryptjs";
import { generateToken } from "../../../../utils/jwt";

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) 
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({ name, email, password: hashedPassword });

    const token = generateToken(user);

    return new Response(JSON.stringify({ message:"User Registered Successfully!!!" ,token}), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
}
