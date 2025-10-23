"use client";
import { useEffect, useState } from "react";

export default function Users() {
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.filter(u => u.role === "customer"));
        setSellers(data.filter(u => u.role === "seller"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchUsers(); // refresh list
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  if (loading) return <p className="p-6">Loading users...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>

      {/* Customers */}
      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Customers</h3>
        {customers.length === 0 ? (
          <p className="text-gray-600">No customers found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {customers.map((user) => (
              <div key={user._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sellers */}
      <section>
        <h3 className="text-xl font-semibold mb-4">Sellers</h3>
        {sellers.length === 0 ? (
          <p className="text-gray-600">No sellers found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sellers.map((user) => (
              <div key={user._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
