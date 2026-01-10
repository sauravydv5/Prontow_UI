import { AdminLayout } from "@/components/AdminLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Calendar } from "lucide-react";

export default function Dashboard() {
  const salesData = [
    { x: "00", a: 40, b: 35, c: 50, d: 30 },
    { x: "00", a: 35, b: 50, c: 45, d: 38 },
    { x: "00", a: 45, b: 40, c: 60, d: 35 },
    { x: "00", a: 30, b: 45, c: 55, d: 20 },
    { x: "00", a: 55, b: 35, c: 50, d: 45 },
    { x: "00", a: 50, b: 45, c: 40, d: 60 },
  ];

  const productData = [
    { name: "Product 1", value: 8 },
    { name: "Product 2", value: 25 },
    { name: "Product 3", value: 10 },
    { name: "Product 4", value: 18 },
  ];

  const barColors = ["#a855f7", "#3b82f6", "#fb923c", "#10b981"];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-10 px-6 pb-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#FADBD8] rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">Total Sale</p>
              <Calendar size={16} className="text-gray-600" />
            </div>
            <h3 className="text-3xl font-bold text-[#9C1C47]">Rs. 352</h3>
          </div>

          <div className="bg-[#E8D6EE] rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">Total Order</p>
              <Calendar size={16} className="text-gray-600" />
            </div>
            <h3 className="text-3xl font-bold text-[#9C1C47]">120</h3>
          </div>

          <div className="bg-[#CDEBE7] rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">Active Customer</p>
              <Calendar size={16} className="text-gray-600" />
            </div>
            <h3 className="text-3xl font-bold text-[#9C1C47]">560</h3>
          </div>

          <div className="bg-[#F9D99A] rounded-xl shadow p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-medium">Low Stock</p>
              <Calendar size={16} className="text-gray-600" />
            </div>
            <h3 className="text-3xl font-bold text-[#9C1C47]">68</h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Line Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-sm text-gray-700 font-medium mb-1">Sales</h4>
                <p className="text-2xl font-bold text-[#0EAD8C]">+10,566</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="x" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="a"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="b"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="c"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="d"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Performance Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-sm text-gray-700 font-medium mb-3">
              Product Performance
            </h4>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={productData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis dataKey="name" tick={false} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {productData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
