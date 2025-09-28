"use client";
import RoleRoute from "@/app/components/RoleRoute";

export default function SellerDashboard() {
  return (
    <RoleRoute allowedRoles={["seller"]}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <ul className="list-disc pl-6">
          <li>Manage your shop and products</li>
          <li>View orders from customers</li>
        </ul>
      </div>
    </RoleRoute>
  );
}
