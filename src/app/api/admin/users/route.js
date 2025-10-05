import { dbConnect } from "../../../../../lib/dbConnect";
import User from "../../../../../models/userModel";

export async function GET() {
  await dbConnect();
  try {
    const users = await User.find().select("-password"); // no password in response
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching users" }), { status: 500 });
  }
}
