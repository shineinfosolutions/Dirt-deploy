import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(
          "https://dirt-off-deploy.onrender.com/customer/all"
        );
        setCustomers(res.data.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  const handleInvoiceClick = (customerId) => {
    // Navigate to the Invoice form page, passing the customer ID in the URL
    navigate(`/invoice/${customerId}`);
  };

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Customer List</h2>

      {customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <div className="overflow-auto max-h-[500px] border rounded">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="py-2 px-4 border-b border-r">Name</th>
                <th className="py-2 px-4 border-b border-r">Phone</th>
                <th className="py-2 px-4 border-b border-r">Total (₹)</th>
                <th className="py-2 px-4 border-b border-r">Status</th>
                <th className="py-2 px-4 border-b border-r">Date Collected</th>
                <th className="py-2 px-4 border-b border-r">Delivery Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((cust) => (
                <tr key={cust._id} className="hover:bg-gray-50 text-sm">
                  <td className="py-2 px-4 border-b border-r">{cust.name}</td>
                  <td className="py-2 px-4 border-b border-r">{cust.phone}</td>
                  <td className="py-2 px-4 border-b border-r">
                    ₹{cust.totalAmount}
                  </td>
                  <td className="py-2 px-4 border-b border-r capitalize">
                    {cust.status || "pending"}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {new Date(cust.dateCollected).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b border-r">
                    {cust.dateDelivered
                      ? new Date(cust.dateDelivered).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleInvoiceClick(cust._id)} // Call handleInvoiceClick with customer ID
                    >
                      Invoice
                    </button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
