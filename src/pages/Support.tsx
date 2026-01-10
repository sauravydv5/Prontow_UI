import { AdminLayout } from '@/components/AdminLayout';
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAllTickets, updateTicketStatus } from '@/adminApi/supportApi';
import {toast } from 'sonner';

interface Ticket {
  _id: string; // Raw ID for API calls
  id: string;
  customerName: string;
  submissionDate: string;
  issueType: string;
  priorityLevel: 'High' | 'Low' | 'Medium';
  status: 'OPEN' | 'RESOLVED' | 'IN_PROGRESS' | 'CLOSED'; // Added 'CLOSED' status
}

type SortKey = 'priorityLevel' | 'submissionDate' | 'customerName';
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

interface StatusChangeInfo {
  ticketId: string;
  newStatus: Ticket['status'];
}

function Support() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [statusChangeInfo, setStatusChangeInfo] = useState<StatusChangeInfo | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await getAllTickets();
        const formattedTickets = response.data.data.map((ticket: any) => ({
          _id: ticket._id, // Store raw ID
          id: `#${ticket._id.slice(-6)}`, 
          customerName: ticket.user?.email || 'N/A', // Use email as name is not available
          submissionDate: new Date(ticket.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit',
          }),
          issueType: ticket.issueType,
          priorityLevel: ticket.priority || 'Medium', // Default to Medium if not present
          status: ticket.status,
        }));
        setTickets(formattedTickets);
        setError(null);
      } catch (err) {
        setError("Failed to fetch tickets.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const totalComplaints = tickets.length;
  const resolvedComplaints = tickets.filter((t) => t.status === 'RESOLVED').length;
  const pendingComplaints = tickets.filter((t) => t.status === 'OPEN').length;

  const handleStatusChangeRequest = (ticketId: string, newStatus: Ticket['status']) => {
    setStatusChangeInfo({ ticketId, newStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeInfo) return;

    const { ticketId, newStatus } = statusChangeInfo;
    // Optimistically update the UI
    const originalTickets = [...tickets];
    setTickets(currentTickets =>
      currentTickets.map(t => (t._id === ticketId ? { ...t, status: newStatus } : t))
    );
    setStatusChangeInfo(null); // Close dialog immediately

    try {
      await updateTicketStatus(ticketId, { status: newStatus });
      toast.success('Status updated successfully!');
    } catch (error) {
      console.error("Failed to update status:", error);
      setTickets(originalTickets);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleRowClick = (ticketId: string) => {
    navigate(`/support/support-details/${ticketId}`);
  };

  const sortedAndFilteredTickets = useMemo(() => {
    let filtered = tickets?.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key];
        let bValue: any = b[sortConfig.key];

        // Custom sorting logic
        if (sortConfig.key === 'submissionDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (sortConfig.key === 'priorityLevel') {
          const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
          aValue = priorityOrder[aValue as 'High' | 'Medium' | 'Low'];
          bValue = priorityOrder[bValue as 'High' | 'Medium' | 'Low'];
        } else if (sortConfig.key === 'customerName') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [tickets, searchQuery, sortConfig]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <AdminLayout title="Supports">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="space-y-6"
      >
        {/* Stats + Search */}
        <div className="flex flex-col lg:flex-row flex-wrap gap-4 items-stretch">
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="bg-[#1BA9D8] text-white rounded-2xl px-6 py-5 flex-1 min-w-[160px]">
              <div className="text-3xl md:text-4xl font-bold mb-1 text-center">{totalComplaints}</div>
              <div className="text-sm font-medium text-center">Total Complaints</div>
            </div>

            <div className="bg-[#4CAF50] text-white rounded-2xl px-6 py-5 flex-1 min-w-[160px]">
              <div className="text-3xl md:text-4xl font-bold mb-1 text-center">{resolvedComplaints}</div>
              <div className="text-sm font-medium text-center">Resolved Complaints</div>
            </div>

            <div className="bg-[#FFA726] text-white rounded-2xl px-6 py-5 flex-1 min-w-[160px]">
              <div className="text-3xl md:text-4xl font-bold mb-1 text-center">{pendingComplaints}</div>
              <div className="text-sm font-medium text-center">Pending Complaints</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-between sm:justify-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
            
            {/* Input (typing only updates searchTerm) */}
            <Input
              type="text"
              placeholder="Search by Ticket ID, Customer, or Issue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-[45px] md:h-[50px] w-full sm:w-[275px] rounded-full text-base border border-gray-300 bg-[#DBE9FF]"
            />

            {/* Search button triggers actual search */}
            <Button
              size="icon"
              onClick={() => setSearchQuery(searchTerm)} // ⭐ Only filter when clicked
              className="h-[45px] md:h-[50px] w-[45px] md:w-[50px] rounded-full bg-[#1BA9D8] hover:bg-[#1693BB]"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="h-[45px] md:h-[50px] w-[45px] md:w-[50px] rounded-full bg-[#1BA9D8] hover:bg-[#1693BB]"
                >
                  <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => handleSort('priorityLevel')}>
                  Priority (High/Low)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSort('submissionDate')}>
                  Date (Newest/Oldest)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleSort('customerName')}>
                  Customer Name (A-Z/Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">Ticket ID</th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">Customer Name</th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">Submission Date</th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">Issue Type</th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">Priority Level</th>
                  <th className="px-4 md:px-6 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      Loading tickets...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : sortedAndFilteredTickets.length > 0 ? (
                  sortedAndFilteredTickets.map((ticket, index) => (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(ticket._id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 md:px-6 py-4 font-medium">{ticket.id}</td>
                      <td className="px-4 md:px-6 py-4">{ticket.customerName}</td>
                      <td className="px-4 md:px-6 py-4 text-gray-600">{ticket.submissionDate}</td>
                      <td className="px-4 md:px-6 py-4 font-medium">{ticket.issueType}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`font-semibold ${
                            ticket.priorityLevel === 'High' ? 'text-red-600' : ticket.priorityLevel === 'Medium' ? 'text-orange-500' : 'text-yellow-500'
                          }`}
                        >
                          {ticket.priorityLevel}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className={`font-semibold h-auto py-1 px-2 rounded-md ${
                                ticket.status === 'RESOLVED' ? 'text-green-600 bg-green-100' :
                                ticket.status === 'OPEN' ? 'text-blue-500 bg-blue-100' :
                                ticket.status === 'IN_PROGRESS' ? 'text-orange-500 bg-orange-100' :
                                ticket.status === 'CLOSED' ? 'text-gray-600 bg-gray-100' :
                                'text-gray-500 bg-gray-100' // Default fallback
                              }`} 
                              onClick={(e) => e.stopPropagation()} // Prevent row click
                            >
                              {ticket.status}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleStatusChangeRequest(ticket._id, 'OPEN')}>
                              OPEN
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChangeRequest(ticket._id, 'RESOLVED')}>
                              RESOLVED
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChangeRequest(ticket._id, 'IN_PROGRESS')}>
                              IN_PROGRESS
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChangeRequest(ticket._id, 'CLOSED')}>
                              CLOSED
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No matching tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Change Confirmation Dialog */}
        <Dialog open={!!statusChangeInfo} onOpenChange={() => setStatusChangeInfo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Status Change</DialogTitle>
              <DialogDescription>
                Are you sure you want to change the status to{' '}
                <span className="font-semibold">{statusChangeInfo?.newStatus}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusChangeInfo(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmStatusChange}>Yes, Change Status</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </motion.div>
    </AdminLayout>
  );
}

export default Support;
