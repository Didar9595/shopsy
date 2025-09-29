import React from "react";
import { useAuth } from "../../../../../context/AuthProvider";

function Greet() {
    const {user}=useAuth()
  return (
    <div>
      <main className="p-6 flex-1">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h2>
        <p className="text-gray-700">
          Here is a quick overview of your shop and activity.
        </p>

        {/* Example dashboard cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Total Products</h3>
            <p className="text-2xl font-bold mt-2">34</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold mt-2">56</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Shop Sales</h3>
            <p className="text-2xl font-bold mt-2">$4,230</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-semibold">Pending Requests</h3>
            <p className="text-2xl font-bold mt-2">8</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Greet;
