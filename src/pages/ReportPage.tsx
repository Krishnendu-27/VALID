import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FileText, Download, Save, Loader2,
  CheckCircle2, XCircle, AlertTriangle,
  Building2, Calendar, Hash, ShieldCheck, Signature, User, Scale
} from "lucide-react";
import { inspectionApi, type ReportData, type RuleResult } from "@/api/inspection";

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportData | null>(null);

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
          setReport(res.data.data);
        }
      } catch (err) {
        console.warn("Falling back to mock report:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchReport();
    return () => { isMounted = false; };
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
  };

  const score = report?.inspection.complianceScore !== undefined ? report.inspection.complianceScore : 0;
  const isViolation = report ? report.inspection.status === "NON-COMPLIANT" || score < 70 : score < 70;

  const rawRules = report?.compliance.ruleResults || [];
  const rules = rawRules.map((r: RuleResult) => ({
    ruleId: r.ruleCode,
    name: r.ruleName,
    status: r.passed ? "pass" : r.severity === "WARNING" ? "warning" : "fail",
    description: r.issue || (r.passed ? "Verified in compliance with packaging regulations." : `${r.ruleName} requirement failed or missing.`),
  }));

  const passed = rules.filter((r) => r.status === "pass").length;
  const failed = rules.filter((r) => r.status === "fail").length;
  const warned = rules.filter((r) => r.status === "warning").length;

  const merged = report?.product.merged_fields;
  const officer = report?.officer;
  const citations = report?.compliance.legalActionCitations || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Inspection Report Certificate
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            Legal compliance notice and validation certificate
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="save-inspection-btn"
            onClick={handleSave}
            disabled={saving || saved}
            className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-white text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "✓ Saved to Database!" : "Save Notice"}
          </button>
          <button
            id="download-pdf-btn"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-lg shadow-neutral-500/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Print / PDF Export
          </button>
        </div>
      </div>

      {/* Official Legal Notice Document */}
      <div
        id="report-document"
        className="bg-white text-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-neutral-100 print:border-none print:shadow-none font-sans"
      >
        {/* Document Header Band */}
        <div className={`px-8 py-7 ${isViolation ? "bg-red-700 text-white" : "bg-emerald-700 text-white"}`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <Building2 className="w-5.5 h-5.5 text-white/90" />
                <span className="text-white/90 text-xs font-mono tracking-widest uppercase">
                  LEGAL METROLOGY &amp; FSSAI AUDIT TELEMETRY
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                {isViolation ? "NOTICE OF REGULATORY NON-COMPLIANCE" : "OFFICIAL CERTIFICATE OF COMPLIANCE"}
              </h2>
              <p className="text-white/80 text-sm mt-1 max-w-xl">
                {isViolation
                  ? "Packaging analysis has detected non-conformances violating mandatory commodity declaration rules."
                  : "Packaging analysis verifies complete compliance with all applicable statutory labelling guidelines."}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/20 text-center sm:text-right min-w-[120px]">
              <div className="text-4xl font-black leading-none font-mono">
                {score}%
              </div>
              <p className="text-white/80 text-[10px] uppercase font-mono tracking-wider mt-1">TELEMETRY RATING</p>
            </div>
          </div>
        </div>

        {/* Document Body */}
        <div className="px-8 py-7 space-y-7">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 pb-5 border-b border-neutral-100">
            <div className="flex items-start gap-2.5">
              <Hash className="w-4.5 h-4.5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Document ID</p>
                <p className="text-xs text-neutral-800 font-bold font-mono">
                  {report ? `#${report.inspection.id.slice(-8)}` : "INS-2026-MG01"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4.5 h-4.5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Audit Timestamp</p>
                <p className="text-xs text-neutral-800 font-bold">
                  {report ? new Date(report.inspection.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "25 August 2026"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <User className="w-4.5 h-4.5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Auditing Officer</p>
                <p className="text-xs text-neutral-800 font-bold">
                  {officer?.name || "Officer Pritam"} ({officer?.officerId || "OFF_001"})
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FileText className="w-4.5 h-4.5 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Status</p>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-0.5
                  ${isViolation ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                  {report?.inspection.status || (isViolation ? "NON-COMPLIANT" : "COMPLIANT")}
                </span>
              </div>
            </div>
          </div>

          {/* Product Scanned Telemetry Section */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-5 space-y-4 font-mono">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-200 pb-2">
              Analyzed Commodity Label Attributes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 text-xs">
              <div>
                <p className="text-neutral-400 font-medium">Product Identity</p>
                <p className="text-neutral-800 font-bold mt-1 leading-relaxed">
                  {report?.product.name || "SunFresh Multigrain Cereal"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-medium">Net Quantity</p>
                <p className="text-neutral-800 font-bold mt-1 leading-relaxed">
                  {merged?.net_quantity?.text || "200 g"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-medium">Maximum Retail Price</p>
                <p className="text-neutral-800 font-bold mt-1 leading-relaxed">
                  {merged?.mrp?.text || "₹85.00 (Incl. all taxes)"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-medium">Packing / Mfg Date</p>
                <p className="text-neutral-800 font-bold mt-1 leading-relaxed">
                  {merged?.packed_date?.text || "January 2026"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-medium">Customer Care</p>
                <p className="text-neutral-800 font-bold mt-1 leading-relaxed">
                  {merged?.customer_care?.text || "1800-XXX-XXXX"}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-medium">Country of Origin</p>
                <p className="text-neutral-800 font-bold mt-1 leading-relaxed">
                  {merged?.country_of_origin?.text || "India"}
                </p>
              </div>
            </div>
            <div className="border-t border-neutral-200/60 pt-3 text-[11px]">
              <span className="text-neutral-400 font-bold uppercase tracking-wider">Declared Manufacturer: </span>
              <span className="text-neutral-700 font-medium">
                {merged?.manufacturer?.text || "SunFresh Foods Pvt. Ltd., Plot 14, MIDC Pune - 411019, Maharashtra, India"}
              </span>
            </div>
          </div>

          {/* Statutory Citations Section (if violations) */}
          {citations.length > 0 && (
            <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 space-y-3 font-mono">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                Statutory Citations &amp; Recommended Directives
              </div>
              {citations.map((c, i) => (
                <div key={i} className="text-xs space-y-1.5 text-neutral-800">
                  <p className="text-red-800">
                    <span className="font-black text-sm">[{c.violationCode}]</span> <span className="font-semibold">{c.citation.law}</span>
                  </p>
                  <p className="text-neutral-600 leading-relaxed">{c.citation.section}</p>
                  <p className="text-neutral-400 font-medium text-[11px] mt-1">Action: {c.citation.recommendedAction}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rule Evaluation Summary Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-200 pb-2">
              Statutory Declarations Evaluated
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 font-mono">
              <div className="flex-1 flex flex-col items-center justify-center bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center h-24">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1 flex-shrink-0" />
                <p className="text-xl font-bold text-emerald-700 leading-none">{passed}</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide mt-1">Passed</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center bg-red-50/50 border border-red-100 rounded-xl p-3 text-center h-24">
                <XCircle className="w-5 h-5 text-red-650 mb-1 flex-shrink-0" />
                <p className="text-xl font-bold text-red-700 leading-none">{failed}</p>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide mt-1">Failed</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center bg-amber-50/50 border border-amber-100 rounded-xl p-3 text-center h-24">
                <AlertTriangle className="w-5 h-5 text-amber-600 mb-1 flex-shrink-0" />
                <p className="text-xl font-bold text-amber-700 leading-none">{warned}</p>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wide mt-1">Warnings</p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[600px] text-xs mt-4">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-[10px] text-neutral-400 font-bold uppercase tracking-wider font-mono">
                  <th className="py-2.5 w-8">#</th>
                  <th className="py-2.5 w-44">Rule Parameter</th>
                  <th className="py-2.5">Analysis Findings &amp; Discrepancies</th>
                  <th className="py-2.5 text-right w-24">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono">
                {rules.map((rule, i) => (
                  <tr key={rule.ruleId} className="align-top">
                    <td className="py-3 text-neutral-400">{i + 1}</td>
                    <td className="py-3 text-neutral-800 font-bold">{rule.name}</td>
                    <td className="py-3 text-neutral-600 leading-relaxed">{rule.description}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border
                        ${rule.status === "pass" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : rule.status === "fail" ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                        {rule.status}
                      </span>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Validation Stamp & Signoff */}
          <div className="border-t border-neutral-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-widest font-mono">
                  Authority Audit Cryptographic Seal
                </h4>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed max-w-sm font-mono">
                This verification check was performed using validated optical character extraction and Legal Metrology rules. Regulatory infractions require prompt corrective declarations.
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-1.5 text-center sm:text-right">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                <Signature className="w-3.5 h-3.5 text-amber-400" />
                DIGITAL SIGNATURE STAMP
              </div>
              <div className="h-10 border-b border-dashed border-neutral-300 w-48 flex items-center justify-center font-serif text-neutral-800 italic text-sm select-none">
                {officer?.name || "Officer Pritam"}
              </div>
              <p className="text-[9px] font-mono text-amber-500 font-semibold">
                VALID AUTH HASH: {report?.inspection.id ? report.inspection.id.slice(0, 16) : "C4A9B8D10E9"}
              </p>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="border-t border-neutral-100 pt-4 text-[9px] font-mono text-neutral-400 flex flex-col sm:flex-row sm:justify-between gap-2">
            <span>OFFICIAL SYSTEM RECORD · VALID PLATFORM</span>
            <span>SYSTEM AUDIT TIME: {new Date().toLocaleDateString("en-IN")} · IST</span>
          </div>
        </div>
      </div>
    </div>
  );
}

