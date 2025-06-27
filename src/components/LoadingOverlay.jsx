import React from "react";
import { FaSpinner } from "react-icons/fa";

const LoadingOverlay = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <FaSpinner className="text-purple-600 text-3xl animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
