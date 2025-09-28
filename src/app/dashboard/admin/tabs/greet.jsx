import React from 'react'
import { useAuth } from '../../../../../context/AuthProvider'

function Greet() {
  const {user}=useAuth();
  return (
    <div>
      <main className="p-6 flex-1">
              <h2 className="text-2xl font-bold mb-4">Welcome,{user.name} - Admin!</h2>
              {/* Example dashboard cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="p-6 bg-white rounded shadow">
                  <h3 className="text-lg font-semibold">Total Users</h3>
                  <p className="text-2xl font-bold mt-2">125</p>
                </div>
                <div className="p-6 bg-white rounded shadow">
                  <h3 className="text-lg font-semibold">Pending Requests</h3>
                  <p className="text-2xl font-bold mt-2">8</p>
                </div>
                <div className="p-6 bg-white rounded shadow">
                  <h3 className="text-lg font-semibold">Products</h3>
                  <p className="text-2xl font-bold mt-2">342</p>
                </div>
                <div className="p-6 bg-white rounded shadow">
                  <h3 className="text-lg font-semibold">Orders Today</h3>
                  <p className="text-2xl font-bold mt-2">56</p>
                </div>
              </div>
            </main>
    </div>
  )
}

export default Greet
