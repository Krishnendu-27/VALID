import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ScanText, ChevronRight, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { inspectionApi, type EvidenceData } from "@/api/inspection";

export default function AIAnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState<EvidenceData | null>(null);
  const [activeImage, setActiveImage] = useState<"front" | "back" | "side">("front");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!id) return;
      try {
        const res = await inspectionApi.getEvidence(id);
        if (isMounted && res.data?.data) {
          setEvidence(res.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch live evidence, using mock fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [id]);

  // Current image details from live evidence
  const imgDetail = evidence?.images?.[activeImage];
  const rawBoxes = useMemo(() => imgDetail?.raw_ocr_boxes || [], [imgDetail]);
  const hasLiveBoxes = rawBoxes.length > 0;

  // Draw bounding boxes on canvas
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

    // Resolve status color based on box.status field or confidence fallback
    const getBoxColors = (box: typeof rawBoxes[0]) => {
      const s = (box as { status?: string }).status?.toLowerCase();
      if (s === "compliant" || s === "pass" || s === "ok" || (!s && box.confidence >= 0.8)) {
        return { stroke: "rgba(34,197,94,0.95)", fill: "rgba(34,197,94,0.08)", text: "rgba(34,197,94,0.95)", label: "COMPLIANT" };
      }
      if (s === "violation" || s === "fail" || s === "error" || (!s && box.confidence < 0.5)) {
        return { stroke: "rgba(239,68,68,0.95)", fill: "rgba(239,68,68,0.08)", text: "rgba(239,68,68,0.95)", label: "VIOLATION" };
      }
      // review / warning
      return { stroke: "rgba(234,179,8,0.95)", fill: "rgba(234,179,8,0.08)", text: "rgba(234,179,8,0.95)", label: "REVIEW" };
    };

    const drawHudOverlays = () => {
      // Subtle HUD grid lines
      ctx.strokeStyle = "rgba(99,102,241,0.08)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      if (hasLiveBoxes) {
        rawBoxes.forEach((box) => {
          if (!box.bbox || box.bbox.length < 4) return;
          const [c0, c1, c2, c3] = box.bbox;
          const isNormalized = Math.max(c0, c1, c2, c3) <= 1.05;
          const x = isNormalized ? Math.min(c0, c2) * width : c0;
          const y = isNormalized ? Math.min(c1, c3) * height : c1;
          const w = isNormalized ? Math.abs(c2 - c0) * width : c2;
          const h = isNormalized ? Math.abs(c3 - c1) * height : c3;
          const len = Math.max(4, Math.min(8, w / 4, h / 4));
          const colors = getBoxColors(box);

          // Backdrop tint
          ctx.fillStyle = colors.fill;
          ctx.fillRect(x, y, w, h);

          // Full border (thin)
          ctx.strokeStyle = colors.stroke.replace("0.95", "0.35");
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, w, h);

          // Corner brackets (thick + bright)
          ctx.strokeStyle = colors.stroke;
          ctx.lineWidth = 2;
          ctx.beginPath();
          // Top-Left
          ctx.moveTo(x + len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + len);
          // Top-Right
          ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
          // Bottom-Left
          ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
          // Bottom-Right
          ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
          ctx.stroke();

          // Status pill background
          const pillText = colors.label;
          ctx.font = "bold 8px monospace";
          const pillW = ctx.measureText(pillText).width + 8;
          const pillH = 13;
          ctx.fillStyle = colors.stroke.replace("0.95", "0.85");
          ctx.beginPath();
          ctx.roundRect(x, y - pillH - 1, pillW, pillH, 2);
          ctx.fill();

          // Status pill text
          ctx.fillStyle = "rgba(0,0,0,0.9)";
          ctx.font = "bold 8px monospace";
          ctx.fillText(pillText, x + 4, y - 4);

          // OCR text label below pill
          ctx.fillStyle = colors.text;
          ctx.font = "9px monospace";
          ctx.fillText(box.text.slice(0, 28), x + 3, y + 12);
        });
      }
    };

    // If image has real URL, draw it
    if (imgDetail?.url && !imgDetail.url.startsWith("mock://")) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgDetail.url;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        // Dim packaging slightly so cyan HUD pops
        ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
        ctx.fillRect(0, 0, width, height);
        drawHudOverlays();
      };
      img.onerror = () => {
        // Dark background fallback
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#020617");
        grad.addColorStop(1, "#0f172a");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
        drawHudOverlays();
      };
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#020617");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      drawHudOverlays();
    }
  }, [loading, activeImage, evidence, hasLiveBoxes, imgDetail, rawBoxes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
        <p className="text-neutral-400 text-sm font-mono">Querying neural OCR telemetry…</p>
      </div>
    );
  }

  // Combine extracted fields for view
  const merged = evidence?.merged_fields;
  const extractedList = merged
    ? Object.entries(merged)
        .filter(([, v]) => v?.text)
        .map(([k, v]) => `${k.toUpperCase()}: ${v?.text}`)
        .join("\n")
    : "No OCR data extracted.";

  const displayCount = rawBoxes.length;

  return (
    <div className="p-4 sm:p-6 xl:px-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1 font-mono">
            <span>Inspection #{id?.slice(-6) || "TARGET"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-amber-500 dark:text-amber-300 font-bold">Neural OCR Analysis</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <ScanText className="w-6 h-6 text-amber-400 dark:text-amber-300" />
            AI Aspect Analysis
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            {displayCount} optical regions mapped · Telemetry extracted
          </p>
        </div>
        <button
          id="go-to-compliance-btn"
          onClick={() => navigate(`/inspection/${id || "mock-001"}/compliance`)}
          className="flex items-center gap-2 bg-white text-black dark:text-black border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-200 text-white text-xs font-mono font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg shadow-neutral-500/10 cursor-pointer hover:scale-[1.02]"
        >
          Evaluate Compliance <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Canvas */}
        <div className="xl:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3 shadow-sm">
          {/* Aspect picker */}
          <div className="flex flex-wrap gap-2 items-center">
            {(["front", "back", "side"] as const).map((s) => {
              const count = evidence?.images?.[s]?.raw_ocr_boxes?.length;
              return (
                <button
                  key={s}
                  onClick={() => setActiveImage(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold capitalize transition-all border-b-2 ${
                    activeImage === s
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-400/40 border-amber-300 scale-[1.02]"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border-transparent"
                  }`}
                >
                  {s} {count !== undefined ? `(${count})` : ""}
                </button>
              );
            })}
            <span className="ml-auto text-xs font-mono text-neutral-400">
              {displayCount} regions detected
            </span>
          </div>

          {/* Canvas render */}
          <div className="relative rounded-2xl overflow-hidden bg-neutral-950 flex items-center justify-center py-6">
            <canvas
              ref={canvasRef}
              className="w-full max-w-sm h-auto object-contain rounded shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              style={{ display: "block" }}
            />
            {/* Overlay label */}
            <div className="absolute top-4 right-4 bg-neutral-900/90 border border-amber-500/30 backdrop-blur-md text-amber-400 text-[10px] font-mono font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3 h-3 animate-spin text-amber-400" />
              <span>LIVE OCR FEED ACTIVE</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3 text-xs text-neutral-500 font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-emerald-500 bg-emerald-500/15" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-red-500 bg-red-500/15" />
              <span className="text-red-600 dark:text-red-400 font-bold">Violation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-yellow-500 bg-yellow-500/15" />
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">Review</span>
            </div>
            {imgDetail?.url && (
              <div className="flex items-center gap-1.5 ml-auto text-neutral-400">
                <ImageIcon className="w-3 h-3 text-amber-300" />
                <span className="truncate max-w-[200px]">{imgDetail.filename || "Aspect photo loaded"}</span>
              </div>
            )}
          </div>
        </div>

        {/* OCR Text + Regions */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Normalized Semantic Output
            </h3>
            <pre className="text-xs text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/80 shadow-inner">
              {extractedList}
            </pre>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
              Spatial Tokens ({displayCount})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs">
              {rawBoxes.map((box, i) => {
                const s = (box as { status?: string }).status?.toLowerCase();
                const isCompliant = s === "compliant" || s === "pass" || s === "ok" || (!s && box.confidence >= 0.8);
                const isViolation = s === "violation" || s === "fail" || s === "error" || (!s && box.confidence < 0.5);
                const statusLabel = isCompliant ? "C" : isViolation ? "V" : "R";
                const dotCls = isCompliant
                  ? "bg-emerald-500"
                  : isViolation
                  ? "bg-red-500"
                  : "bg-yellow-400";
                const badgeCls = isCompliant
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                  : isViolation
                  ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
                  : "bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-400/20";
                const borderCls = isCompliant
                  ? "border-emerald-100 dark:border-emerald-500/20"
                  : isViolation
                  ? "border-red-100 dark:border-red-500/20"
                  : "border-yellow-100 dark:border-yellow-400/20";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950/60 border ${borderCls}`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
                    <span className="text-neutral-700 dark:text-neutral-300 truncate font-semibold flex-1">
                      {box.text}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider flex-shrink-0 ${badgeCls}`}>
                      {statusLabel}
                    </span>
                    <span className="text-neutral-400 flex-shrink-0 text-[10px] min-w-[28px] text-right font-bold">
                      {Math.round(box.confidence * 100)}%
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

