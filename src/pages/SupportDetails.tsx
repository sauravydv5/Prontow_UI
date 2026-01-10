import { AdminLayout } from "@/components/AdminLayout";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import customer from "/src/images/support-detail.png";
import { getAllTickets, getMessages, sendMessage } from "@/adminApi/supportApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  _id: string;
  user: {
    _id: string;
    email: string;
    phone?: string;
    name?: string;
  };
  subject: string;
  issueType: string;
  description: string;
  status: string;
}

interface Message {
  _id: string;
  senderRole: "USER" | "ADMIN";
  content?: string;
  attachments?: string[];
  createdAt: string;
}

export default function SupportDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ticketId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allTicketsResponse = await getAllTickets();
        const currentTicket = allTicketsResponse.data.data.find(
          (t: Ticket) => t._id === ticketId
        );

        if (!currentTicket) {
          setError("Ticket not found.");
          return;
        }
        setTicket(currentTicket);

        const messagesResponse = await getMessages(ticketId);
        const messagesData = Array.isArray(messagesResponse.data.data)
          ? messagesResponse.data.data
          : [messagesResponse.data.data];
        setMessages(messagesData);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load ticket details or messages.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ticketId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // NOTE: Removed the effect that revoked previewUrl on every previewUrl change,
  // because that earlier caused the preview to disappear immediately.
  // We will revoke URLs explicitly when a file is removed or after sending.

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !ticketId) return;

    try {
      setIsSending(true);
      const formData = new FormData();

      if (newMessage.trim()) {
        formData.append("message", newMessage.trim());
      }

      if (selectedFile) {
        formData.append("attachment", selectedFile);
      }

      const response = await sendMessage(ticketId, formData);

      let pushedMessage: Message | null = null;
      if (response?.data?.data) { 
        pushedMessage = response.data.data;
        if (selectedFile && previewUrl && pushedMessage.attachments && pushedMessage.attachments.length > 0) {
          pushedMessage.attachments[0] = previewUrl;
        }
      }
      
      if (!pushedMessage) {
        pushedMessage = { _id: `local-${Date.now()}`, senderRole: "ADMIN", content: newMessage.trim() || "", attachments: selectedFile ? [previewUrl ?? ""] : [], createdAt: new Date().toISOString() };
      }

      setMessages((prevMessages) => [...prevMessages, pushedMessage as Message]);
      setNewMessage("");
      setSelectedFile(null);
      setPreviewUrl(null);

      toast.success("Message sent successfully!");
    } catch (error: any) {
      console.error("Failed to send message:", error);
      const errorMsg =
        error?.response?.data?.message || "Error sending message. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      setSelectedFile(file);

      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <CheckCircle2 className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  //use blob for preview and full url for server images
  const getFullImageUrl = (path: string) => {
    if (!path) return "";

    if (path.startsWith("data:") || path.startsWith("blob:")) return path;

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `http://localhost:8000${cleanPath}`;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center h-[70vh]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-[#119D82] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-100 border-b-[#0e866f] rounded-full animate-spin animation-delay-150"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Error">
        <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" />
          <div className="text-center text-red-500 text-lg font-medium">{error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Supports > ${ticket?.user?.email || "Customer"}`}>
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-slide-in-left { animation: slideInLeft 0.5s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.5s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        .message-appear { animation: fadeInUp 0.4s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #119D82; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0e866f; }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255,255,255,0.9); }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .typing-indicator { animation: pulse 1.4s ease-in-out infinite; }
        .attachment-image { display: block; width: 100%; max-width: 280px; height: auto; border-radius: 12px; margin-top: 8px; }
      `}</style>

      <Button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gradient-to-r from-[#119D82] to-[#0e866f] hover:from-[#0e866f] hover:to-[#0c7461] text-white px-6 h-11 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE - Customer Info & Ticket Details */}
        <div className="flex flex-col gap-6 animate-slide-in-left">
          {/* Customer Card */}
          <div className="bg-gradient-to-br from-[#CFDA9C] via-[#d4de9f] to-[#dae6a8] p-6 rounded-2xl shadow-lg hover-lift border border-[#c5d192]">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={customer}
                  alt="Customer"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{ticket?.user?.name || "Customer"}</h3>
                <p className="text-lg font-bold text-gray-700 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {ticket?.user?.email}
                </p>
              </div>
            </div>

            {ticket?.user?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-lg p-3">
                <Phone className="w-4 h-4 text-[#119D82]" />
                <span>{ticket.user.phone}</span>
              </div>
            )}
          </div>

          {/* Ticket Details Card */}
          <div className="bg-gradient-to-br from-white via-gray-50 to-white p-6 rounded-2xl shadow-lg hover-lift border-2 border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#119D82]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#CFDA9C]/20 to-transparent rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 pb-3 border-b-2 border-[#119D82]/20">
                <div className="w-8 h-8 bg-gradient-to-br from-[#119D82] to-[#0e866f] rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                Ticket Details
              </h3>

              <div className="space-y-5">
                {/* Status */}
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Status</label>
                  <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 ${getStatusColor(ticket?.status || "")}`}>
                    {getStatusIcon(ticket?.status || "")}
                    <span className="font-bold text-sm capitalize">{ticket?.status}</span>
                  </div>
                </div>

                {/* Subject */}
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Subject</label>
                  <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border-l-4 border-[#119D82] shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-800 font-semibold">{ticket?.subject}</p>
                  </div>
                </div>

                {/* Issue Type */}
                <div className="group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Issue Type</label>
                  <div className="bg-gradient-to-r from-[#CFDA9C]/20 to-white p-4 rounded-xl border-l-4 border-[#CFDA9C] shadow-sm hover:shadow-md transition-all duration-300">
                    <p className="text-gray-800 font-semibold capitalize flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#119D82] rounded-full animate-pulse"></span>
                      {ticket?.issueType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - CHAT SECTION */}
        <div className="lg:col-span-2 animate-slide-in-right">
          <div className="bg-gradient-to-br from-[#F5F8FA] to-[#EEF2F6] rounded-2xl p-6 shadow-xl border border-gray-200 h-[75vh] flex flex-col">
            {/* Chat Header */}
            <div className="mb-4 pb-4 border-b border-gray-300">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                Live Conversation
              </h3>
              <p className="text-sm text-gray-500 mt-1">{messages.length} messages</p>
            </div>

            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar mb-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={msg._id}
                    className={`flex gap-3 items-start message-appear ${msg.senderRole === "ADMIN" ? "justify-end" : ""}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {msg.senderRole === "USER" && (
                      <img src={customer} alt="user" className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white flex-shrink-0" />
                    )}

                    <div className={`group relative max-w-[75%]`}>
                      <div
                        className={`
                          text-sm p-4 shadow-md hover:shadow-lg transition-all duration-300
                          ${msg.senderRole === "ADMIN"
                            ? "bg-gradient-to-br from-[#119D82] to-[#0e866f] text-white rounded-t-2xl rounded-bl-2xl rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-200 rounded-t-2xl rounded-br-2xl rounded-bl-md"
                          }
                        `}
                      >
                        {/* Text content */}
                        {msg.content && (
                          <div className="whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </div>
                        )}

                        {/* Attachments rendering */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={`${msg.content ? "mt-3 pt-3 border-t " + (msg.senderRole === "ADMIN" ? "border-white/20" : "border-gray-200") : ""}`}>
                            {msg.attachments.map((attachment, idx) => {
                              // Determine if the attachment is a local preview (blob) or a server path
                              const isLocalPreview = attachment.startsWith("blob:");
                              const isLikelyImage = isLocalPreview || /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                              const imageUrl = isLocalPreview ? attachment : getFullImageUrl(attachment);

                              if (isLikelyImage) {
                                return (
                                  <div key={idx} className="relative group/image">
                                    <img
                                      src={imageUrl}
                                      alt="Attachment"
                                      className={`
                                        w-full max-w-[280px] h-auto rounded-xl cursor-pointer
                                        transition-all duration-300 hover:scale-[1.02]
                                        ${msg.senderRole === "ADMIN" ? "border-2 border-white/30" : "border-2 border-gray-200"}
                                      `}
                                      style={{
                                        maxHeight: "320px",
                                        objectFit: "cover",
                                      }}
                                      onClick={() => window.open(imageUrl, "_blank")}
                                      onError={(e) => {
                                        console.error("Image load error:", imageUrl);
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        const parent = target.parentElement;
                                        if (parent) {
                                          parent.innerHTML = `
                                            <a href="${imageUrl}" target="_blank" class="flex items-center gap-2 text-sm ${msg.senderRole === 'ADMIN' ? 'text-blue-200' : 'text-blue-600'} underline hover:opacity-80">
                                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                                              </svg>
                                              View Attachment
                                            </a>
                                          `;
                                        }
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 rounded-xl transition-all duration-300 flex items-center justify-center pointer-events-none">
                                      <span className="opacity-0 group-hover/image:opacity-100 text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full transition-opacity">
                                        Click to enlarge
                                      </span>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <a
                                    key={idx}
                                    href={imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`
                                      flex items-center gap-2 text-sm underline hover:opacity-80 transition-opacity
                                      ${msg.senderRole === "ADMIN" ? "text-blue-200" : "text-blue-600"}
                                    `}
                                  >
                                    <Paperclip className="w-4 h-4" />
                                    <span>View Attachment</span>
                                  </a>
                                );
                              }
                            })}
                          </div>
                        )}
                      </div>
                      <span className={`text-xs text-gray-400 mt-1 block ${msg.senderRole === "ADMIN" ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {msg.senderRole === "ADMIN" && (
                      <img src={customer} alt="admin" className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center animate-scale-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#119D82] to-[#0e866f] rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <Send className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                  <p className="text-gray-400 text-sm mt-2">Start the conversation and provide support!</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200">
              {selectedFile && previewUrl && (
                <div className="relative inline-block mb-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
                  <img src={previewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
                  <button
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 max-w-[80px] truncate">{selectedFile?.name}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 w-12 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-[#119D82]"
                  disabled={isSending}
                >
                  <Paperclip className="w-6 h-6" />
                </Button>
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
                  disabled={isSending}
                  className="flex-grow border-0 focus-visible:ring-2 focus-visible:ring-[#119D82] rounded-lg h-12 text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || (!newMessage.trim() && !selectedFile)}
                  className="bg-gradient-to-r from-[#119D82] to-[#0e866f] hover:from-[#0e866f] hover:to-[#0c7461] text-white h-12 w-12 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
