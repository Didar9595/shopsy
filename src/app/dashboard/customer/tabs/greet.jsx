import React from "react";
import { useAuth } from "../../../../../context/AuthProvider";

function Greet() {
    const {user}=useAuth();
  return (
    <div>
      <main className="p-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}</h2>
        <p className="text-gray-700">
          Here is a quick overview of your account and activity.
        </p>

        {/* Example dashboard cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold mt-2">12</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Items in Cart</h3>
            <p className="text-2xl font-bold mt-2">5</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Wishlist Items</h3>
            <p className="text-2xl font-bold mt-2">8</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Profile Completion</h3>
            <p className="text-2xl font-bold mt-2">80%</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Greet;
