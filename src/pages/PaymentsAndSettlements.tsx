import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import adminInstance from "@/adminApi/adminInstance";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  settled: boolean;
  orderData?: any;
}

interface OrderDetails {
  orderId: string;
  status: string;
  orderDate: string;
  orderTime: string;
  estimatedDelivery: string;
  trackingNumber: string;
  carrier: string;
  paymentMethod: string;
  paymentStatus: string;
  totalPrice: number;
  discount: number;
  tax: number;
  shippingAddress: string;
  items: string;
  settled: boolean;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  trackingTimeline: any[];
}

function PaymentsAndSettlements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching orders...");
      const response = await adminInstance.get("/orders/admin");
      console.log("API Response:", response.data);

      const data = response.data;

      // Your API returns {status, data, message} structure
      const orders = data.data || [];

      if (!Array.isArray(orders) || orders.length === 0) {
        setTransactions([]);
        setError("No orders found");
        return;
      }

      // Transform API data to match your actual response structure
      const transformedTransactions = orders.map((order: any) => {
        return {
          id: order._id || "#N/A",
          date: order.createdAt
            ? new Date(order.createdAt)
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })
                .replace(/ /g, "-")
            : "N/A",
          amount: Number(order.totalPrice || 0),
          paymentMethod: order.paymentMethod || "N/A",
          settled:
            order.paymentStatus === "completed" || order.status === "Delivered",
          orderData: order,
        };
      });

      setTransactions(transformedTransactions);
      setCurrentPage(1); // Reset to first page when data loads
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      console.error("Error details:", err.response?.data);

      if (err.response) {
        setError(
          `Server Error: ${err.response.status} - ${
            err.response.data?.message || "Failed to load"
          }`
        );
      } else if (err.request) {
        setError(
          "Network Error: Cannot connect to server. Check if backend is running."
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (transaction: Transaction) => {
    const order = transaction.orderData;

    // Extract items for display
    const items = order?.items || [];
    const itemsText =
      items
        .map(
          (item: any) =>
            `${item.productName} (Qty: ${item.quantity}) - ₹${Number(
              item.price
            ).toFixed(2)}`
        )
        .join(", ") || "N/A";

    // Get tracking info
    const tracking = order?.tracking || {};
    const address = order?.address || {};

    // Format address
    const addressText = `${address.street || ""}, ${address.city || ""}, ${
      address.state || ""
    } - ${address.zip || ""}, ${address.country || ""}`.trim();

    // Filter out consecutive duplicate timeline events
    const rawTimeline = tracking.timeline || [];
    const uniqueTimeline = rawTimeline.reduce((acc, current) => {
      const lastEvent = acc[acc.length - 1];
      // Add the event only if it's the first one or its status is different from the last one
      if (!lastEvent || lastEvent.status !== current.status) {
        acc.push(current);
      }
      return acc;
    }, []);

    const orderDetails: OrderDetails = {
      orderId: transaction.id,
      status: order?.status || "N/A",
      orderDate: transaction.date,
      orderTime: order?.createdAt
        ? new Date(order.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
      estimatedDelivery: tracking.estimatedDelivery
        ? new Date(tracking.estimatedDelivery)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "2-digit",
            })
            .replace(/ /g, "-")
        : "N/A",
      trackingNumber: tracking.trackingNumber || "N/A",
      carrier: tracking.carrier || "N/A",
      paymentMethod: order?.paymentMethod || "N/A",
      paymentStatus: order?.paymentStatus || "N/A",
      totalPrice: Number(order?.totalPrice || 0),
      discount: Number(order?.discount || 0),
      tax: Number(order?.tax || 0),
      shippingAddress: addressText || "N/A",
      items: itemsText,
      settled: transaction.settled,
      razorpayOrderId: order?.razorpayOrderId || "N/A",
      razorpayPaymentId: order?.razorpayPaymentId || "N/A",
      trackingTimeline: uniqueTimeline,
    };

    setSelectedOrder(orderDetails);
    setIsDialogOpen(true);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.id.toLowerCase().includes(query) ||
      transaction.date.toLowerCase().includes(query) ||
      transaction.paymentMethod.toLowerCase().includes(query) ||
      transaction.amount.toString().toLowerCase().includes(query) ||
      (transaction.settled ? "yes" : "no").includes(query)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <AdminLayout title="Settings > Payments & Settlements">
      <div className="min-h-screen bg-white-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-screen bg-white p-4 max-w-7xl mx-auto space-y-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Payments & Settlements
          </h1>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, date, method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
    pl-12 pr-4 
    h-9 sm:h-10          /* 👈 Same height as icons */
    bg-blue-50/50 
    border-0 
    rounded-full 
    text-sm sm:text-base 
    w-full 
    focus:outline-none 
    focus:ring-2 
    focus:ring-[#119D82]
  "
              />
            </div>

            <div className="flex gap-2 justify-end sm:justify-start">
              <button
                onClick={fetchOrders}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#119D82] hover:bg-[#0d7d68] text-white flex items-center justify-center transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#119D82] animate-spin mb-4" />
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
              <p className="text-red-600 text-center mb-2 font-semibold">
                Error Loading Data
              </p>
              <p className="text-gray-600 text-center text-sm mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="mx-auto block px-6 py-2 bg-[#119D82] text-white rounded-lg hover:bg-[#0d7d68] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {[
                          "Transaction ID",
                          "Date",
                          "Amount",
                          "Payment Method",
                          "Amount Settled",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentTransactions.length > 0 ? (
                        currentTransactions.map((transaction, index) => (
                          <tr
                            key={index}
                            onClick={() => handleRowClick(transaction)}
                            className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              {transaction.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {transaction.date}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              ₹{transaction.amount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {transaction.paymentMethod}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-sm font-semibold ${
                                  transaction.settled
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.settled ? "Yes" : "No"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="text-center py-6 text-gray-500"
                          >
                            No matching transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {currentTransactions.length > 0 ? (
                    currentTransactions.map((transaction, index) => (
                      <div
                        key={index}
                        onClick={() => handleRowClick(transaction)}
                        className="p-4 flex flex-col gap-2 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <span className="truncate mr-2">
                            {transaction.id}
                          </span>
                          <span
                            className={
                              transaction.settled
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.settled ? "Settled" : "Pending"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Date:</span>
                          <span>{transaction.date}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Amount:</span>
                          <span>₹{transaction.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>Method:</span>
                          <span>{transaction.paymentMethod}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No matching transactions found.
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {filteredTransactions.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(endIndex, filteredTransactions.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {filteredTransactions.length}
                    </span>{" "}
                    results
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-[#119D82] text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Order Details Dialog */}
          {isDialogOpen && selectedOrder && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setIsDialogOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl max-w-lg sm:max-w-xl md:max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="text-xs sm:text-sm text-[#119D82] font-medium mb-4">
                  Payments & Settlement {">"} {selectedOrder.orderId}
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200">
                  <h2 className="text-center text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-gray-900">
                    Order Details
                  </h2>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Order ID:
                      </span>
                      <span className="font-semibold text-right text-gray-900 max-w-[60%] break-all">
                        {selectedOrder.orderId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">Status:</span>
                      <span
                        className={`font-semibold ${
                          selectedOrder.status === "Delivered"
                            ? "text-green-600"
                            : selectedOrder.status === "Cancelled"
                            ? "text-red-600"
                            : selectedOrder.status === "Shipped"
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {selectedOrder.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Order Date:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.orderDate}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Order Time:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.orderTime}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 pt-3"></div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Tracking Number:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.trackingNumber}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Carrier:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.carrier}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Est. Delivery:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.estimatedDelivery}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Tracking Timeline:
                      </span>
                      <div className="bg-gray-50 p-4 rounded-lg mt-1">
                        <div className="relative">
                          {selectedOrder.trackingTimeline.length > 0 ? (
                            selectedOrder.trackingTimeline.map(
                              (event, index) => (
                                <div key={index} className="mb-4 pl-6 relative">
                                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#119D82] z-10 border-2 border-white"></div>
                                  {index <
                                    selectedOrder.trackingTimeline.length -
                                      1 && (
                                    <div className="absolute top-2 left-[5px] h-full w-px bg-gray-300"></div>
                                  )}
                                  <p className="text-sm font-semibold text-gray-900">
                                    {event.status}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {event.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {new Date(event.timestamp).toLocaleString(
                                      "en-GB"
                                    )}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-xs text-gray-500">
                              No tracking updates available.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-3"></div>

                    <div className="flex justify-between items-start text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">Items:</span>
                      <span className="font-semibold text-right text-gray-900 max-w-[60%]">
                        {selectedOrder.items}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 pt-3"></div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Payment Method:
                      </span>
                      <span className="font-semibold text-gray-900">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Payment Status:
                      </span>
                      <span
                        className={`font-semibold ${
                          selectedOrder.paymentStatus === "completed"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Razorpay Order ID:
                      </span>
                      <span className="font-semibold text-gray-900 break-all">
                        {selectedOrder.razorpayOrderId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Razorpay Payment ID:
                      </span>
                      <span className="font-semibold text-gray-900 break-all">
                        {selectedOrder.razorpayPaymentId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Total Amount:
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{selectedOrder.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Discount:
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹{selectedOrder.discount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">Tax:</span>
                      <span className="font-semibold text-gray-900">
                        ₹{selectedOrder.tax.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 pt-3"></div>

                    <div className="flex justify-between items-start text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Shipping Address:
                      </span>
                      <span className="font-semibold text-right text-gray-900 max-w-[60%]">
                        {selectedOrder.shippingAddress}
                      </span>
                    </div>

                    <div className="border-t border-gray-300 pt-3"></div>

                    <div className="flex justify-between items-center text-sm sm:text-base">
                      <span className="text-gray-700 font-medium">
                        Amount Settled:
                      </span>
                      <span
                        className={`font-semibold ${
                          selectedOrder.settled
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedOrder.settled ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="mt-6 w-full py-3 bg-[#119D82] text-white rounded-lg hover:bg-[#0d7d68] transition-colors font-medium"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default PaymentsAndSettlements;
