import { AdminLayout } from "@/components/AdminLayout";
import React from "react";
import { Bell, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

function Notifications() {
  const notifications = [
    {
      _id: "1",
      type: "success",
      message: "Your profile has been updated successfully.",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      type: "info",
      message: "New features are available in the dashboard.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: "3",
      type: "warning",
      message: "Your subscription is about to expire.",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: "4",
      type: "error",
      message: "Failed to sync data with the server.",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];
  const isLoading = false;
  const error = null;

  return (
    <AdminLayout title="Notifications">
      <div className="container mx-auto py-6">
        {/* <h1 className="text-2xl font-semibold mb-4">Notifications</h1> */}
        <div className="space-y-4">
          {isLoading && <div>Loading notifications...</div>}
          {error && <div className="text-red-500">Failed to load notifications. Please try again.</div>}
          {!isLoading && !error && notifications.length === 0 && (
            <div className="text-center text-gray-500 py-8">No notifications yet.</div>
          )}
          {!isLoading && notifications.map((notification: any) => (
            <div
              key={notification._id}
              className={`flex items-center p-4 rounded-md shadow-sm border ${
                notification.type === "success"
                  ? "border-green-500 bg-green-50"
                  : notification.type === "info"
                  ? "border-blue-500 bg-blue-50"
                  : notification.type === "warning"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              {notification.type === "success" && <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />}
              {notification.type === "info" && <Info className="w-5 h-5 mr-2 text-blue-500" />}
              {notification.type === "warning" && <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />}
              {notification.type === "error" && <Bell className="w-5 h-5 mr-2 text-red-500" />}

              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
};

export default Notifications;