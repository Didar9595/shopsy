import { dbConnect } from "../../../../../../lib/dbConnect";
import User from "../../../../../../models/userModel";
import Shop from "../../../../../../models/shopModel";

export async function DELETE(req, { params }) {
  await dbConnect();
  try {
    const user = await User.findById(params.id);

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    // If seller → delete their shop
    if (user.role === "seller") {
      await Shop.findOneAndDelete({ owner: user._id });
    }

    // Delete user
    await User.findByIdAndDelete(params.id);

    return new Response(
      JSON.stringify({ message: "User (and shop if seller) deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response(
      JSON.stringify({ message: "Error deleting user" }),
      { status: 500 }
    );
  }
}
