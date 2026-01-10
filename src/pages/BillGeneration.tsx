import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Download, Eye, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const bills = Array.from({ length: 26 }, (_, i) => ({
  id: i + 1,
  billNo: `BILL${String(1000 + i).padStart(5, '0')}`,
  customer: i % 2 === 0 ? "John Doe" : "Jane Smith",
  orderNo: `ORD${String(1000 + i).padStart(5, '0')}`,
  date: `2024-0${(i % 9) + 1}-${(i % 28) + 1}`,
  amount: `Rs. ${(Math.random() * 5000 + 1000).toFixed(2)}`,
  tax: `Rs. ${(Math.random() * 500 + 100).toFixed(2)}`,
  total: `Rs. ${(Math.random() * 6000 + 1500).toFixed(2)}`,
  status: ["Paid", "Unpaid", "Partial"][i % 3],
  paymentMethod: ["Cash", "Card", "UPI", "Net Banking"][i % 4],
}));

export default function BillGeneration() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = bills.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Paid: "bg-green-100 text-green-800",
      Unpaid: "bg-red-100 text-red-800",
      Partial: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <AdminLayout title="Bill Generation">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-muted-foreground">Total Bills</p>
            <p className="text-3xl font-bold mt-2">456</p>
            <p className="text-sm text-success mt-1">This month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-muted-foreground">Paid Bills</p>
            <p className="text-3xl font-bold mt-2 text-success">340</p>
            <p className="text-sm text-muted-foreground mt-1">74.5% of total</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-muted-foreground">Unpaid Bills</p>
            <p className="text-3xl font-bold mt-2 text-error">89</p>
            <p className="text-sm text-muted-foreground mt-1">19.5% of total</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold mt-2">Rs. 1.2M</p>
            <p className="text-sm text-success mt-1">+18.7% from last month</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="secondary" className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Generate Bill
          </Button>
          <Button variant="secondary" className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Export Bills
          </Button>
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search bills"
              className="pl-10 bg-muted border-0"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Bill No</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Order No</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Tax</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentBills.map((bill) => (
                  <tr key={bill.id} className="text-sm hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{bill.billNo}</td>
                    <td className="px-6 py-4">{bill.customer}</td>
                    <td className="px-6 py-4">{bill.orderNo}</td>
                    <td className="px-6 py-4">{bill.date}</td>
                    <td className="px-6 py-4">{bill.amount}</td>
                    <td className="px-6 py-4">{bill.tax}</td>
                    <td className="px-6 py-4 font-medium">{bill.total}</td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(bill.status)}>
                        {bill.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, bills.length)} of {bills.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* View Bill Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>{selectedBill?.billNo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium">{selectedBill?.customer}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="font-medium">{selectedBill?.orderNo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{selectedBill?.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="font-medium">{selectedBill?.paymentMethod}</p>
              </div>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{selectedBill?.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">{selectedBill?.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{selectedBill?.total}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Status</p>
              <Badge className={getStatusColor(selectedBill?.status || "")}>
                {selectedBill?.status}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
