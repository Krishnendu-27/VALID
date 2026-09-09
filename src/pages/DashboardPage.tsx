import type React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  ArrowUpRight,
  Database,
  Cpu,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import type { InspectionHistoryItem } from "@/api/inspection";

// ── Dummy fallback data ──────────────────────────────────────────────────────
const DUMMY_HISTORY: InspectionHistoryItem[] = [
  { inspection_id: "INS001ABC", product_name: "Maggi Masala Noodles 70g",    compliance_score: 92, status: "compliant",     date: "2026-09-07T10:32:00Z" },
  { inspection_id: "INS002DEF", product_name: "Parle-G Gold Biscuits 200g",  compliance_score: 55, status: "non-compliant", date: "2026-09-06T14:10:00Z" },
  { inspection_id: "INS003GHI", product_name: "Amul Taaza Toned Milk 500ml", compliance_score: 88, status: "compliant",     date: "2026-09-05T09:00:00Z" },
  { inspection_id: "INS004JKL", product_name: "Britannia Good Day Cashew",   compliance_score: 23, status: "critical",      date: "2026-09-04T16:45:00Z" },
  { inspection_id: "INS005MNO", product_name: "Haldiram's Bhujia 200g",      compliance_score: 76, status: "compliant",     date: "2026-09-03T11:20:00Z" },
  { inspection_id: "INS006PQR", product_name: "Mother Dairy Mishti Doi",     compliance_score: 91, status: "compliant",     date: "2026-09-02T08:55:00Z" },
  { inspection_id: "INS007STU", product_name: "Nestle KitKat 4-Finger 40g", compliance_score: 48, status: "non-compliant", date: "2026-09-01T13:30:00Z" },
  { inspection_id: "INS008VWX", product_name: "Patanjali Atta 5kg",          compliance_score: 67, status: "non-compliant", date: "2026-08-30T15:00:00Z" },
  { inspection_id: "INS009YZA", product_name: "Lays Classic Salted 26g",     compliance_score: 82, status: "compliant",     date: "2026-08-28T10:10:00Z" },
  { inspection_id: "INS010BCD", product_name: "Tata Salt 1kg",               compliance_score: 95, status: "compliant",     date: "2026-08-26T07:45:00Z" },
  { inspection_id: "INS011EFG", product_name: "Dabur Honey 500g",            compliance_score: 19, status: "critical",      date: "2026-08-25T14:20:00Z" },
  { inspection_id: "INS012HIJ", product_name: "Cadbury Dairy Milk 40g",      compliance_score: 87, status: "compliant",     date: "2026-08-22T11:00:00Z" },
  { inspection_id: "INS013KLM", product_name: "Real Fruit Power Mango 1L",   compliance_score: 60, status: "non-compliant", date: "2026-08-20T09:30:00Z" },
  { inspection_id: "INS014NOP", product_name: "MTR Poha Instant Mix 200g",   compliance_score: 78, status: "compliant",     date: "2026-08-15T16:00:00Z" },
  { inspection_id: "INS015QRS", product_name: "Sunfeast Dark Fantasy 300g",  compliance_score: 90, status: "compliant",     date: "2026-08-12T10:50:00Z" },
  { inspection_id: "INS016TUV", product_name: "Colgate Strong Teeth 200g",   compliance_score: 38, status: "critical",      date: "2026-08-08T13:15:00Z" },
  { inspection_id: "INS017WXY", product_name: "Boost Energy Drink 500ml",    compliance_score: 73, status: "compliant",     date: "2026-07-29T08:00:00Z" },
  { inspection_id: "INS018ZAB", product_name: "Magnum Double Caramel",       compliance_score: 85, status: "compliant",     date: "2026-07-22T15:30:00Z" },
  { inspection_id: "INS019CDE", product_name: "Pepsi Black 600ml PET",       compliance_score: 44, status: "non-compliant", date: "2026-07-15T11:45:00Z" },
  { inspection_id: "INS020FGH", product_name: "Tropicana Apple 200ml",       compliance_score: 94, status: "compliant",     date: "2026-07-08T09:20:00Z" },
  { inspection_id: "INS021IJK", product_name: "MDH Haldi Powder 100g",       compliance_score: 58, status: "non-compliant", date: "2026-06-27T14:00:00Z" },
  { inspection_id: "INS022LMN", product_name: "ITC Aashirvaad Atta 10kg",    compliance_score: 89, status: "compliant",     date: "2026-06-18T10:30:00Z" },
  { inspection_id: "INS023OPQ", product_name: "Parle Monaco Crackers",       compliance_score: 62, status: "non-compliant", date: "2026-06-10T08:15:00Z" },
  { inspection_id: "INS024RST", product_name: "Horlicks Classic Malt 500g",  compliance_score: 97, status: "compliant",     date: "2026-06-03T13:40:00Z" },
  { inspection_id: "INS025UVW", product_name: "Sprite Lime Fresh 750ml",     compliance_score: 31, status: "critical",      date: "2026-05-28T16:10:00Z" },
  { inspection_id: "INS026XYZ", product_name: "Saffola Gold Oil 1L",         compliance_score: 83, status: "compliant",     date: "2026-05-20T10:00:00Z" },
  { inspection_id: "INS027ABC", product_name: "Vim Bar Dishwash 250g",        compliance_score: 70, status: "compliant",     date: "2026-05-12T09:50:00Z" },
  { inspection_id: "INS028DEF", product_name: "Surf Excel Matic 1kg",        compliance_score: 26, status: "critical",      date: "2026-05-05T15:20:00Z" },
  { inspection_id: "INS029GHI", product_name: "Lipton Yellow Label Tea 100g",compliance_score: 93, status: "compliant",     date: "2026-04-28T11:30:00Z" },
  { inspection_id: "INS030JKL", product_name: "Good Life Brown Rice 1kg",    compliance_score: 50, status: "non-compliant", date: "2026-04-18T08:30:00Z" },
];



