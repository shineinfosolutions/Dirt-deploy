import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTrashAlt, FaEdit } from 'react-icons/fa';

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const limit = 10;

  const fetchServices = async (pageNumber = 1) => {
    setLoading(true);
    setIsSearching(false);
    try {
      const res = await axios.get(`http://https://dirt-off-deploy.onrender.com/service/pagination?page=${pageNumber}&limit=${limit}`);
      setServices(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const searchServices = async () => {
    if (!searchQuery.trim()) {
      fetchServices(1); // reset to normal list if search is empty
      return;
    }

    setLoading(true);
    setIsSearching(true);
    try {
      const res = await axios.get(`http://https://dirt-off-deploy.onrender.com/service/search?q=${searchQuery}`);
      setServices(res.data.data || []);
      setTotalPages(1); // disable pagination for search
    } catch (err) {
      setServices([]);
      toast.error('No results found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearching) {
      fetchServices(page);
    }
  }, [page, isSearching]);

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this service?');
    if (!confirm) return;

    try {
      await axios.delete(`http://https://dirt-off-deploy.onrender.com/service/delete/${id}`);
      toast.success('Service deleted successfully');
      if (isSearching) {
        searchServices(); // refresh search results
      } else {
        fetchServices(page); // refresh current page
      }
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#a997cb]">Service Directory</h2>
        <Link
          to="/serviceform"
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5] transition"
        >
          + Add Service
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center mb-6 space-x-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search services..."
          className="border border-gray-300 px-4 py-2 rounded w-full"
        />
        <button
          onClick={searchServices}
          className="bg-[#a997cb] text-white px-4 py-2 rounded hover:bg-[#8a82b5]"
        >
          Search
        </button>
        {isSearching && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearching(false);
              setPage(1);
              fetchServices(1);
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-600 text-center mt-10">Loading services...</p>
      ) : services.length === 0 ? (
        <p className={`text-center mt-10 ${isSearching ? 'text-red-600' : 'text-gray-500'}`}>
          {isSearching
            ? `No services found matching "${searchQuery}".`
            : 'No services found.'}
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <thead style={{ backgroundColor: '#f3effa', color: '#6a5e85' }}>
                <tr>
                  <th className="text-left px-4 py-2 border">Service Name</th>
                  <th className="text-left px-4 py-2 border">Description</th>
                  <th className="text-left px-4 py-2 border">Tax Percentage</th>
                  <th className="text-center px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {services.map((cust) => (
                  <tr key={cust._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{cust.serviceName}</td>
                    <td className="px-4 py-2 border">{cust.description}</td>
                    <td className="px-4 py-2 border">{cust.taxPercent} %</td>
                    <td className="px-4 py-2 border text-center">
                      <Link
                        to={`/serviceform/${cust._id}`}
                        className="text-sm text-[#a997cb] inline-flex hover:underline mr-4"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(cust._id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isSearching && (
            <div className="flex justify-center items-center mt-6 space-x-2">
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
                      ? 'bg-[#a997cb] text-white'
                      : 'bg-gray-100 text-gray-600'
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
          )}
        </>
      )}
    </div>
  );
};

export default ServiceList;
