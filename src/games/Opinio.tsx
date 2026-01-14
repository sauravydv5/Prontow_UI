import { useState, useEffect } from "react";
import { RotateCw, Plus } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMatches, refreshMatches, getOpinioRecords, updateMatchStatus } from "@/adminApi/opinioApi";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toast } from "sonner";

interface Match {
  _id: string;
  name: string;
  status: string;
  matchType: string;
  teams: string[];
  venue?: string;
  date: string;
  dateTimeGMT?: string;
  apiMatchId?: string;
  isLive?: boolean;
}

interface OpinioRecord {
  _id: string;
  customerName: string;
  matchName: string;
  question: string;
  selectedOption: string;
  investedAmount: number;
  result: "YES" | "NO" | "PENDING" | "Correct";
  timestamp: string;
}

function Opinio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [statusUpdateInfo, setStatusUpdateInfo] = useState<{ matchId: string; makeLive: boolean } | null>(null);

  const {
    data: matchesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["opinioMatches"],
    queryFn: getMatches,
    staleTime: 5 * 60 * 1000, 
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateMatchStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opinioMatches"] });
      toast.success("Match status updated successfully!");
    },
    onError: (error: any) => {
      console.error("Failed to update status:", error);
      toast.error(error.response?.data?.message || "Failed to update match status.");
    },
  });

  // const { data: recordsData, isLoading: isRecordsLoading } = useQuery(
  //   {
  //     queryKey: ["opinioRecords"],
  //     queryFn: getOpinioRecords,
  //     staleTime: 5 * 60 * 1000,
  //     refetchOnWindowFocus: false,
  //   }
  // );

  // useEffect(() => {
  //   queryClient.prefetchQuery({ queryKey: ['opinioRecords'], queryFn: getOpinioRecords });
  // }, [queryClient]);

  const allMatches: Match[] = Array.isArray(matchesData?.data?.data)
    ? matchesData.data.data
    : [];

  // Using static data for records as requested
  const isRecordsLoading = false;
  const records: OpinioRecord[] = [
    {
      _id: "rec1",
      customerName: "Ravi Kumar",
      matchName: "India vs Australia",
      question: "Will India win the T20 match?",
      selectedOption: "YES",
      investedAmount: 150,
      result: "PENDING",
      timestamp: "2025-11-30T10:30:00.000Z",
    },
  ];

  const displayedMatches = showAllMatches
    ? allMatches
    : allMatches.slice(0, 10);

  const isMatchLive = (status: string) => {
    return (
      status?.toLowerCase().includes("live") ||
      status?.toLowerCase().includes("innings break") ||
      status?.toLowerCase().includes("opt to") ||
      status?.toLowerCase().includes("need")
    );
  };

  const handleConfirmStatusUpdate = () => {
    if (statusUpdateInfo) {
      updateStatusMutation.mutate(statusUpdateInfo);
      setStatusUpdateInfo(null);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoadingRefresh(true);
      queryClient.invalidateQueries({ queryKey: ["opinioMatches"] });
      queryClient.invalidateQueries({ queryKey: ["opinioRecords"] });

      refreshMatches();

      toast.success("Matches refreshed successfully!");
    } catch (err) {
      console.error("Refresh failed:", err);
      toast.error("Failed to refresh matches.");
    } finally {
      setLoadingRefresh(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <AdminLayout title="Games > Opinio">
      <Dialog open={!!statusUpdateInfo} onOpenChange={() => setStatusUpdateInfo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this manual match's status to "{statusUpdateInfo?.makeLive ? 'Live' : 'Not Live'}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateInfo(null)}>Cancel</Button>
            <Button className="bg-[#119D82] hover:bg-[#0d7d68]" onClick={handleConfirmStatusUpdate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Row */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1D]">
            Available Matches ({allMatches.length})
          </h2>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/games/create-match")}
              className="bg-[#119D82] hover:bg-[#0d7d68] text-white text-xs sm:text-sm px-3 sm:px-4 h-9"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Create Match
            </Button>

            {/* Refresh Button Right Side */}
            <button
              onClick={handleRefresh}
              disabled={loadingRefresh}
              className="
                w-8 h-8 
                flex items-center justify-center 
                rounded-full 
                bg-[#E8E8C6] 
                hover:bg-[#119D82] 
                hover:text-white 
                transition-all
              "
            >
              <RotateCw
                className={`w-4 h-4 ${
                  loadingRefresh ? "animate-spin" : ""
                }`}
              />
            </button>

            {/* View All Button */}
            <button
              onClick={() => setShowAllMatches(!showAllMatches)}
              className="text-[#119D82] text-xs sm:text-sm font-semibold hover:underline transition-colors"
            >
              {showAllMatches ? "Show Less" : `View All (${allMatches.length})`}
            </button>
          </div>
        </div>

        {/* Match Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="
            grid 
            grid-cols-1 
            xs:grid-cols-2
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-5 
            gap-3 sm:gap-4 md:gap-5
          "
        >
          {isLoading &&
            Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded-lg min-h-[120px] animate-pulse"
                ></div>
              ))}

          {error && (
            <div className="col-span-full text-center text-red-500 py-8">
              Failed to load matches. Please try again.
            </div>
          )}

          {!isLoading && !error && allMatches.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              No matches available at the moment.
            </div>
          )}

          <AnimatePresence>
            {!isLoading &&
              !error &&
              displayedMatches.map((match) => {
                let isLive = match.isLive || isMatchLive(match.status);
                return (
                  <motion.div
                    key={match._id}
                    variants={itemVariants}
                    layout
                    onClick={() =>
                      navigate(`/games/opinio/ask-question/${match._id}`)
                    }
                    className="
                      relative
                      bg-[#E9FDEA]
                      rounded-lg 
                      shadow-md 
                      hover:shadow-lg
                      border border-white-200
                      p-4
                      min-h-[120px]
                      transition-all
                      hover:scale-105
                      cursor-pointer
                      flex
                      flex-col
                      gap-2
                    "
                  >
                    {isLive && (
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-red-500 text-[10px] sm:text-xs font-bold">
                          LIVE
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1D1D1D] text-sm sm:text-base mb-2 pr-12">
                        {match.name}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="bg-[#E8E8C6] px-2 py-0.5 rounded-full font-medium">
                          {match.matchType?.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                        {match.status}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 border-t pt-2">
                      <span className="truncate">
                        {match.venue?.split(",")[0] || "Venue TBA"}
                      </span>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center ml-2"
                      >
                        <Switch
                          checked={isLive}
                          disabled={isLive}
                          onCheckedChange={(checked) => {
                            if (checked && match.dateTimeGMT && new Date() < new Date(match.dateTimeGMT)) {
                              toast.info("This match will start later.");
                              return;
                            }

                            if (match.apiMatchId?.startsWith("MANUAL_")) {
                              setStatusUpdateInfo({ matchId: match._id, makeLive: checked });
                            } else {
                              updateStatusMutation.mutate({ matchId: match._id, makeLive: checked });
                            }
                          }}
                          className="data-[state=checked]:bg-red-500 h-5 w-9"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>

        {/* USER OPINIO RECORD (rest same) */}
        {/* ===== NO CHANGE BELOW THIS POINT ===== */}

        <motion.div
          layout
          className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 border border-gray-200 mt-8"
        >
          <div
            className="
              flex 
              flex-col 
              sm:flex-row 
              items-start 
              sm:items-center 
              justify-between 
              gap-3 sm:gap-4 
              mb-4 sm:mb-5
            "
          >
            <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1D]">
              User Opinio Record
            </h3>

            {/* <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="
                  bg-[#E8E8C6] 
                  text-[#1D1D1D] 
                  hover:bg-[#119D82] 
                  hover:text-white
                  text-xs sm:text-sm 
                  flex items-center justify-center
                  gap-2 
                  border-none 
                  shadow-sm
                  w-full xs:w-auto
                  h-9 sm:h-10
                "
              >
                Filter by Match <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>

              <Button
                variant="outline"
                className="
                  bg-[#E8E8C6] 
                  text-[#1D1D1D] 
                  hover:bg-[#119D82] 
                  hover:text-white
                  text-xs sm:text-sm 
                  flex items-center justify-center
                  gap-2 
                  border-none 
                  shadow-sm
                  w-full xs:w-auto
                  h-9 sm:h-10
                "
              >
                Date Range <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div> */}
          </div>

          <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#E8E8C6] text-[#1D1D1D]">
                <tr>
                  <th className="px-4 py-3 font-semibold">User Name</th>
                  <th className="px-4 py-3 font-semibold">Match</th>
                  <th className="px-4 py-3 font-semibold">Poll Question</th>
                  <th className="px-4 py-3 font-semibold">Selected Option</th>
                  <th className="px-4 py-3 font-semibold">Invested</th>
                  <th className="px-4 py-3 font-semibold">Result</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th> {/* 7 headers */}
                </tr>
              </thead>

              <tbody>
                {isRecordsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-5/6"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded-full w-16"></div></td>
                      <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-4/5"></div></td>
                    </tr>
                  ))
                ) : (
                  <AnimatePresence>
                    {records.map((r) => (
                      <motion.tr
                        key={r._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b last:border-none hover:bg-[#F9F9F9] text-[#1D1D1D]"
                      >
                        <td className="px-4 py-3">{r.customerName || "N/A"}</td>
                        <td className="px-4 py-3">{r.matchName}</td>
                        <td className="px-4 py-3">{r.question}</td>
                        <td className="px-4 py-3">{r.selectedOption}</td>
                        <td className="px-4 py-3">₹{r.investedAmount}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              r.result === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {r.result}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(r.timestamp).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {isRecordsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg border border-gray-200 p-3 sm:p-4 space-y-3 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="w-1/2 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {records.map((r) => (
                  <motion.div
                    key={r._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-[#F9F9F9] rounded-lg border border-gray-200 p-3 sm:p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-gray-500">User</p>
                        <p className="text-sm font-semibold text-[#1D1D1D]">
                          {r.customerName || "N/A"}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ₹{r.investedAmount}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Match</p>
                        <p className="text-sm text-[#1D1D1D]">{r.matchName}</p>
                      </div> 
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Poll Question</p>
                      <p className="text-sm text-[#1D1D1D]">{r.question}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Selected Option</p>
                        <p className="text-sm text-[#1D1D1D] font-medium">{r.selectedOption}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Timestamp</p>
                        <p className="text-sm text-gray-600">
                          {new Date(r.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}

export default Opinio;
