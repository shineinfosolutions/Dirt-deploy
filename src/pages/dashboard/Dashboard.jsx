// src/pages/Dashboard.jsx
import React from "react";

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#a997cb] mb-6">
        Laundry Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New Orders</p>
              <h2 className="text-3xl font-bold">12</h2>
              <p className="text-sm text-gray-600 mt-2">
                Today's new laundry orders
              </p>
            </div>
          </div>
        </div>

        {/* Delivered Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delivered Orders</p>
              <h2 className="text-3xl font-bold">45</h2>
              <p className="text-sm text-gray-600 mt-2">
                Successfully delivered items
              </p>
            </div>
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Orders</p>
              <h2 className="text-3xl font-bold">8</h2>
              <p className="text-sm text-gray-600 mt-2">
                Orders awaiting processing
              </p>
            </div>
          </div>
        </div>

        {/* Sales Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-500 text-sm">Total Sales</p>
              <h2 className="text-3xl font-bold">₹24,500</h2>
              <p className="text-sm text-gray-600 mt-2">Monthly revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
