import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    ServiceCharge: [{ service: '', charge: '' }],
  });

  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('https://dirt-off-deploy.onrender.com/service');
        setAllServices(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch services');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`https://dirt-off-deploy.onrender.com/product/${id}`);
          setFormData(res.data.data);
        } catch (err) {
          toast.error('Failed to load product data');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleServiceChargeChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...formData.ServiceCharge];
    updated[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      ServiceCharge: updated,
    }));
  };

  const addServiceCharge = () => {
    setFormData((prev) => ({
      ...prev,
      ServiceCharge: [...prev.ServiceCharge, { service: '', charge: '' }],
    }));
  };

  const removeServiceCharge = (index) => {
    const updated = [...formData.ServiceCharge];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      ServiceCharge: updated,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = id
      ? `https://dirt-off-deploy.onrender.com/product/update/${id}`
      : 'https://dirt-off-deploy.onrender.com/product/create';
    const method = id ? 'put' : 'post';

    try {
      await axios[method](url, formData);
      toast.success(id ? 'Product updated successfully!' : 'Product added successfully!');
      navigate('/productlist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
         <div className="flex justify-end mb-4">
  <button
    onClick={() => navigate('/productlist')}
 className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
  >
    ← Back
  </button>
</div>
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white shadow p-6 rounded-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-[#a997cb] mb-4">
        {id ? 'Edit Product' : 'Add Product'}
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-[#a997cb]">Product Name</label>
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-4">
        {formData.ServiceCharge.map((item, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-[#a997cb]">Service</label>
              <input
                list={`services-list-${index}`}
                name="service"
                value={item.service}
                onChange={(e) => handleServiceChargeChange(index, e)}
                required
                placeholder="Select or type a service"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <datalist id={`services-list-${index}`}>
                {allServices.map((service) => (
                  <option key={service._id} value={service.serviceName} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#a997cb]">Charge</label>
              <input
                name="charge"
                type="number"
                value={item.charge}
                onChange={(e) => handleServiceChargeChange(index, e)}
                required
                placeholder="Amount"
                className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {formData.ServiceCharge.length > 1 && (
              <button
                type="button"
                onClick={() => removeServiceCharge(index)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addServiceCharge}
          className="text-[#a997cb] text-sm hover:underline"
        >
          + Add Another Service
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
      >
        {loading ? 'Saving...' : id ? 'Update Product' : 'Add Product'}
      </button>
    </form>
    </div>
  );
};

export default ProductForm;
