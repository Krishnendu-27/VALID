import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { inspectionApi, type InspectionHistoryItem } from "@/api/inspection";
import {
  History, ChevronRight, X, CheckCircle2, XCircle,
  AlertTriangle, Calendar, Package, Loader2, RefreshCw, FileText, Eye, ShieldCheck,
} from "lucide-react";

const statusMap: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  compliant:      { label: "Compliant",     cls: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle2 },
  "non-compliant": { label: "Non-Compliant", cls: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20",             icon: XCircle },
  processing:     { label: "Processing",   cls: "bg-amber-50 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-400/20",     icon: Loader2 },
  review:         { label: "Needs Review", cls: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",       icon: AlertTriangle },
  pending:        { label: "Pending",       cls: "bg-neutral-100 dark:bg-neutral-500/15 text-neutral-700 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-500/20",       icon: AlertTriangle },
};

export default function HistoryPage() {
  const [inspections, setInspections] = useState<InspectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<InspectionHistoryItem | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await inspectionApi.getHistory();
      if (res.data?.data) {
        setInspections(res.data.data);
      }
    } catch (err) {
      console.warn("Could not load remote history, keeping existing data or fallback", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const resolveStatus = (statusStr: string) => {
    const norm = (statusStr || "").toLowerCase().replace(/_/g, "-");
    if (norm.includes("non") || norm.includes("fail")) return statusMap["non-compliant"];
    if (norm.includes("compli") || norm.includes("pass")) return statusMap.compliant;
    if (norm.includes("proc")) return statusMap.processing;
    if (norm.includes("rev")) return statusMap.review;
    return statusMap.pending;
  };

  return (
    <div className="p-4 sm:p-6 xl:px-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-300" />
            Inspection Telemetry History
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            {inspections.length} recorded product compliance audits
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          Refresh Database
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-mono uppercase tracking-widest">Querying MongoDB Inspection Records...</span>
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">No inspections on record yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Scan packaging images to automatically log compliance scores and statutory citations.
            </p>
            <Link
              to="/inspection/new"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Start First Inspection
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  {["Inspection ID", "Product", "Timestamp", "Compliance", "Status", "Actions", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inspections.map((ins, i) => {
                  const s = resolveStatus(ins.status);
                  const Icon = s.icon;
                  const inspectionIdStr = String(ins.inspection_id || (ins as { _id?: string })._id || "UNKNOWN");
                  const idShort = inspectionIdStr.slice(-8).toUpperCase();
                  const dateStr = ins.date
                    ? new Date(ins.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  const rawScore = ins.compliance_score;
                  const numScore = rawScore != null
                    ? typeof rawScore === "number"
                      ? rawScore
                      : parseFloat(String(rawScore).replace(/[^0-9.]/g, "")) || 0
                    : null;
                  const isCompliantStatus = s.label === "Compliant";

                  return (
                    <tr
                      key={inspectionIdStr || i}
                      onClick={() => setSelected(ins)}
                      className={`border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer ${
                        i === inspections.length - 1 ? "border-none" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono text-amber-500 dark:text-amber-300 font-semibold">
                          #{idShort}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-600 flex-shrink-0" />
                          <span className="text-sm text-neutral-900 dark:text-white font-medium whitespace-nowrap">
                            {ins.product_name || "Unlabelled Product"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {numScore != null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold font-mono ${
                                isCompliantStatus
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {rawScore != null && String(rawScore).includes("%") ? rawScore : `${numScore}%`}
                            </span>
                            <div className="w-16 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full transition-all ${isCompliantStatus ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`}
                                style={{ width: `${Math.min(100, Math.max(0, numScore))}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-neutral-400 dark:text-neutral-600 text-xs font-mono">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${s.cls}`}>
                          <Icon className="w-3 h-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/inspection/${inspectionIdStr}/evidence`}
                            title="Inspect Vision Overlay"
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/inspection/${inspectionIdStr}/report`}
                            title="Generate Certificate"
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-400/15 text-amber-500 dark:text-amber-300 hover:bg-amber-50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-600" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Holographic top status bar */}
            {(() => {
              const rawModalScore = selected.compliance_score;
              const modalNum = rawModalScore != null
                ? typeof rawModalScore === "number"
                  ? rawModalScore
                  : parseFloat(String(rawModalScore).replace(/[^0-9.]/g, "")) || 0
                : 0;
              const modalPassed = resolveStatus(selected.status).label === "Compliant";
              const displayModalScore = rawModalScore != null && String(rawModalScore).includes("%") ? rawModalScore : `${modalNum}%`;

              return (
                <>
                  <div
                    className={`absolute top-0 left-0 w-full h-1.5 ${
                      modalPassed
                        ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                        : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                    }`}
                  />

                  {/* Modal header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                        {selected.product_name || "Unlabelled Product"}
                      </h3>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">
                        ID: #{String(selected.inspection_id || (selected as { _id?: string })._id || "UNKNOWN").slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>

                  {/* Modal body */}
                  <div className="px-6 py-5 space-y-5">
                    <div className="flex items-center gap-4">
                      <div
                        className={`text-4xl font-black font-mono tracking-tight ${
                          modalPassed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {displayModalScore}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">Statutory Rating</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                          Logged: {new Date(selected.date).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          modalPassed ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, modalNum))}%` }}
                      />
                    </div>

                    {/* Quick links */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        to={`/inspection/${selected.inspection_id || (selected as { _id?: string })._id}/evidence`}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:border-amber-400/50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-amber-400" />
                        Bounding Boxes
                      </Link>
                      <Link
                        to={`/inspection/${selected.inspection_id || (selected as { _id?: string })._id}/compliance`}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 hover:border-amber-400/50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Rules & Violations
                      </Link>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
              <Link
                to={`/inspection/${selected.inspection_id || (selected as { _id?: string })._id}/report`}
                className="flex-1 text-center bg-white text-black dark:text-black border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-200 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-neutral-500/10"
              >
                Open Official Report
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="px-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
