import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2, XCircle, AlertTriangle,
  Loader2, ChevronRight, ShieldCheck, ExternalLink,
} from "lucide-react";
import { inspectionApi, type RuleResult } from "@/api/inspection";

type DisplayRule = {
  ruleId: string;
  name: string;
  status: "pass" | "fail" | "warning";
  description: string;
};

const statusConfig: Record<
  "pass" | "fail" | "warning",
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  pass:    { icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", label: "Pass" },
  fail:    { icon: XCircle,       color: "text-red-650 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",         label: "Fail" },
  warning: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",     label: "Warning" },
};

export default function CompliancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [liveRules, setLiveRules] = useState<DisplayRule[]>([]);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [productName, setProductName] = useState<string>("Packaging Target");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchReport() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await inspectionApi.getReport(id);
        if (isMounted && res.data?.data) {
          const report = res.data.data;
          setProductName(report.product?.name || "Inspected Commodity");
          setLiveScore(report.inspection.complianceScore);
          const rawRules = report.compliance?.ruleResults || [];
          if (rawRules.length > 0) {
            const mapped: DisplayRule[] = rawRules.map((r: RuleResult) => ({
              ruleId: r.ruleCode,
              name: r.ruleName,
              status: r.passed ? "pass" : r.severity === "WARNING" ? "warning" : "fail",
              description: r.issue || (r.passed ? "Regulatory requirement fully verified." : `${r.ruleName} requirement failed or missing.`),
            }));
            setLiveRules(mapped);
          }
        }
      } catch (err) {
        console.warn("Falling back to mock rules:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchReport();
    return () => { isMounted = false; };
  }, [id]);

  const rules = liveRules;
  const score = liveScore;
  const passed   = rules.filter((r) => r.status === "pass").length;
  const failed   = rules.filter((r) => r.status === "fail").length;
  const warnings = rules.filter((r) => r.status === "warning").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
        <p className="text-neutral-400 text-sm font-mono">Evaluating regulatory rule matrix…</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 xl:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1 font-mono">
            <span>{productName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500 dark:text-amber-300 font-bold">Rule Engine Validation</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400 dark:text-amber-300" />
            Compliance Analysis
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            Rule-by-rule evaluation against statutory labelling standards
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="view-evidence-btn"
            onClick={() => navigate(`/inspection/${id || "mock-001"}/evidence`)}
            className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Visual Evidence
          </button>
          <button
            id="view-report-btn"
            onClick={() => navigate(`/inspection/${id || "mock-001"}/report`)}
            className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-lg shadow-neutral-500/10 cursor-pointer"
          >
            Official Report <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score banner */}
      {score !== null && (
        <div className={`relative rounded-2xl border p-6 flex flex-col md:flex-row md:items-center gap-5 overflow-hidden transition-all duration-500
          ${score >= 70
            ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400"
            : "bg-red-50/30 dark:bg-red-950/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400"}`}
        >
          {/* Neon vertical marker */}
          <div className={`absolute top-0 left-0 w-1.5 h-full ${score >= 70 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"}`} />

          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black font-mono ${score >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {score}
            </span>
            <span className="text-xs font-bold text-neutral-400 font-mono">%</span>
          </div>
          <div className="min-w-0">
            <p className="text-neutral-900 dark:text-white font-bold tracking-tight">Compliance Telemetry Rating</p>
            <div className="flex gap-4 mt-2 text-sm font-mono font-black">
              <span className="text-emerald-600 dark:text-emerald-400">✓ {passed} PASSED</span>
              <span className="text-red-600 dark:text-red-400">✗ {failed} FAILED</span>
              {warnings > 0 && <span className="text-amber-600 dark:text-amber-400">⚠ {warnings} WARNINGS</span>}
            </div>
          </div>
          <div className="flex-1 ml-0 md:ml-4">
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${score >= 70 ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length > 0 ? (
        <div className="space-y-5">
          {rules.map((rule) => {
            const cfg = statusConfig[rule.status];
            const Icon = cfg.icon;
            const isPass = rule.status === "pass";
            const borderCol = isPass ? "border-l-4 border-l-emerald-400 dark:border-l-emerald-500 hover:border-emerald-500/50" 
              : rule.status === "fail" ? "border-l-4 border-l-red-400 dark:border-l-red-500 hover:border-red-500/50" 
              : "border-l-4 border-l-amber-400 dark:border-l-amber-500 hover:border-amber-500/50";
            return (
              <div
                key={rule.ruleId}
                className={`relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 transition-all duration-200 hover:scale-[1.005] hover:shadow-md ${borderCol} overflow-hidden`}
              >
                <div className="flex items-start gap-4 w-full sm:w-auto flex-1 min-w-0">
                  <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">{rule.name}</p>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed font-mono">{rule.description}</p>
                  </div>
                </div>
                {rule.status !== "pass" && (
                  <button
                    id={`view-evidence-${rule.ruleId}`}
                    onClick={() => navigate(`/inspection/${id || "mock-001"}/evidence`)}
                    className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-400/10 hover:bg-amber-50 dark:hover:bg-amber-400/20 text-amber-700 dark:text-amber-200 border border-amber-100 dark:border-amber-400/30 px-3 py-2 rounded-lg flex-shrink-0 transition-all hover:scale-105 shadow-sm mt-0.5 cursor-pointer self-start sm:self-auto"
                  >
                    Evidence <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
          <ShieldCheck className="w-12 h-12 text-slate-350 dark:text-neutral-700" />
          <p className="text-neutral-700 dark:text-neutral-300 font-medium">No compliance data yet</p>
          <p className="text-neutral-500 text-sm max-w-xs">
            Click "Run Compliance Check" to evaluate this product against all regulatory rules.
          </p>
        </div>
      )}
    </div>
  );
}

