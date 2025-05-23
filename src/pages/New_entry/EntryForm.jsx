import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EntryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer: '',
      customerId: '',
    service: '',
    products: [{ productName: '', quantity: 1, unitPrice: 0, amount: 0 }],
    charges: { subtotal: 0, taxAmount: 0, totalAmount: 0 },
    taxPercent: 0,
    pickupAndDelivery: { pickupType: 'Self', deliveryType: 'Self' },
  });

  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
useEffect(() => {
  // Fetch services, customers, products once on mount
  const fetchServices = async () => {
    try {
      const res = await axios.get('https://dirt-off-deploy.onrender.com/service');
      if (Array.isArray(res.data.data)) setServices(res.data.data);
    } catch {
      toast.error('Failed to fetch services');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('https://dirt-off-deploy.onrender.com/custdirt');
      if (Array.isArray(res.data.data)) setCustomers(res.data.data);
    } catch {
      toast.error('Failed to fetch customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://dirt-off-deploy.onrender.com/product');
      if (Array.isArray(res.data.data)) setProducts(res.data.data);
    } catch {
      toast.error('Failed to fetch products');
    }
  };

  fetchServices();
  fetchCustomers();
  fetchProducts();
}, []); // empty dependency means only runs once

// Fetch entry data only once services have loaded and id is present
useEffect(() => {
  if (!id || services.length === 0) return;

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://dirt-off-deploy.onrender.com/entry/${id}`);
      const entryData = res.data.data;

      // Find taxPercent for the service in entryData
      const matchedService = services.find(
        (s) => s.serviceName === entryData.service
      );
      const taxPercent = matchedService?.taxPercent || 0;

      // Calculate charges with taxPercent from service
      const subtotal = entryData.products.reduce(
        (acc, p) => acc + p.amount,
        0
      );
      const taxAmount = parseFloat(((subtotal * taxPercent) / 100).toFixed(2));
      const totalAmount = subtotal + taxAmount;

      setFormData({
        ...entryData,
        taxPercent,
        charges: { subtotal, taxAmount, totalAmount },
      });
    } catch {
      toast.error('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  fetchEntry();
}, [id, services]);


  const recalculateCharges = (products, taxPercent) => {
    const subtotal = products.reduce((acc, p) => acc + p.amount, 0);
    const taxAmount = parseFloat(((subtotal * taxPercent) / 100).toFixed(2));
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    let selectedProduct = { ...newProducts[index] };

    if (field === 'productName') {
      const productData = products.find((p) => p.name === value);
      const defaultCharge = productData?.ServiceCharge?.[0]?.charge || 0;

      selectedProduct = {
        ...selectedProduct,
        productName: value,
        unitPrice: defaultCharge,
        amount: selectedProduct.quantity * defaultCharge,
      };
    } else if (field === 'unitPrice' || field === 'quantity') {
      selectedProduct = {
        ...selectedProduct,
        [field]: Number(value),
      };
      selectedProduct.amount = selectedProduct.quantity * selectedProduct.unitPrice;
    }

    newProducts[index] = selectedProduct;

    const charges = recalculateCharges(newProducts, formData.taxPercent);

    setFormData((prev) => ({
      ...prev,
      products: newProducts,
      charges,
    }));
  };

  const handleServiceChange = (e) => {
    const selectedService = services.find(
      (s) => s.serviceName === e.target.value
    );
    const taxPercent = selectedService?.taxPercent || 0;
    const charges = recalculateCharges(formData.products, taxPercent);

    setFormData((prev) => ({
      ...prev,
      service: e.target.value,
      taxPercent,
      charges,
    }));
  };

  const handleAddProduct = () => {
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        { productName: '', quantity: 1, unitPrice: 0, amount: 0 },
      ],
    }));
  };

  const handleRemoveProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    const charges = recalculateCharges(newProducts, formData.taxPercent);
    setFormData((prev) => ({ ...prev, products: newProducts, charges }));
  };

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'customer') {
    // Find customer by name
    const selectedCustomer = customers.find(
      (c) => c.firstName === value
    );

    setFormData((prev) => ({
      ...prev,
      customer: value,
      customerId: selectedCustomer?._id || '', // <-- set ObjectId here
    }));
  } else if (name === 'pickupType' || name === 'deliveryType') {
    setFormData((prev) => ({
      ...prev,
      pickupAndDelivery: {
        ...prev.pickupAndDelivery,
        [name]: value,
      },
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const url = id
      ? `https://dirt-off-deploy.onrender.com/entry/update/${id}`
      : 'https://dirt-off-deploy.onrender.com/entry/create';
    const method = id ? 'put' : 'post';

    try {
      await axios[method](url, formData);
      toast.success(id ? 'Entry updated!' : 'Entry added!');
      navigate('/entrylist');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
           <div className="flex justify-end mb-4">
  <button
    onClick={() => navigate('/entrylist')}
 className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
  >
    ← Back
  </button>
</div>
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg space-y-6"
    >
      <h2 className="text-2xl font-semibold text-gray-700">
        {id ? 'Edit Entry' : 'New Entry'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Customer Name *
          </label>
          <select
            name="customer"
            value={formData.customer}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.firstName}>
                {customer.firstName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Service *
          </label>
          <select
            name="service"
            value={formData.service}
            onChange={handleServiceChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Service</option>
            {services.map((service) => (
              <option key={service.id} value={service.serviceName}>
                {service.serviceName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">Products</h3>
        {formData.products.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end mb-3"
          >
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product *</label>
              <select
                value={product.productName}
                onChange={(e) =>
                  handleProductChange(index, 'productName', e.target.value)
                }
                className="w-full border px-2 py-1 rounded"
                required
              >
                <option value="">Select Product</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.name}>
                    {prod.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity *</label>
              <input
                type="number"
                value={product.quantity}
                onChange={(e) =>
                  handleProductChange(index, 'quantity', e.target.value)
                }
                className="w-full border px-2 py-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit Price</label>
              <input
                type="number"
                value={product.unitPrice}
                onChange={(e) =>
                  handleProductChange(index, 'unitPrice', e.target.value)
                }
                className="w-full border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount</label>
              <input
                type="number"
                value={product.amount}
                readOnly
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleRemoveProduct(index)}
                className="text-red-600 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      <button
  type="button"
  onClick={handleAddProduct}
  className="text-theme-purple text-sm font-medium mt-2 hover:text-theme-purple-dark transition"
>
  + Add Product
</button>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Subtotal</label>
          <input
            type="number"
            value={formData.charges.subtotal}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Tax Amount</label>
          <input
            type="number"
            value={formData.charges.taxAmount}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Total Amount</label>
          <input
            type="number"
            value={formData.charges.totalAmount}
            readOnly
            className="w-full border px-3 py-2 rounded bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Pickup Type</label>
          <select
            name="pickupType"
            value={formData.pickupAndDelivery.pickupType}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Self">Self</option>
            <option value="Agent">Agent</option>
            <option value="Courier">Courier</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Delivery Type</label>
          <select
            name="deliveryType"
            value={formData.pickupAndDelivery.deliveryType}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Self">Self</option>
            <option value="Agent">Agent</option>
            <option value="Courier">Courier</option>
          </select>
        </div>
      </div>

    <button
  type="submit"
  disabled={loading}
  className={`px-6 py-2 rounded text-white transition
    ${loading ? 'bg-theme-purple/60 cursor-not-allowed' : 'bg-theme-purple hover:bg-theme-purple-dark cursor-pointer'}
    disabled:opacity-50 disabled:cursor-not-allowed`}
>
  {loading ? 'Saving...' : id ? 'Update Entry' : 'Add Entry'}
</button>

    </form>
    </div>
  );
};

export default EntryForm;
