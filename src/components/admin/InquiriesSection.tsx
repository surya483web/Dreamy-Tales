import React, { useState, useEffect } from "react";
import { Mail, Phone, Calendar, User, MessageSquare, AlertCircle, RefreshCw, Check, Clock, Search } from "lucide-react";
import { Inquiry } from "../../types";
import { getInquiriesFromFirebase, updateInquiryStatusInFirebase } from "../../lib/firebase";

export const InquiriesSection: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "read">("all");

  const fetchInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      let data: Inquiry[] | null = null;
      try {
        const res = await fetch("/api/inquiries");
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn("Express server inquiries endpoint failed, trying client-side Firebase...", e);
      }

      if (!data) {
        data = await getInquiriesFromFirebase();
      }
      setInquiries(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const toggleInquiryStatus = async (id: string, currentStatus: "new" | "read") => {
    const nextStatus = currentStatus === "new" ? "read" : "new";
    try {
      // Optimistic Update
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: nextStatus } : inq))
      );

      let savedOnServer = false;
      try {
        const res = await fetch(`/api/inquiries/${id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (res.ok) {
          savedOnServer = true;
        }
      } catch (err) {
        console.warn("Failed to update inquiry status on server, trying direct Firebase:", err);
      }

      if (!savedOnServer) {
        await updateInquiryStatusInFirebase(id, nextStatus);
        console.log(`Successfully updated inquiry ${id} status to ${nextStatus} in direct Firebase.`);
      }
    } catch (err: any) {
      console.error(err);
      // Revert optimistic update
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: currentStatus } : inq))
      );
      alert(err.message || "Failed to update status.");
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inq.partnerName || "").toLowerCase().includes(search.toLowerCase()) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      inq.eventType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || inq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif text-gold font-semibold">Reservation Inquiries</h3>
          <p className="text-xs text-zinc-400">View and respond to couple consultation and booking requests.</p>
        </div>
        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="p-2 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Reload
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        {/* Status Filters */}
        <div className="flex border border-white/10 rounded overflow-hidden">
          {(["all", "new", "read"] as const).map((status) => (
            <button
              key={status}
              type="button"
              id={`filter-${status}-btn`}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-gold text-luxury-black"
                  : "bg-white/2 hover:bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full bg-white/5 border border-white/10 rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/50 placeholder-white/20"
          />
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gold animate-spin mx-auto mb-2" />
          <p className="text-xs text-zinc-500">Loading reservation pipeline...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded p-4">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="text-center py-12 border border-white/5 bg-white/2 rounded-lg text-zinc-500 text-xs italic">
          No booking requests found matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className={`border rounded-lg p-5 transition-all flex flex-col justify-between md:flex-row gap-5 ${
                inq.status === "new"
                  ? "border-gold/30 bg-gold/5 hover:border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                  : "border-white/5 bg-white/1 hover:border-white/10"
              }`}
            >
              <div className="space-y-4 flex-1">
                {/* Client names & Event type */}
                <div className="flex flex-wrap items-baseline gap-2">
                  <h4 className="font-serif text-base text-white font-bold uppercase tracking-wide">
                    {inq.clientName} {inq.partnerName ? `& ${inq.partnerName}` : ""}
                  </h4>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                    {inq.eventType}
                  </span>
                </div>

                {/* Grid meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    <span>Event: {inq.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    <span>Phone: <a href={`tel:${inq.phone}`} className="hover:underline text-white">{inq.phone}</a></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    <span>Email: <a href={`mailto:${inq.email}`} className="hover:underline text-white truncate">{inq.email}</a></span>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-black/30 border border-white/5 p-3 rounded text-xs text-zinc-300 font-sans leading-relaxed">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-gold" /> Message Detail
                  </div>
                  "{inq.message}"
                </div>

                {/* Submitted time */}
                <div className="text-[9px] text-zinc-500 font-mono">
                  Submitted: {new Date(inq.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Status Action controls */}
              <div className="flex md:flex-col justify-end items-center gap-2 flex-shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5">
                {inq.status === "new" ? (
                  <button
                    type="button"
                    onClick={() => toggleInquiryStatus(inq.id, "new")}
                    className="w-full md:w-36 py-2 px-3 bg-zinc-800 hover:bg-gold hover:text-luxury-black text-white text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark as Read
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleInquiryStatus(inq.id, "read")}
                    className="w-full md:w-36 py-2 px-3 bg-white/5 hover:bg-gold hover:text-luxury-black text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark Unread
                  </button>
                )}

                <div className="text-[10px] uppercase tracking-wider font-semibold text-center mt-1">
                  {inq.status === "new" ? (
                    <span className="text-yellow-500 animate-pulse flex items-center gap-1 justify-center">
                      ● Action Needed
                    </span>
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1 justify-center">
                      ✓ Complete / Read
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
