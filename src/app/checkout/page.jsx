"use client";
import { Suspense } from "react";
import CheckoutContent from "../components/CheckoutContent";

export default function CheckoutPage() {

  return (
    <Suspense fallback={<div className="p-6 text-center">Loading Checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
