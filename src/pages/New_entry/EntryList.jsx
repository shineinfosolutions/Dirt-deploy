import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTrashAlt, FaEdit, FaWhatsapp } from "react-icons/fa";
import { RiNewspaperLine } from "react-icons/ri";
import QrSection from "../QrSection";
import LoadingOverlay from "../../components/LoadingOverlay";

const EntryList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [billData, setBillData] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({});

  const limit = 10;

  const fetchCustomerDetails = async (customerId) => {
    if (customerDetails[customerId]) return customerDetails[customerId];

    try {
      const res = await axios.get(
        `http://localhost:5000/custdirt/${customerId}`
      );
      const customer = res.data.data;
      const fullName = `${customer.firstName} ${customer.lastName}`;
      setCustomerDetails((prev) => ({
        ...prev,
        [customerId]: fullName,
      }));
      return fullName;
    } catch (err) {
      return null;
    }
  };

  const fetchEntries = async (pageNumber = 1) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const res = await axios.get(
        `http://localhost:5000/entry/pagination?page=${pageNumber}&limit=${limit}`
      );
      setEntries(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch entries");
      setLoading(false);
    }
  };

  const searchEntries = async () => {
    if (!searchQuery.trim()) {
      fetchEntries(1);
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://dirt-off-backend-main.vercel.app/entry/search?q=${searchQuery}`
      );
      const sortedEntries = (res.data.data || []).sort((a, b) =>
        a.customer.localeCompare(b.customer)
      );
      setEntries(sortedEntries);
      setTotalPages(1);
      setLoading(false);
    } catch (err) {
      toast.error("No results found");
      setEntries([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    entries.forEach((entry) => {
      if (entry.customerId && !customerDetails[entry.customerId]) {
        fetchCustomerDetails(entry.customerId);
      }
    });
  }, [entries]);

  useEffect(() => {
    fetchEntries(page);
  }, [page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchEntries();
      } else {
        setIsSearching(false);
        fetchEntries(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirm) return;

    try {
      await axios.delete(
        `https://dirt-off-backend-main.vercel.app/entry/delete/${id}`
      );
      toast.success("Entry deleted successfully");
      if (isSearching) {
        searchEntries(); // refresh search result
      } else {
        fetchEntries(page); // refresh current page
      }
    } catch (err) {
      toast.error("Failed to delete entry");
    }
  };

  const toggleVisibility = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to toggle visibility for this entry?"
    );
    if (!confirm) return;

    try {
      await axios.put(
        `https://dirt-off-backend-main.vercel.app/entry/toggleVisibility/${id}`
      );
      toast.success("Deleted successfully");
      if (isSearching) {
        searchEntries();
      } else {
        fetchEntries(page);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `https://dirt-off-backend-main.vercel.app/entry/update/${id}`,
        { status: newStatus }
      );
      toast.success("Status updated successfully");
      if (isSearching) {
        searchEntries();
      } else {
        fetchEntries(page);
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleWhatsAppShare = (entry) => {
    if (!entry.customerPhone) {
      toast.error("Customer phone number not available");
      return;
    }

    const expectedDelivery = entry.pickupAndDelivery?.expectedDeliveryDate
      ? new Date(
          entry.pickupAndDelivery.expectedDeliveryDate
        ).toLocaleDateString()
      : "TBD";

    const message = `Hi ${entry.customer},

Your laundry order details:
Receipt No: ${entry.receiptNo || "N/A"}
Products: ${entry.products.map((p) => p.productName).join(", ")}
Total Amount: ₹${entry.charges?.totalAmount?.toFixed(2)}
Status: ${entry.status || "pending"}
Expected Delivery: ${expectedDelivery}

Thank you for choosing our service!`;

    const phoneNumber = String(entry.customerPhone).replace(/[^\d]/g, "");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 py-2 border w-[100px]">
        <div className="h-4 bg-gray-200 rounded "></div>
      </td>
      <td className="px-4 py-2 border  w-[115px]">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-2 border w-[192px]">
        <div className="h-4 bg-gray-200 rounded "></div>
      </td>
      <td className="px-4 py-2 border w-[144px]">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 py-2 border w-[155px]">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 py-2 border w-[155px]">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 py-2 border w-[93px]">
        <div className="h-6 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 py-2 border w-[155px]">
        <div className="flex justify-around">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </td>
    </tr>
  );

  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-[100%] mx-auto px-4 py-4 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#a997cb]">New Entries</h2>
        <Link
          to="/entryform"
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5] transition"
        >
          + Add Entry
        </Link>
      </div>

      {/* Search box */}
      <div className="flex items-center mb-6 space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by customer or receipt no..."
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
        {/* <button
          onClick={searchEntries}
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5]"
        >
          Search
        </button> */}
        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery("");
              fetchEntries(1); // Reset to page 1 and refetch normal entries
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      <>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[#e7e3f5] shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-[#e7e3f5] text-[#a997cb]">
              <tr>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Rcpt No.
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Customer
                </th>
                {/* <th className="text-left px-4  whitespace-nowrappy-2">Service</th> */}
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Products
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Total Amount
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Pickup
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Delivery
                </th>
                <th className="text-left px-4 py-2 whitespace-nowrap">
                  Status
                </th>

                <th className="text-center px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      <p> {entry.receiptNo || "N/A"}</p>
                    </td>
                    <td className="px-4 py-2 border">
                      {entry.customerId
                        ? customerDetails[entry.customerId] || entry.customer
                        : entry.customer}
                    </td>

                    <td className="px-4 py-2 border">
                      {entry.products.map((p) => p.productName).join(", ")}
                    </td>
                    <td className="px-4 py-2 border">
                      ₹ {entry.charges?.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">
                      {entry.pickupAndDelivery?.pickupType === "Self"
                        ? "Self"
                        : entry.pickupAndDelivery?.pickupAddress ||
                          entry.pickupAndDelivery?.pickupType}
                    </td>
                    <td className="px-4 py-2 border">
                      {entry.pickupAndDelivery?.deliveryType === "Self"
                        ? "Self"
                        : entry.pickupAndDelivery?.deliveryAddress ||
                          entry.pickupAndDelivery?.deliveryType}
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        value={entry.status || "pending"}
                        onChange={(e) =>
                          handleStatusChange(entry._id, e.target.value)
                        }
                        className="border px-2 py-1 rounded text-xs w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="delivered">Delivered</option>
                        <option value="collected">Collected</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <div className="flex justify-around items-center">
                        <Link
                          to={`/entryform/${entry._id}`}
                          className="text-sm text-[#a997cb] hover:text-[#8a82b5] inline-flex hover:underline mr-4"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => toggleVisibility(entry._id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          <FaTrashAlt />
                        </button>
                        <Link
                          to={`/LaundryBill/${entry._id}`}
                          className="text-sm pl-3 text-[#a997cb] hover:text-[#8a82b5] hover:underline mr-4"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleWhatsAppShare(entry)}
                          className="text-sm text-green-600 hover:text-green-800 mr-4"
                          title="Share on WhatsApp"
                        >
                          <FaWhatsapp />
                        </button>
                        <Link
                          to={`/qr-tags/${entry._id}`}
                          className="text-sm text-[#7f59c5] hover:text-[#8a82b5] inline-flex hover:underline mr-4"
                        >
                          <RiNewspaperLine />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <SkeletonRow />

        {/* Pagination only when not searching and not loading */}
        {/* {!isSearching && !loading && entries.length > 0 && ( */}
        <div className="flex justify-center items-center mt-6 space-x-2">
          <LoadingOverlay isLoading={loading} message="Loading entries..." />
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-[#e7e3f5] text-[#a997cb] rounded disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-[#a997cb] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 bg-[#e7e3f5] text-[#a997cb] rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
        {/* )} */}
      </>
    </div>
  );
};

export default EntryList;
