import React, { useState } from "react";
import axios from "axios";
import { toWords } from "number-to-words";
const today = new Date().toISOString().split("T")[0];
const CustomerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    totalAmount: 0,
    amountInWords: "",
    dateCollected: today,
    dateDelivered: "",
    notes: "",
    status: "pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index][name] =
      name === "quantity" || name === "price" ? Number(value) : value;
    const total = updatedItems.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const words = toWords(total);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      totalAmount: total,
      amountInWords: words,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", quantity: 1, price: 0 }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://dirt-off-deploy.onrender.com/customer/create",
        formData
      );
      alert("Customer data submitted!");
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        items: [{ description: "", quantity: 1, price: 0 }],
        totalAmount: 0,
        amountInWords: "",
        dateCollected: today,
        dateDelivered: "",
        notes: "",
        status: "pending",
      });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/servicelist")}
          className="mt-4 bg-[#a997cb] text-white px-5 py-2 rounded hover:bg-[#8a82b5] transition disabled:opacity-50"
        >
          ← Back
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Customer Details Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
          <input
            name="phone"
            placeholder="Phone (10 digits)"
            value={formData.phone}
            onChange={handleChange}
            pattern="\d{10}"
            className="border p-2 rounded w-full"
            required
          />
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          {formData.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2"
            >
              <input
                name="description"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, e)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, e)}
                className="border p-2 rounded"
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Add Item
          </button>
        </div>

        {/* Other Fields */}
        <input
          name="amountInWords"
          placeholder="Amount in Words"
          value={formData.amountInWords}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="dateCollected"
              className="mb-1 text-sm text-gray-700 font-medium"
            >
              Date Collected
            </label>
            <input
              type="date"
              name="dateCollected"
              id="dateCollected"
              value={formData.dateCollected}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="dateDelivered"
              className="mb-1 text-sm text-gray-700 font-medium"
            >
              Date Delivered
            </label>
            <input
              type="date"
              name="dateDelivered"
              id="dateDelivered"
              value={formData.dateDelivered}
              onChange={handleChange}
              className="border p-2 rounded"
            />
          </div>
        </div>

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          rows={3}
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="collected">Collected</option>
        </select>

        <p className="text-lg font-semibold text-gray-700">
          Total: ₹{formData.totalAmount}
        </p>

        <button
          type="submit"
          className="w-full mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
