import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    taxPercent: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/service/${id}`);
          setFormData(res.data.data);
        } catch (err) {
          toast.error('Failed to load service data');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = id
      ? `http://localhost:5000/service/update/${id}`
      : 'http://localhost:5000/service/create';

    const method = id ? 'put' : 'post';

    try {
      await axios[method](url, formData);
      toast.success(id ? 'Service updated successfully!' : 'Service added successfully!');
      navigate('/servicelist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      {/* ✅ Back Button - Outside of Form */}
     <div className="flex justify-end mb-4">
  <button
    onClick={() => navigate('/servicelist')}
 className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
  >
    ← Back
  </button>
</div>


      {/* ✅ Form Card */}
      <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold text-[#a997cb] mb-4">
          {id ? 'Edit Service' : 'Add Service'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Service Name *</label>
            <input
              name="serviceName"
              type="text"
              value={formData.serviceName}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Description</label>
            <input
              name="description"
              type="text"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Tax Percentage</label>
            <input
              name="taxPercent"
              type="text"
              value={formData.taxPercent}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : id ? 'Update Service' : 'Add Service'}
        </button>
      </form>
    </div>
  );
};

export default ServiceForm;
