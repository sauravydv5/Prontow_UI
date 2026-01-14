import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createOpinioEvent, getMatches } from "@/adminApi/opinioApi";

interface Match {
  _id: string;
  name: string;
}

function AskQuestion() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [yesPrice, setYesPrice] = useState("5");
  const [noPrice, setNoPrice] = useState("5");
  const [endTime, setEndTime] = useState("");

  const { data: matchesData, isLoading: isLoadingMatchName } = useQuery({
    queryKey: ["opinioMatches"],
    queryFn: getMatches,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const matchName =
    matchesData?.data?.data?.find((match: Match) => match._id === matchId)?.name ||
    "Loading name...";

  const createEventMutation = useMutation({
    mutationFn: createOpinioEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opinioEvents"] });
      toast.success("Event created successfully!");
      navigate("/games/opinio");
    },
    onError: (error: any) => {
      console.error("Failed to create event:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create event.";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!matchId) {
      toast.error("Match ID is missing.");
      return;
    }
    if (!question.trim()) {
      toast.error("Please enter a question.");
      return;
    }
    if (!endTime) {
      toast.error("Please select an end time.");
      return;
    }
    
    // Convert datetime-local to ISO string
    const endTimeISO = new Date(endTime).toISOString();
    
    createEventMutation.mutate({
      question: question.trim(),
      matchId: matchId,
      endTime: endTimeISO,
      yesPrice: parseFloat(yesPrice),
      noPrice: parseFloat(noPrice),
    });
  };

 return (
    <AdminLayout title="Games > Opinio > Ask Question">
      <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-10 py-8">
        {/* Content Wrapper */}
        <form
          className="w-full max-w-2xl"
          onSubmit={handleSubmit}
        >
          {/* Card Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-[#1D1D1D]">Create New Event</h2>
                <p className="text-sm text-gray-500 mt-1">Set up a new prediction market event</p>
              </div>

              {/* Match ID Display */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1D] mb-2">
                  Match ID
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  {isLoadingMatchName ? (
                    <span className="text-sm text-gray-500">Loading name...</span>
                  ) : (
                    <span className="text-sm font-semibold text-[#1D1D1D] flex-1">
                      {matchName}
                    </span>
                  )}
                </div>
              </div>

              {/* Question Input */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1D] mb-2">
                  Question *
                </label>
                <Input
                  placeholder="enter your question here"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="bg-[#F8F8F0] border border-gray-200 shadow-sm text-[#1D1D1D]
                placeholder:text-gray-400 h-[52px] rounded-lg focus:ring-2 focus:ring-[#199C78] 
                focus:border-transparent w-full transition-all"
                />
              </div>

              {/* Pricing Section */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-[#1D1D1D] mb-3">
                  Initial Pricing
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Yes Price
                    </label>
                    <Input
                      placeholder="5.0"
                      value={yesPrice}
                      onChange={(e) => setYesPrice(e.target.value)}
                      type="number"
                      step="0.1"
                      min="0"
                      className="bg-[#F8F8F0] border border-gray-200 shadow-sm text-[#1D1D1D] 
                      placeholder:text-gray-400 h-[52px] rounded-lg focus:ring-2 focus:ring-[#199C78] 
                      focus:border-transparent w-full transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      No Price
                    </label>
                    <Input
                      placeholder="5.0"
                      value={noPrice}
                      onChange={(e) => setNoPrice(e.target.value)}
                      type="number"
                      step="0.1"
                      min="0"
                      className="bg-[#F8F8F0] border border-gray-200 shadow-sm text-[#1D1D1D] 
                      placeholder:text-gray-400 h-[52px] rounded-lg focus:ring-2 focus:ring-[#199C78] 
                      focus:border-transparent w-full transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold text-[#1D1D1D] mb-2">
                  End Time *
                </label>
                <Input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()}
                  className="bg-[#F8F8F0] border border-gray-200 shadow-sm text-[#1D1D1D]
                placeholder:text-gray-400 h-[52px] rounded-lg focus:ring-2 focus:ring-[#199C78] 
                focus:border-transparent w-full transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Select when this event should close for predictions
                </p>
              </div>

              {/* Submit Button */}
              <div className="w-full pt-4">
                <Button
                  type="submit"
                  className="w-full h-[52px] bg-[#199C78] text-white rounded-lg font-semibold text-base
                  hover:bg-[#178C6C] active:scale-[0.98] transition-all shadow-md hover:shadow-lg
                  disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Creating Event...
                    </span>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AskQuestion;
