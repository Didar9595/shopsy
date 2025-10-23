import { dbConnect } from "../../../../lib/dbConnect";
import Cart from "../../../../models/cartModel";
import Product from "../../../../models/productModel";
import { verifyToken } from "../../../../utils/jwt";

// 🔹 Get Cart
export async function GET(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = verifyToken(token);

    const cart = await Cart.findOne({ user: user.id }).populate("items.product");
    const count = cart ? cart.items.reduce((sum, it) => sum + it.quantity, 0) : 0;

    return new Response(
      JSON.stringify({ cart: cart || { items: [] }, count }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error fetching cart" }), { status: 500 });
  }
}

// 🔹 Add to Cart
export async function POST(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = verifyToken(token);

    const {
      productId,
      quantity = 1,
      variantSku,
      variantAttributes = {},
      variantImages = [],
      priceAtAdd,
    } = await req.json();

    const product = await Product.findById(productId);
    if (!product)
      return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

    let cart = await Cart.findOne({ user: user.id });
    if (!cart) {
      cart = new Cart({ user: user.id, items: [] });
    }

    const existing = cart.items.find(
      (it) =>
        it.product.toString() === productId &&
        it.variantSku === variantSku
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        variantSku,
        variantAttributes,
        variantImages,
        priceAtAdd: priceAtAdd || product.price,
      });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");

    return new Response(JSON.stringify({ success: true, cart: populatedCart }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error adding to cart" }), { status: 500 });
  }
}

// 🔹 Update Quantity
export async function PATCH(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = verifyToken(token);
    const { productId, variantSku, quantity } = await req.json();

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return new Response(JSON.stringify({ message: "Cart not found" }), { status: 404 });

    const item = cart.items.find(
      (it) =>
        it.product.toString() === productId &&
        it.variantSku === variantSku
    );
    if (!item) return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });

    item.quantity = quantity;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (it) =>
          !(it.product.toString() === productId && it.variantSku === variantSku)
      );
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product");

    return new Response(JSON.stringify({ success: true, cart: populatedCart }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error updating cart" }), { status: 500 });
  }
}

// 🔹 Remove Item
export async function DELETE(req) {
  await dbConnect();
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    const user = verifyToken(token);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const variantSku = searchParams.get("variantSku");

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return new Response(JSON.stringify({ message: "Cart not found" }), { status: 404 });

    cart.items = cart.items.filter(
      (it) =>
        !(it.product.toString() === productId && it.variantSku === variantSku)
    );

    await cart.save();
    const populatedCart = await cart.populate("items.product");

    return new Response(JSON.stringify({ success: true, cart: populatedCart }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error removing from cart" }), { status: 500 });
  }
}
