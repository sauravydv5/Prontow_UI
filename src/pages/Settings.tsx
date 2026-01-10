"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { ChevronRight } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const settingsOptions = [
    { id: 1, label: "General", path: "/settings/general" },
    { id: 2, label: "Forgot Password", path: "/settings/forgot-password" },
  ];

  return (
    <AdminLayout title="Settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex flex-col items-start w-full px-8 mt-6"
      >
        <div className="w-full max-w-2xl space-y-4 md:w-[70%]">
          {settingsOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => navigate(option.path)}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-5 py-4 shadow-sm transition-all hover:bg-gray-50"
            >
              <span className="text-base font-medium text-gray-800">
                {option.label}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