const StatCard = ({
  icon: Icon,
  label,
  value,
  colorClass,
  sub,
  progress,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  colorClass: string;
  glowClass?: string;
  sub?: string;
  isHero?: boolean;
  progress?: number;
}) => (
  <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:scale-[1.02] group hover:shadow-xl overflow-hidden">
    {/* Subtle glow blob */}
    <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${colorClass}`} />
    {/* Top row: icon + label */}
    <div className="flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md transition-transform group-hover:scale-110 ${colorClass}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-neutral-500 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-wider leading-tight">{label}</p>
    </div>
    {/* Value */}
    <p className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">{value}</p>
    {/* Sub + optional progress */}
    <div className="space-y-1.5">
      {sub && <p className="text-neutral-400 dark:text-neutral-500 text-[10px] font-mono uppercase tracking-widest">{sub}</p>}
      {progress !== undefined && (
        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

const statusMap: Record<string, { label: string; cls: string }> = {
  compliant: { label: "Compliant", cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" },
  "non-compliant": { label: "Non-Compliant", cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20" },
  critical: { label: "Critical", cls: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20" },
  processing: { label: "Processing", cls: "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-400/20" },
};

export default function DashboardPage() {
  const theme = useThemeStore((s) => s.theme);
  const history = DUMMY_HISTORY;

  // Compute metrics from live history
  const totalScanned = history.length;
  
  const compliantCount = history.filter((h) => {
    const s = String(h.status || "").toLowerCase();
    return s.includes("compli") || s.includes("pass");
  }).length;

  const nonCompliantCount = history.filter((h) => {
    const s = String(h.status || "").toLowerCase();
    return s.includes("non") || s.includes("warn") || s.includes("review");
  }).length;

  const criticalCount = history.filter((h) => {
    const s = String(h.status || "").toLowerCase();
    return s.includes("crit") || s.includes("fail");
  }).length;

  const avgCompliance = history.length > 0
    ? (history.reduce((sum, h) => sum + (Number(h.compliance_score) || 0), 0) / history.length).toFixed(1) + "%"
    : "0%";

  // Count this month's inspections
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = history.filter((h) => h.date && h.date.startsWith(currentYearMonth)).length;

  // Render recent inspections directly using fetched status
  const displayRecent = history.slice(0, 4).map((h) => {
    const norm = String(h.status || "").toLowerCase();
    let statusKey = "compliant";
    if (norm.includes("crit")) statusKey = "critical";
    else if (norm.includes("non") || norm.includes("fail")) statusKey = "non-compliant";
    else if (norm.includes("proc")) statusKey = "processing";
    return {
      id: h.inspection_id || (h as { _id?: string })._id || "UNKNOWN",
      product: h.product_name || "Unlabelled Packaging",
      date: h.date ? new Date(h.date).toLocaleDateString("en-IN") : "Recent",
      status: statusKey,
      score: h.compliance_score,
    };
  });

  // Calculate monthly data for chart (last 6 months)
  const monthlyData = [...Array(6)].map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthStr = d.toLocaleString('default', { month: 'short' });
    const yearMonth = d.toISOString().slice(0, 7);
    const count = history.filter((h) => h.date && h.date.startsWith(yearMonth)).length;
    return { month: monthStr, inspections: count };
  });

  return (
    <div className="p-4 sm:p-6 xl:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-300 font-mono tracking-widest uppercase">
            <Cpu className="w-3.5 h-3.5" />
            Operational Terminal
          </div>
          <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight mt-1">Dashboard</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Showing {history.length} demo inspections
          </p>
        </div>
        <Link
          to="/inspection/new"
          id="new-inspection-btn"
          className="flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full transition-all shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40 hover:scale-[1.02]"
        >
          <ClipboardList className="w-4 h-4" />
          New Telemetry Scan
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={Package}
          label="Total Scanned"
          value={totalScanned}
          colorClass="bg-gradient-to-br from-amber-400 to-amber-500"
          glowClass=""
          sub="ALL TIME"
        />
        <StatCard
          icon={CheckCircle2}
          label="Compliant"
          value={compliantCount}
          colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
          glowClass=""
          sub={`${Math.round((compliantCount / (totalScanned || 1)) * 100)}% PASS RATE`}
        />
        <StatCard
          icon={XCircle}
          label="Warnings"
          value={nonCompliantCount}
          colorClass="bg-gradient-to-br from-amber-500 to-amber-600"
          glowClass=""
          sub="NON-COMPLIANT"
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical"
          value={criticalCount}
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
          glowClass=""
          sub="VIOLATIONS"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={avgCompliance}
          colorClass="bg-gradient-to-br from-violet-500 to-violet-600"
          glowClass=""
          sub="COMPLIANCE RATE"
          progress={parseFloat(avgCompliance)}
        />
        <StatCard
          icon={ClipboardList}
          label="This Month"
          value={thisMonthCount}
          colorClass="bg-gradient-to-br from-sky-500 to-sky-600"
          glowClass=""
          sub="SCAN RATE"
        />
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Monthly chart */}
        <div className="xl:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
          {/* Subtle grid mesh backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(99,102,241,0.02),transparent_100%)] pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Inspections Volume History</h2>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              STORAGE LINK ACTIVE
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthlyData} barSize={24}>
              <CartesianGrid strokeDasharray="4 4" stroke={theme === "light" ? "#cbd5e1" : "#334155"} vertical={true} strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: theme === "light" ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.95)",
                  border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
                  borderRadius: 12,
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  color: theme === "light" ? "#0f172a" : "#f1f5f9",
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(99,102,241,0.04)" }}
              />
              <Bar dataKey="inspections" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Inspections */}
        <div className="xl:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Recent Inspections Feed</h2>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">Live Audit</span>
          </div>
          <div className="space-y-3">
            {displayRecent.map((ins) => (
              <Link
                key={ins.id}
                to={`/inspection/${ins.id}/report`}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors">
                    {ins.product}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {ins.date} · #{String(ins.id).slice(-6).toUpperCase()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusMap[ins.status]?.cls ?? statusMap.compliant.cls}`}>
                    {statusMap[ins.status]?.label ?? "Compliant"}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
          <Link to="/inspection/history" className="block text-center text-amber-500 dark:text-amber-300 hover:text-amber-400 dark:hover:text-amber-200 text-xs font-bold uppercase tracking-wider mt-4 transition-colors">
            Access Complete Archival Feed →
          </Link>
        </div>
      </div>
    </div>
  );
}
