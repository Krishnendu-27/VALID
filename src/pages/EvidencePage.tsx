import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Layers, Loader2, ShieldCheck } from "lucide-react";
import { inspectionApi, type EvidenceData, type CanvasOverlay, type Violation } from "@/api/inspection";

export default function EvidencePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState<EvidenceData | null>(null);
  const [activeAspect, setActiveAspect] = useState<"front" | "back" | "side">("front");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadEvidence() {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await inspectionApi.getEvidence(id);
        if (isMounted && res.data?.data) {
          setEvidence(res.data.data);
        }
      } catch (err) {
        console.warn("Falling back to mock overlays:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEvidence();
    return () => { isMounted = false; };
  }, [id]);

  const liveOverlays: CanvasOverlay[] = evidence?.canvasOverlays || [];
  const liveViolations: Violation[] = evidence?.violations || [];
  const hasLive = liveOverlays.length > 0;

  // Filter overlays for current aspect
  const filteredOverlays = liveOverlays.filter((o) => o.image_type === activeAspect);

  // Draw overlays on canvas once loaded
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 480;
    const height = 600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawOverlays = () => {
      // Grid lines
      ctx.strokeStyle = "rgba(99,102,241,0.06)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      if (hasLive) {
        filteredOverlays.forEach((overlay) => {
          const isViolation = overlay.type === "VIOLATION";
          const isReview = overlay.type === "REVIEW";

          const stroke = isViolation
            ? "rgba(239,68,68,0.9)"
            : isReview
            ? "rgba(245,158,11,0.9)"
            : "rgba(16,185,129,0.9)";

          const fill = isViolation
            ? "rgba(239,68,68,0.08)"
            : isReview
            ? "rgba(245,158,11,0.08)"
            : "rgba(16,185,129,0.08)";

          if (!overlay.bbox || overlay.bbox.length < 4) return;
          const [c0, c1, c2, c3] = overlay.bbox;
          const isNormalized = Math.max(c0, c1, c2, c3) <= 1.05;
          const x = isNormalized ? Math.min(c0, c2) * width : c0;
          const y = isNormalized ? Math.min(c1, c3) * height : c1;
          const w = isNormalized ? Math.max(12, Math.abs(c2 - c0) * width) : c2;
          const h = isNormalized ? Math.max(12, Math.abs(c3 - c1) * height) : c3;

          const len = Math.max(4, Math.min(8, w / 4, h / 4));

          // HUD brackets
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len);
          ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
          ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
          ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
          ctx.stroke();

          // Backdrop
          ctx.fillStyle = fill;
          ctx.fillRect(x, y, w, h);

          // HUD Pill
          ctx.font = "bold 9px monospace";
          const labelText = overlay.label || overlay.type;
          const textW = ctx.measureText(labelText).width + 12;
          const pillY = Math.max(16, y - 4);

          ctx.fillStyle = stroke;
          ctx.beginPath();
          ctx.roundRect(x, pillY - 14, textW, 14, 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillText(labelText.toUpperCase().slice(0, 24), x + 6, pillY - 4);

          // Crosshairs for violation
          if (isViolation) {
            ctx.strokeStyle = "rgba(239,68,68,0.3)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
            ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
            ctx.stroke();
          }
        });
      }
    };

    // Check if an image URL exists for active aspect
    const activeImageDetail = evidence?.images?.[activeAspect];
    if (activeImageDetail?.url && !activeImageDetail.url.startsWith("mock://")) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = activeImageDetail.url;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        ctx.fillStyle = "rgba(2, 6, 23, 0.4)";
        ctx.fillRect(0, 0, width, height);
        drawOverlays();
      };
      img.onerror = () => {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#020617");
        grad.addColorStop(1, "#0f172a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        drawOverlays();
      };
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#020617");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      drawOverlays();
    }
  }, [loading, hasLive, filteredOverlays, activeAspect, evidence]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
      </div>
    );
  }

  const validCount = liveOverlays.filter((o) => o.type === "VALID").length;
  const violationCount = liveOverlays.filter((o) => o.type === "VIOLATION").length;
  const reviewCount = liveOverlays.filter((o) => o.type === "REVIEW").length;

  return (
    <div className="p-4 sm:p-6 xl:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1 font-mono">
            <span>Inspection #{id?.slice(-6) || "TARGET"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500 dark:text-amber-300 font-bold">Defect Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400 dark:text-amber-300" />
            Visual Evidence Canvas
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            Spatial defect highlights: 🟢 Valid ({validCount}) · 🔴 Violation ({violationCount}) · 🟡 Review ({reviewCount})
          </p>
        </div>
        <button
          id="go-to-report-btn"
          onClick={() => navigate(`/inspection/${id || "mock-001"}/report`)}
          className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-lg shadow-neutral-500/10 cursor-pointer"
        >
          View Full Notice <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Aspect Filter */}
        <div className="flex gap-2">
          {(["front", "back", "side"] as const).map((aspect) => (
            <button
              key={aspect}
              onClick={() => setActiveAspect(aspect)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeAspect === aspect
                  ? "bg-amber-500 text-white shadow-md shadow-amber-400/30"
                  : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              }`}
            >
              {aspect}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 flex-wrap">
          {[
            { cls: "bg-emerald-500", label: `Compliant (${validCount})` },
            { cls: "bg-red-500", label: `Violation (${violationCount})` },
            { cls: "bg-amber-500", label: `Review (${reviewCount})` },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-xs font-mono text-neutral-700 dark:text-neutral-300">
              <div className={`w-3 h-3 rounded-sm ${l.cls}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Canvas */}
        <div className="xl:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="relative rounded-xl overflow-hidden bg-neutral-950 flex items-center justify-center py-6">
            <canvas ref={canvasRef} className="w-full max-w-sm h-auto object-contain rounded shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ display: "block" }} />
            <div className="absolute top-4 right-4 bg-neutral-900/90 border border-neutral-700/60 backdrop-blur-md text-neutral-300 text-[10px] font-mono font-bold px-3 py-1 rounded-lg shadow-lg">
              {filteredOverlays.length} Spatial Overlays
            </div>
          </div>
          <p className="text-xs font-mono text-neutral-500 text-center">
            HUD coordinate matrix mapped against high-resolution physical packaging scan.
          </p>
        </div>

        {/* Breakdown panels */}
        <div className="xl:col-span-2 space-y-4">
          {liveViolations.length > 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Statutory Violations ({liveViolations.length})
              </h3>
              <div className="space-y-2">
                {liveViolations.map((v, i) => (
                  <div key={i} className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-red-500 text-white shadow-sm">
                        {v.code}
                      </span>
                      <span className="text-xs font-mono font-bold text-red-700 dark:text-red-300">
                        {v.rule}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono">Zero Critical Violations</p>
              <p className="text-xs text-neutral-500 mt-1 font-mono">
                Packaging complies with verified mandatory declarations.
              </p>
            </div>
          )}

          {/* Overlays List */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Spatial Highlights ({filteredOverlays.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
              {filteredOverlays.map((o, i) => {
                const isViol = o.type === "VIOLATION";
                return (
                  <div
                    key={i}
                    className={`px-4 py-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isViol
                        ? "bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                        : "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    <span className="truncate font-semibold text-sm">{o.label || o.type}</span>
                    <span className="text-xs uppercase font-bold px-2.5 py-1 rounded-md bg-white/60 dark:bg-neutral-800/80 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50">
                      {o.image_type || "aspect"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

