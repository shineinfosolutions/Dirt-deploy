// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaTruck,
  FaClock,
  FaChartLine,
  FaTshirt,
  FaWater,
  FaSpinner,
} from "react-icons/fa";
import axios from "axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    newOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    todayExpected: 0,
    collectedOrders: 0,
  });

  const [apiData, setApiData] = useState({
    yearlySales: [],
    monthlySales: [],
    weeklyData: [],
  });

  const [deliveryData, setDeliveryData] = useState({
    pending: { orders: [] },
    collected: { orders: [] },
    delivered: { orders: [] },
    todayExpectedDeliveries: { orders: [] },
    todayReceivedOrders: { orders: [] },
  });

  const [activeView, setActiveView] = useState("sales");

  // Fetch data from API
  // Fetch data from API
  // Update the fetchStats function in Dashboard.jsx
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch sales stats first (this is working)
        const salesResponse = await axios.get(
          "https://dirt-off-backend-main.vercel.app/entry/stats/recent"
        );
        const salesData = salesResponse.data.data;

        const totalSalesCalculated = salesData.yearlySales.reduce(
          (acc, year) => acc + year.totalSales,
          0
        );

        setApiData({
          yearlySales: salesData.yearlySales,
          monthlySales: salesData.monthlySales,
          weeklyData: salesData.weeklyData,
        });

        // Set sales data immediately
        setStats((prev) => ({
          ...prev,
          totalSales: totalSalesCalculated,
        }));

        // Try delivery APIs individually to avoid complete failure
        const deliveryTypes = [
          "pending",
          "collected",
          "delivered",
          "todayExpected",
          "todayReceived",
        ];
        const deliveryResults = {};
        const deliveryStats = {};

        for (const type of deliveryTypes) {
          try {
            const res = await axios.get(
              `https://dirt-off-backend-main.vercel.app/entry/pending/deliveries?type=${type}`
            );
            deliveryResults[type] = res.data.data;
            deliveryStats[type] = res.data.data.count || 0;
          } catch (error) {
            console.error(`${type} API failed:`, error);
            deliveryResults[type] = { orders: [], count: 0 };
            deliveryStats[type] = 0;
          }
        }

        setDeliveryData({
          pending: deliveryResults.pending || { orders: [] },
          collected: deliveryResults.collected || { orders: [] },
          delivered: deliveryResults.delivered || { orders: [] },
          todayExpectedDeliveries: deliveryResults.todayExpected || {
            orders: [],
          },
          todayReceivedOrders: deliveryResults.todayReceived || { orders: [] },
        });

        // Update all stats
        setStats({
          newOrders: deliveryStats.todayReceived || 0,
          todayExpected: deliveryStats.todayExpected || 0,
          pendingOrders: deliveryStats.pending || 0,
          collectedOrders: deliveryStats.collected || 0,
          deliveredOrders: deliveryStats.delivered || 0,
          totalSales: totalSalesCalculated,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);
  // Process data for charts
  const processWeeklyData = () => {
    return apiData.weeklyData.map((item) => item.totalSales);
  };

  const processMonthlyData = () => {
    const monthlyArray = new Array(12).fill(0);
    apiData.monthlySales.forEach((item) => {
      monthlyArray[item.month - 1] = item.totalSales;
    });
    return monthlyArray;
  };

  const processYearlyData = () => {
    return apiData.yearlySales.map((item) => ({
      year: item.year.toString(),
      sales: item.totalSales,
      color:
        item.year === 2025
          ? "#a997cb"
          : item.year === 2024
          ? "#8b5cf6"
          : "#7c3aed",
    }));
  };
  const weeklyChartData = processWeeklyData();
  const monthlyChartData = processMonthlyData();
  const yearlyChartData = processYearlyData();
  const maxWeeklySales = Math.max(...weeklyChartData, 1);
  const maxMonthlySales = Math.max(...monthlyChartData, 1);

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case "newOrders":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              New Orders
            </h3>
            <div className="space-y-3">
              {deliveryData.todayReceivedOrders.orders?.length > 0 ? (
                deliveryData.todayReceivedOrders.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-purple-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {order.customer || "Customer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Receipt #{order.receiptNo}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No new orders today</p>
                </div>
              )}
            </div>
          </div>
        );

      case "todayExpected":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Today's Expected Deliveries
            </h3>
            <div className="space-y-3">
              {deliveryData.todayExpectedDeliveries.orders?.length > 0 ? (
                deliveryData.todayExpectedDeliveries.orders.map(
                  (order, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {order.customer || "Customer"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Receipt #{order.receiptNo}
                        </p>
                      </div>
                      <span className="text-sm text-blue-600">
                        Expected Today
                      </span>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8">
                  <FaClock className="text-purple-500 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">
                    No deliveries expected for today
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "delivered":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delivered Orders
            </h3>
            <div className="space-y-3">
              {deliveryData.delivered.orders?.length > 0 ? (
                deliveryData.delivered.orders.map((order, index) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-purple-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {order.customer || "Customer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Receipt #{order.receiptNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-full">
                        Delivered
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No delivered orders</p>
                </div>
              )}
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              To be collected
            </h3>
            <div className="space-y-3">
              {deliveryData.pending.orders?.length > 0 ? (
                deliveryData.pending.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {order.customer || "Customer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Receipt #{order.receiptNo}
                      </p>
                    </div>
                    <span className="text-sm bg-yellow-600 text-white px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pending orders</p>
                </div>
              )}
            </div>
          </div>
        );

      // Add this case after the "pending" case in renderContent
      case "collected":
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Collected Orders
            </h3>
            <div className="space-y-3">
              {deliveryData.collected.orders?.length > 0 ? (
                deliveryData.collected.orders.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {order.customer || "Customer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Receipt #{order.receiptNo}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {order.pickupAndDelivery?.pickupDate
                        ? new Date(
                            order.pickupAndDelivery.pickupDate
                          ).toLocaleDateString()
                        : "No pickup date"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaTshirt className="text-purple-500 text-4xl mx-auto mb-4" />
                  <p className="text-gray-600">No orders collected yet</p>
                </div>
              )}
            </div>
          </div>
        );

      default: // sales
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Sales Analytics
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly Sales Graph */}
              {/* Weekly Sales Graph */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Weekly Sales
                </h4>
                <div className="h-64 bg-purple-50 rounded-lg p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="280"
                        y2={40 + i * 30}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Y-axis labels */}
                    {(() => {
                      const weeklyChartData = processWeeklyData();
                      const maxWeeklySales = Math.max(...weeklyChartData, 1);
                      const maxLabel = Math.ceil(maxWeeklySales / 100) * 100;
                      return [
                        maxLabel,
                        maxLabel * 0.8,
                        maxLabel * 0.6,
                        maxLabel * 0.4,
                        maxLabel * 0.2,
                        0,
                      ].map((val, i) => (
                        <text
                          key={i}
                          x="30"
                          y={45 + i * 25}
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      ));
                    })()}

                    {/* Line graph */}
                    {(() => {
                      const weeklyChartData = processWeeklyData();
                      const maxWeeklySales = Math.max(...weeklyChartData, 1);
                      return (
                        <polyline
                          fill="none"
                          stroke="url(#weeklyGradient)"
                          strokeWidth="3"
                          points={weeklyChartData
                            .map(
                              (val, i) =>
                                `${60 + i * 30},${
                                  170 - (val / maxWeeklySales) * 120
                                }`
                            )
                            .join(" ")}
                        />
                      );
                    })()}

                    {/* Data points */}
                    {(() => {
                      const weeklyChartData = processWeeklyData();
                      const maxWeeklySales = Math.max(...weeklyChartData, 1);
                      return weeklyChartData.map((val, i) => (
                        <circle
                          key={i}
                          cx={60 + i * 30}
                          cy={170 - (val / maxWeeklySales) * 120}
                          r="4"
                          fill="#a997cb"
                        />
                      ));
                    })()}

                    {/* X-axis labels */}
                    {apiData.weeklyData.map((item, i) => (
                      <text
                        key={i}
                        x={60 + i * 30}
                        y="190"
                        fontSize="8"
                        fill="#6b7280"
                        textAnchor="middle"
                      >
                        {new Date(item.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </text>
                    ))}

                    <defs>
                      <linearGradient
                        id="weeklyGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#a997cb" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Monthly Sales Graph */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Monthly Sales 2025
                </h4>
                <div className="h-64 bg-purple-50 rounded-lg p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="280"
                        y2={40 + i * 30}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Y-axis labels */}
                    {(() => {
                      const maxLabel = Math.ceil(maxMonthlySales / 500) * 500;
                      return [
                        maxLabel,
                        maxLabel * 0.8,
                        maxLabel * 0.6,
                        maxLabel * 0.4,
                        maxLabel * 0.2,
                        0,
                      ].map((val, i) => (
                        <text
                          key={i}
                          x="30"
                          y={50 + i * 25}
                          fontSize="10"
                          fill="#6b7280"
                          textAnchor="end"
                        >
                          {val}
                        </text>
                      ));
                    })()}

                    {/* Bar chart for monthly data */}
                    {monthlyChartData.map((val, i) => {
                      const barHeight = (val / maxMonthlySales) * 120;
                      return (
                        <rect
                          key={i}
                          x={50 + i * 18}
                          y={170 - barHeight}
                          width="15"
                          height={barHeight}
                          fill={`url(#monthlyGradient${i})`}
                          rx="2"
                        />
                      );
                    })}
                    {/* Month labels */}
                    {[
                      "J",
                      "F",
                      "M",
                      "A",
                      "M",
                      "J",
                      "J",
                      "A",
                      "S",
                      "O",
                      "N",
                      "D",
                    ].map((month, i) => (
                      <text
                        key={i}
                        x={57 + i * 18}
                        y="190"
                        fontSize="8"
                        fill="#6b7280"
                        textAnchor="middle"
                      >
                        {month}
                      </text>
                    ))}

                    <defs>
                      {monthlyChartData.map((_, i) => (
                        <linearGradient
                          key={i}
                          id={`monthlyGradient${i}`}
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#a997cb" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      ))}
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Yearly Sales Graph */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-4">
                  Yearly Performance
                </h4>
                <div className="h-64 bg-purple-50 rounded-lg p-4 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 200">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="40"
                        y1={40 + i * 30}
                        x2="280"
                        y2={40 + i * 30}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Y-axis labels */}
                    {/* {[700, 600, 500, 400, 300].map((val, i) => (
                      <text
                        key={i}
                        x="30"
                        y={50 + i * 30}
                        fontSize="10"
                        fill="#6b7280"
                        textAnchor="end"
                      >
                        {val}k
                      </text>
                    ))} */}

                    {/* Pie chart for yearly data */}
                    <g transform="translate(150, 100)">
                      {yearlyChartData.map((data, i) => {
                        const totalSales = yearlyChartData.reduce(
                          (acc, item) => acc + item.sales,
                          0
                        );
                        const radius = 60;
                        const angle = (data.sales / totalSales) * 360;

                        // Calculate cumulative angle for this slice
                        let cumulativeAngle = 0;
                        for (let j = 0; j < i; j++) {
                          cumulativeAngle +=
                            (yearlyChartData[j].sales / totalSales) * 360;
                        }

                        const startAngle = cumulativeAngle * (Math.PI / 180);
                        const endAngle =
                          (cumulativeAngle + angle) * (Math.PI / 180);

                        const x1 = Math.cos(startAngle) * radius;
                        const y1 = Math.sin(startAngle) * radius;
                        const x2 = Math.cos(endAngle) * radius;
                        const y2 = Math.sin(endAngle) * radius;

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        return (
                          <g key={i}>
                            <path
                              d={`M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                              fill={data.color}
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={Math.cos((startAngle + endAngle) / 2) * 40}
                              y={Math.sin((startAngle + endAngle) / 2) * 40}
                              fontSize="10"
                              fill="white"
                              textAnchor="middle"
                            >
                              {data.year}
                            </text>
                          </g>
                        );
                      })}
                    </g>

                    {/* Legend */}
                    {/* Legend */}
                    <g transform="translate(20, 170)">
                      {yearlyChartData.map((item, i) => (
                        <g key={i} transform={`translate(${i * 80}, 0)`}>
                          <circle cx="5" cy="5" r="4" fill={item.color} />
                          <text x="15" y="9" fontSize="8" fill="#6b7280">
                            {item.year}: ₹{(item.sales / 1000).toFixed(0)}k
                          </text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-100 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaTshirt className="text-[#a997cb]" />
          Laundry Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening with your laundry business
          today.
        </p>
      </div>

      {/* Stats Cards - 5 Cards */}
      <div className="space-y-6 mb-8">
        {/* First Row - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Orders */}
          <div
            onClick={() => setActiveView("newOrders")}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">New Orders</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.newOrders}
                </h3>
                <p className="text-purple-500 text-xs mt-1">
                  ↗ +12% from yesterday
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaShoppingCart className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Today's Expected Deliveries */}
          <div
            onClick={() => setActiveView("todayExpected")}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Today's Expected
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.todayExpected || 0}
                </h3>
                <p className="text-purple-500 text-xs mt-1">Deliveries today</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaClock className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div
            onClick={() => setActiveView("pending")}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Pending Orders
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.pendingOrders}
                </h3>
                <p className="text-purple-500 text-xs mt-1">In progress</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaSpinner className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Second Row - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collected Orders */}
          <div
            onClick={() => setActiveView("collected")}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Collected Orders
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.collectedOrders}
                </h3>
                <p className="text-purple-500 text-xs mt-1">Ready for pickup</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaTshirt className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Total Deliveries */}
          <div
            onClick={() => setActiveView("delivered")}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Deliveries
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.deliveredOrders}
                </h3>
                <p className="text-purple-500 text-xs mt-1">
                  ↗ +8% from yesterday
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaTruck className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Total Sales */}
          <div
            onClick={() => setActiveView("sales")}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600 hover:shadow-xl transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Sales</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  ₹{stats.totalSales.toLocaleString()}
                </h3>
                <p className="text-purple-600 text-xs mt-1">
                  ↗ +15% from last month
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <FaChartLine className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Status */}
      {/* <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaWater className="text-[#a997cb]" />
            <h3 className="text-lg font-semibold text-gray-800">
              Service Status
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaSpinner className="text-[#a997cb] animate-spin" />
                <span className="font-medium">Washing</span>
              </div>
              <span className="bg-[#a997cb] text-white px-2 py-1 rounded-full text-xs">
                8 items
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaClock className="text-purple-500" />
                <span className="font-medium">Drying</span>
              </div>
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                5 items
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FaTshirt className="text-purple-600" />
                <span className="font-medium">Ready</span>
              </div>
              <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
                12 items
              </span>
            </div>
          </div>
        </div> */}

      {renderContent()}

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FaShoppingCart className="text-[#a997cb] text-2xl mb-2" />
            <span className="text-sm font-medium">New Order</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FaTruck className="text-[#8a82b5] text-2xl mb-2" />
            <span className="text-sm font-medium">Delivery</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FaTshirt className="text-purple-600 text-2xl mb-2" />
            <span className="text-sm font-medium">Inventory</span>
          </button>

          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FaChartLine className="text-purple-500 text-2xl mb-2" />
            <span className="text-sm font-medium">Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
