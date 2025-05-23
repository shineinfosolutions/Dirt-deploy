import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LaundryInvoiceForm = ({ customerId }) => {
  const [customers, setCustomers] = useState([]); // Store customers list
  const [customer, setCustomer] = useState(customerId || ''); // Set initial customer value
  const [items, setItems] = useState([
    { description: 'Shirt (Dry Clean)', quantity: 4, price: 50 },
    { description: 'Bedsheet (Wash)', quantity: 2, price: 80 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5);
  const [gstNumber, setGstNumber] = useState('27ABCDE1234F1Z5');
  const [gstType, setGstType] = useState('CGST_SGST');
  const [notes, setNotes] = useState('Please handle bedsheets gently.');
  const [dateCollected, setDateCollected] = useState('2025-05-14');
  const [dateDelivered, setDateDelivered] = useState('2025-05-16');
  const [status, setStatus] = useState('pending');

  const [subTotal, setSubTotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountInWords, setAmountInWords] = useState('');

  useEffect(() => {
    // Fetch customer list from API
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/invoice/all');
        setCustomers(response.data); // Assuming response.data contains an array of customers
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const newSubTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const newTax = ((newSubTotal - discount) * taxRate) / 100;
    const newTotal = newSubTotal - discount + newTax;

    setSubTotal(newSubTotal);
    setTaxAmount(newTax);
    setTotalAmount(newTotal);
    setAmountInWords(`₹${newTotal.toFixed(2)} only`);
  }, [items, discount, taxRate]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      customer,
      items,
      subTotal,
      discount,
      taxRate,
      taxAmount,
      totalAmount,
      amountInWords,
      gstNumber,
      gstType,
      dateCollected,
      dateDelivered,
      notes,
      status,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post('http://localhost:5000/invoice/create', payload);
      alert('Invoice created successfully!');
      console.log('Invoice created:', response.data);
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-semibold mb-6">Create Laundry Invoice</h1>

      {/* Customer Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Customer</label>
        <select
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Customer</option>
          {customers.map((cust) => (
            <option key={cust.id} value={cust.id}>
              {cust.name}
            </option>
          ))}
        </select>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <h2 className="font-medium mb-2">Items</h2>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <input
              type="text"
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        ))}
      </div>

      {/* Financial Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Discount</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tax Rate (%)</label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">GST Number</label>
          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">GST Type</label>
          <select
            value={gstType}
            onChange={(e) => setGstType(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="CGST_SGST">CGST + SGST</option>
            <option value="IGST">IGST</option>
            <option value="NONE">NONE</option>
          </select>
        </div>
      </div>

      {/* Dates and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Date Collected</label>
          <input
            type="date"
            value={dateCollected}
            onChange={(e) => setDateCollected(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Date Delivered</label>
          <input
            type="date"
            value={dateDelivered}
            onChange={(e) => setDateDelivered(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="collected">Collected</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="mb-6 border-t pt-4 text-gray-800 space-y-2">
        <div><strong>Subtotal:</strong> ₹{subTotal.toFixed(2)}</div>
        <div><strong>Discount:</strong> ₹{discount.toFixed(2)}</div>
        <div><strong>Tax Amount:</strong> ₹{taxAmount.toFixed(2)}</div>
        <div><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</div>
        <div><strong>In Words:</strong> {amountInWords}</div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
      >
        Submit Invoice
      </button>
    </form>
  );
};

export default LaundryInvoiceForm;
