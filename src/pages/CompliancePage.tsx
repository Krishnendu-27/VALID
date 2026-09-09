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
  category?: string;
  violationCode?: string;
  description: string;
  evidence?: {
    field?: string | null;
    value?: unknown;
    reason?: string;
    required_metadata?: string;
    match_confidence?: number;
    machine_method?: string;
    reference_date?: string;
    raw_mfg_text?: string;
    raw_expiry_text?: string;
    bbox?: number[] | null;
    confidence?: number;
    minimum?: number | null;
    maximum?: number | null;
  };
};

const statusConfig: Record<
  "pass" | "fail" | "warning",
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  pass:    { icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", label: "Pass" },
  fail:    { icon: XCircle,       color: "text-red-650 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",         label: "Fail" },
  warning: { icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",     label: "Review Required" },
};

export default function CompliancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [liveRules, setLiveRules] = useState<DisplayRule[]>([]);
  const [liveScore, setLiveScore] = useState<number | null>(null);
  const [productName, setProductName] = useState<string>("Packaging Target");
  const [activeFilter, setActiveFilter] = useState<"all" | "fail" | "warning" | "pass">("all");
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
          const rawReviewRequired = 
            report.compliance?.review_required || 
            report.inspection?.review_required || 
            [];

          const mappedRules: DisplayRule[] = rawRules.map((r: RuleResult) => ({
            ruleId: r.ruleCode,
            name: r.ruleName,
            status: r.passed ? "pass" : r.severity === "WARNING" ? "warning" : "fail",
            description: r.issue || (r.passed ? "Regulatory requirement fully verified." : `${r.ruleName} requirement failed or missing.`),
          }));

          const mappedReviews: DisplayRule[] = rawReviewRequired.map((rev) => ({
            ruleId: rev.rule_id,
            name: rev.rule_name,
            status: "warning",
            category: rev.category ? rev.category.replace(/_/g, " ") : undefined,
            violationCode: rev.violation_code || undefined,
            description: rev.message || "Manual officer verification required.",
            evidence: rev.evidence,
          }));

          // Merge standard evaluated rules and review required rules
          const allRules = [...mappedRules, ...mappedReviews];
          if (allRules.length > 0) {
            setLiveRules(allRules);
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

  const filteredRules = activeFilter === "all"
    ? rules
    : rules.filter((r) => r.status === activeFilter);

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
          ${score >= 50
            ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400"
            : "bg-red-50/30 dark:bg-red-950/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400"}`}
        >
          {/* Neon vertical marker */}
          <div className={`absolute top-0 left-0 w-1.5 h-full ${score >= 50 ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"}`} />

          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black font-mono ${score >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {score}
            </span>
            <span className="text-xs font-bold text-neutral-400 font-mono">%</span>
          </div>
          <div className="min-w-0">
            <p className="text-neutral-900 dark:text-white font-bold tracking-tight">Compliance Telemetry Rating</p>
            <div className="flex gap-4 mt-2 text-sm font-mono font-black">
              <span className="text-emerald-600 dark:text-emerald-400">✓ {passed} PASSED</span>
              <span className="text-red-600 dark:text-red-400">✗ {failed} FAILED</span>
              {warnings > 0 && <span className="text-amber-600 dark:text-amber-400">⚠ {warnings} REQUIRES REVIEW</span>}
            </div>
          </div>
          <div className="flex-1 ml-0 md:ml-4">
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${score >= 50 ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {rules.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === "all"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white"
            }`}
          >
            All Rules ({rules.length})
          </button>
          <button
            onClick={() => setActiveFilter("fail")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === "fail"
                ? "bg-red-600 text-white"
                : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
            }`}
          >
            Violations ({failed})
          </button>
          {warnings > 0 && (
            <button
              onClick={() => setActiveFilter("warning")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeFilter === "warning"
                  ? "bg-amber-500 text-black"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              }`}
            >
              Requires Review ({warnings})
            </button>
          )}
          <button
            onClick={() => setActiveFilter("pass")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === "pass"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            }`}
          >
            Passed ({passed})
          </button>
        </div>
      )}

      {/* Rules list */}
      {filteredRules.length > 0 ? (
        <div className="space-y-4">
          {filteredRules.map((rule) => {
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
                      {rule.category && (
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                          {rule.category}
                        </span>
                      )}
                      {rule.violationCode && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          {rule.violationCode}
                        </span>
                      )}
                      {rule.evidence?.bbox && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          📐 Spatial Bounding Box
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed font-mono">{rule.description}</p>

                    {/* Rich Evidence Telemetry Detail */}
                    {rule.evidence && (
                      <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap gap-2 text-[11px] font-mono">
                        {rule.evidence.raw_mfg_text && (
                          <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                            <strong>Mfg:</strong> {rule.evidence.raw_mfg_text}
                          </span>
                        )}
                        {rule.evidence.raw_expiry_text && (
                          <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                            <strong>Expiry Text:</strong> {rule.evidence.raw_expiry_text}
                          </span>
                        )}
                        {rule.evidence.value !== undefined && rule.evidence.value !== null && (
                          <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                            <strong>Detected:</strong> {String(rule.evidence.value)}
                          </span>
                        )}
                        {rule.evidence.reason && (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <strong>Reason:</strong> {rule.evidence.reason.replace(/_/g, " ")}
                          </span>
                        )}
                        {rule.evidence.required_metadata && (
                          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <strong>Requires Meta:</strong> {rule.evidence.required_metadata}
                          </span>
                        )}
                        {rule.evidence.confidence !== undefined && (
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <strong>OCR Conf:</strong> {(rule.evidence.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
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
          <p className="text-neutral-700 dark:text-neutral-300 font-medium">No rules found for this filter</p>
          <p className="text-neutral-500 text-sm max-w-xs">
            Select a different filter tab above to view other compliance categories.
          </p>
        </div>
      )}
    </div>
  );
}

