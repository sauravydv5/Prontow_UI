import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Trash2, Search, Percent, Gift, DollarSign, PlusCircle, X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { deleteSpinWheel, getSpinWheelList, getSpinWheelRecords, spinTheWheel, updateSpinWheel } from "@/adminApi/spinWheelApi";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AddWheelPayload = Omit<Wheel, '_id' | 'createdAt'>;

interface Section {
  _id: string;
  title: string;
  type: 'token' | 'cash';
  value: number;
  color: string;
  probability: number;
}

interface Wheel {
  _id: string;
  name: string;
  sections: Section[];
  isActive: boolean;
  createdAt: string;
}

interface SpinRecord {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  spinWheel: {
    _id: string;
    name: string;
  } | null;
  winningSection: {
    title: string;
    type: 'token' | 'cash';
    value: number;
  };
  createdAt: string;
}

function SpinTheWheel() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [spinRecords, setSpinRecords] = useState<SpinRecord[]>([]);
  const [editingWheel, setEditingWheel] = useState<Wheel | null>(null);
  const [deletingWheelId, setDeletingWheelId] = useState<string | null>(null);
  const [viewingWheel, setViewingWheel] = useState<Wheel | null>(null);
  const [isLoading, setIsLoading] = useState({ wheels: true, records: true });
  const [error, setError] = useState({ wheels: null, records: null });
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelFilter, setWheelFilter] = useState("All Wheels");
  const [dateFilter, setDateFilter] = useState("All");

  const fetchWheels = async () => {
    try {
      setIsLoading(prev => ({ ...prev, wheels: true }));
      const response = await getSpinWheelList();
      if (response.data && response.data.status) {
        setWheels(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch wheels");
      }
      setError(prev => ({ ...prev, wheels: null }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred";
      setError(prev => ({ ...prev, wheels: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setIsLoading(prev => ({ ...prev, wheels: false }));
    }
  };

  const fetchSpinRecords = async () => {
    try {
      setIsLoading(prev => ({ ...prev, records: true }));
      const response = await getSpinWheelRecords();
      if (response.data && response.data.status) {
        setSpinRecords(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch spin records");
      }
      setError(prev => ({ ...prev, records: null }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred";
      setError(prev => ({ ...prev, records: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setIsLoading(prev => ({ ...prev, records: false }));
    }
  };

  useEffect(() => {
    fetchWheels();
    fetchSpinRecords();
  }, []);

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-");
    const months = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    return new Date(2000 + parseInt(year), months[month], parseInt(day));
  };

  const filteredWheelData = wheels.filter((wheel) => {
    const s = search.toLowerCase();
    const createdDate = new Date(wheel.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: '2-digit'
    }).replace(/ /g, '-');

    return (
      wheel._id.toLowerCase().includes(s) ||
      wheel.name.toLowerCase().includes(s) ||
      wheel.sections.length.toString().includes(s) ||
      (wheel.isActive ? 'active' : 'inactive').includes(s) ||
      createdDate.toLowerCase().includes(s)
    );
  });

  const filteredSpinRecords = spinRecords.filter((record) => {
    const spinDate = new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const s = search.toLowerCase();

    const matchesSearch =
      record.user._id.toLowerCase().includes(s) ||
      (record.user.name || '').toLowerCase().includes(s) ||
      (record.user.email || '').toLowerCase().includes(s) ||
      (record.spinWheel?.name || 'N/A').toLowerCase().includes(s) ||
      record.winningSection.title.toLowerCase().includes(s) ||
      record.winningSection.type.toLowerCase().includes(s) ||
      record.winningSection.value.toString().toLowerCase().includes(s) ||
      spinDate.toLowerCase().includes(s);

    const matchesWheel =
      wheelFilter === "All Wheels" ||
      record.spinWheel?.name === wheelFilter;

    const today = new Date();
    const recordDate = new Date(record.createdAt);

    let matchesDate = true;
    today.setHours(0, 0, 0, 0);
    recordDate.setHours(0, 0, 0, 0);

    if (dateFilter === "Last 7 Days") {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      matchesDate = recordDate >= last7;
    }

    if (dateFilter === "Last 30 Days") {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      matchesDate = recordDate >= last30;
    }

    return matchesSearch && matchesWheel && matchesDate;
  });

  const handleView = (wheel: Wheel) => {
    setViewingWheel(wheel);
  };

  const handleDeleteClick = (wheelId: string) => {
    setDeletingWheelId(wheelId);
  };

  const handleEdit = (wheel: Wheel) => {
    setEditingWheel(JSON.parse(JSON.stringify(wheel)));
  };

  const handleTestSpin = async () => {
    if (!viewingWheel) return;

    setIsSpinning(true);
    const toastId = toast.loading(`Spinning the ${viewingWheel.name}...`);

    try {
      const response = await spinTheWheel(viewingWheel._id, { tokensToUse: 1 });
      console.log("Full Spin response:", response);
      console.log("Response data:", response.data);
      
      if (response.data && response.data.status) {
        const segment = response.data.data?.segment || response.data.segment || response.data.data;
        const segmentTitle = segment?.title || "Unknown Reward";
        
        toast.success(`🎉 You won: ${segmentTitle}!`, { id: toastId });
        fetchSpinRecords(); 
      } else {
        throw new Error(response.data?.message || "Spin failed");
      }
    } catch (err: any) {
      console.error("Spin error:", err);
      console.error("Error response:", err.response);
      const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred during spin";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsSpinning(false);
    }
  };

  const handleUpdateWheel = async () => {
    if (!editingWheel) return;

    const toastId = toast.loading("Updating wheel...");
    try {
      // If activating this wheel, find and deactivate any other active wheel first.
      if (editingWheel.isActive) {
        const currentlyActiveWheel = wheels.find(w => w.isActive && w._id !== editingWheel._id);
        if (currentlyActiveWheel) {
          toast.info(`Deactivating previously active wheel: ${currentlyActiveWheel.name}`);
          const deactivatePayload = { name: currentlyActiveWheel.name, sections: currentlyActiveWheel.sections, isActive: false };
          await updateSpinWheel(currentlyActiveWheel._id, deactivatePayload);
        }
      }

      const payload: AddWheelPayload = {
        name: editingWheel.name,
        isActive: editingWheel.isActive,
        // @ts-ignore
        sections: editingWheel.sections.map(({ title, type, value, color, probability }) => ({
          title, type, value, color, probability
        })),
      };

      const response = await updateSpinWheel(editingWheel._id, payload);

      if (response.data && response.data.status) {
        toast.success("Wheel updated successfully!", { id: toastId });
        // Optimistically update the UI for instant feedback
        setWheels(prevWheels => 
          prevWheels.map(w => 
            w._id === editingWheel._id ? { ...w, ...payload } : w
          )
        );
        setEditingWheel(null);
        fetchWheels(); // Still refetch in the background to ensure data consistency
      } else {
        throw new Error(response.data?.message || "Failed to update wheel");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred";
      toast.error(errorMsg, { id: toastId });
    }
  };

  const handleSectionChange = (index: number, field: string, value: string | number) => {
    if (!editingWheel) return;
    const updatedSections = [...editingWheel.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setEditingWheel({ ...editingWheel, sections: updatedSections });
  };

  const addSection = () => {
    if (!editingWheel) return;
    const newSection = {
      _id: `new-${Date.now()}`, // Temporary ID
      title: "New Section",
      type: "token",
      value: 0,
      color: "#cccccc",
      probability: 0,
    };
    // @ts-ignore
    setEditingWheel({ ...editingWheel, sections: [...editingWheel.sections, newSection] });
  };

  const removeSection = (index: number) => {
    if (!editingWheel) return;
    const updatedSections = editingWheel.sections.filter((_, i) => i !== index);
    setEditingWheel({ ...editingWheel, sections: updatedSections });
  };

  const handleConfirmDelete = async () => {
    if (!deletingWheelId) return;

    const toastId = toast.loading("Deleting wheel...");
    try {
      const response = await deleteSpinWheel(deletingWheelId);
      if (response.data && response.data.status) {
        toast.success("Wheel deleted successfully!", { id: toastId });
        setDeletingWheelId(null);
        fetchWheels();
      } else {
        throw new Error(response.data?.message || "Failed to delete wheel");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unknown error occurred";
      toast.error(errorMsg, { id: toastId });
    }
  };

  return (
    <AdminLayout title="Games > Spin the wheel">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 md:p-6 space-y-8 bg-[#F9FAF8] min-h-screen"
      >

        {/* Header */}
        <div className="flex flex-col sm:flex-row md:flex-nowrap items-start sm:items-center justify-between gap-4">

          <Button
            className="bg-[#119D82] hover:bg-[#0E8B70] text-white rounded-full px-6 py-2 text-sm font-medium w-full sm:w-auto"
            onClick={() => navigate("/games/spin-the-wheel/create-new-wheel")}
          >
            Create New Wheel
          </Button>

          {/* Search */}
          <div className="flex items-end justify-end gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-[#707070] h-4 w-4" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#E6EAC3] rounded-full border-none text-[#4A4A4A] placeholder:text-[#707070] focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Wheel Table */}
        <motion.div className="overflow-x-auto rounded-lg shadow-sm border border-[#E8E8E8]">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-[#E8E8C6] text-gray-700 text-left">
                <TableHead>Wheel ID</TableHead>
                <TableHead>Wheel Name</TableHead>
                <TableHead>Total Segments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading.wheels ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">Loading wheels...</TableCell>
                </TableRow>
              ) : error.wheels ? (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-red-500">{error.wheels}</TableCell>
                </TableRow>
              ) : filteredWheelData.length > 0 ? (
                filteredWheelData.map((wheel) => (
                  <TableRow key={wheel._id} className="bg-white hover:bg-gray-50">
                    <TableCell>#{wheel._id.slice(-6)}</TableCell>
                    <TableCell>{wheel.name}</TableCell>
                    <TableCell>{wheel.sections.length}</TableCell>
                    <TableCell className={`font-semibold ${wheel.isActive ? 'text-[#119D82]' : 'text-red-500'}`}>
                      {wheel.isActive ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>
                      {new Date(wheel.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-4 whitespace-nowrap">
                        <button onClick={() => handleView(wheel)} className="text-[#119D82] hover:underline text-sm font-medium">View</button>
                        <button onClick={() => handleEdit(wheel)} className="text-[#119D82] hover:underline text-sm font-medium">Edit</button>
                        <Trash2 onClick={() => handleDeleteClick(wheel._id)} className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-600" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">No wheels found.</TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </motion.div>

        {/* Spin Records */}
        <motion.div className="bg-white rounded-lg shadow-sm p-5 border border-[#E8E8E8] space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <h3 className="text-[18px] font-semibold text-[#1C1C1C]">
              User Spin Record
            </h3>

             {/* <div className="flex flex-wrap gap-3"> */}

              {/* Wheel Filter */}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full bg-[#E6EAC3] text-[#4A4A4A]">
                    {wheelFilter}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setWheelFilter("All Wheels")}>
                    All Wheels
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setWheelFilter("Diwali Wheel")}>
                    Diwali Wheel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setWheelFilter("New Year Wheel")}>
                    New Year Wheel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}

              {/* Date Range Filter */}
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full bg-[#E6EAC3] text-[#4A4A4A]">
                    {dateFilter === "All" ? "Date Range" : dateFilter}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDateFilter("All")}>
                    All Dates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("Last 7 Days")}>
                    Last 7 Days
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateFilter("Last 30 Days")}>
                    Last 30 Days
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}

            {/* </div> */}
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="bg-[#E6EAC3]">
                  <TableHead>User ID</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Wheel Name</TableHead>
                  <TableHead>Segment Won</TableHead>
                  <TableHead>Reward Type</TableHead>
                  <TableHead>Reward Value</TableHead>
                  <TableHead>Spin Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading.records ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">Loading records...</TableCell>
                  </TableRow>
                ) : error.records ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-red-500">{error.records}</TableCell>
                  </TableRow>
                ) : filteredSpinRecords.length > 0 ? (
                  filteredSpinRecords.map((record) => (
                    <TableRow key={record._id} className="bg-white hover:bg-gray-50">
                      <TableCell>#{record.user._id.slice(-6)}</TableCell>
                      <TableCell>{record.user.name || record.user.email || 'N/A'}</TableCell>
                      <TableCell>{record.spinWheel?.name || 'N/A'}</TableCell>
                      <TableCell>{record.winningSection.title}</TableCell>
                      <TableCell className="capitalize">{record.winningSection.type}</TableCell>
                      <TableCell>{record.winningSection.type === 'cash' ? `₹${record.winningSection.value}` : record.winningSection.value}</TableCell>
                      <TableCell>
                        {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-[#119D82] font-semibold">
                        Claimed
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">No spin records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </div>
        </motion.div>

        {/* View Details Dialog */}
        <Dialog open={!!viewingWheel} onOpenChange={() => setViewingWheel(null)}>
          <DialogContent className="w-full max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingWheel?.name}</DialogTitle>
              <DialogDescription>
                Wheel ID: #{viewingWheel?._id.slice(-6)}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 text-sm">
                <div><p className="text-muted-foreground">Status</p><p className={`font-medium ${viewingWheel?.isActive ? 'text-green-600' : 'text-red-600'}`}>{viewingWheel?.isActive ? "Active" : "Inactive"}</p></div>
                <div><p className="text-muted-foreground">Total Segments</p><p className="font-medium">{viewingWheel?.sections?.length}</p></div>
                <div><p className="text-muted-foreground">Created At</p><p className="font-medium">{viewingWheel ? new Date(viewingWheel.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</p></div>
              </div>

              <h3 className="font-semibold mt-4 mb-2 border-t pt-4">Sections</h3>
              <div className="space-y-3">
                {viewingWheel?.sections?.map(section => (
                  <div key={section._id} className="flex items-center gap-4 p-3 rounded-lg border" style={{ borderLeftColor: section.color, borderLeftWidth: '4px' }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${section.color}20` }}>
                      {section.type === 'cash' ? <DollarSign className="w-5 h-5" style={{ color: section.color }} /> : <Gift className="w-5 h-5" style={{ color: section.color }} />}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{section.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: <span className="font-semibold capitalize">{section.type}</span> | Value: <span className="font-semibold">{section.value}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm flex items-center gap-1" style={{ color: section.color }}>
                        {section.probability}<Percent className="w-3 h-3" />
                      </p>
                      <p className="text-xs text-muted-foreground">Probability</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingWheel(null)}>Close</Button>
              <Button onClick={handleTestSpin} disabled={isSpinning} className="bg-[#119D82] hover:bg-[#0E8B70]">
                {isSpinning ? "Spinning..." : "Test Spin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Wheel Dialog */}
        <Dialog open={!!editingWheel} onOpenChange={() => setEditingWheel(null)}>
          <DialogContent className="w-full max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Wheel: {editingWheel?.name}</DialogTitle>
              <DialogDescription>
                Update the wheel details and sections below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {editingWheel && (
              <div className="max-h-[70vh] overflow-y-auto p-1 pr-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor="wheelName">Wheel Name</Label>
                    <Input
                      id="wheelName"
                      value={editingWheel.name}
                      onChange={(e) => setEditingWheel({ ...editingWheel, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={editingWheel.isActive}
                      onCheckedChange={(checked) => setEditingWheel({ ...editingWheel, isActive: checked })}
                    />
                    <Label htmlFor="isActive" className={`font-medium ${editingWheel.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {editingWheel.isActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>

                <h3 className="font-semibold mt-4 mb-2 border-t pt-4">Sections</h3>
                <div className="space-y-3">
                  {editingWheel.sections.map((section, index) => (
                    <div key={section._id || index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-2 border rounded-md">
                      <Input className="md:col-span-3" placeholder="Title" value={section.title} onChange={(e) => handleSectionChange(index, 'title', e.target.value)} />
                      <Select value={section.type} onValueChange={(value) => handleSectionChange(index, 'type', value)}>
                        <SelectTrigger className="md:col-span-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="token">Token</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input className="md:col-span-2" type="number" placeholder="Value" value={section.value} onChange={(e) => handleSectionChange(index, 'value', Number(e.target.value))} />
                      <Input className="md:col-span-2" type="number" placeholder="Probability" value={section.probability} onChange={(e) => handleSectionChange(index, 'probability', Number(e.target.value))} />
                      <div className="md:col-span-2 flex items-center gap-2">
                        <Input type="color" value={section.color} onChange={(e) => handleSectionChange(index, 'color', e.target.value)} className="p-1 h-10" />
                        <span className="text-sm truncate">{section.color}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSection(index)} className="text-red-500 hover:text-red-600 md:col-span-1">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" onClick={addSection} className="mt-2">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Section
                </Button>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingWheel(null)}>Cancel</Button>
              <Button onClick={handleUpdateWheel} className="bg-[#119D82] hover:bg-[#0E8B70]">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingWheelId} onOpenChange={() => setDeletingWheelId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the spin wheel
                and all associated data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingWheelId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Yes, delete it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AdminLayout>
  );
}

export default SpinTheWheel;
