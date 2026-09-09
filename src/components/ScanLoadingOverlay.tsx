import { useEffect, useState } from "react";
import { Cpu, ShieldCheck, Database, Layers, Sparkles, CheckCircle2 } from "lucide-react";

interface ScanLoadingOverlayProps {
  previews: { front: string | null; back: string | null; side: string | null };
  productName?: string;
}

const TELEMETRY_LOGS = [
  "⚡ Initializing Neural Tensor Engine v4.2...",
  "📦 Pre-processing 3-aspect packaging telemetry...",
  "☁️ Uploading payloads to secure encrypted storage...",
  "🔍 Running PaddleOCR text recognition on Front Aspect...",
  "📐 Detecting text bounding boxes [x, y, w, h]...",
  "🏷️ Extracting Maximum Retail Price (MRP) & Currency Tag...",
  "📅 Parsing Manufacturing & Expiry date timestamps...",
  "🏭 Resolving Manufacturer Name & Registered Entity...",
  "📞 Auditing Customer Helpline & Support Declarations...",
  "🌐 Verifying Country of Origin against Legal Metrology Act...",
  "⚖️ Executing FSSAI & Legal Metrology Rule Matrix (30+ checks)...",
  "🛡️ Synthesizing compliance defect vector & legal certificate...",
];

export default function ScanLoadingOverlay({ previews, productName }: ScanLoadingOverlayProps) {
  const [progress, setProgress] = useState(12);
  const [logIndex, setLogIndex] = useState(0);
  const [activeAspectIndex, setActiveAspectIndex] = useState(0);
  const aspects: Array<"front" | "back" | "side"> = ["front", "back", "side"];

  // Smooth progress increment
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        const jump = Math.floor(Math.random() * 6) + 2;
        return Math.min(98, prev + jump);
      });
    }, 450);

    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev < TELEMETRY_LOGS.length - 1 ? prev + 1 : prev));
    }, 1100);

    const aspectInterval = setInterval(() => {
      setActiveAspectIndex((prev) => (prev + 1) % 3);
    }, 1800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      clearInterval(aspectInterval);
    };
  }, []);

  const currentAspect = aspects[activeAspectIndex];
  const currentPreview = previews[currentAspect];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/95 backdrop-blur-xl overflow-hidden font-sans select-none">
      {/* Dynamic Background Glows & Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)] opacity-70 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Main Scanner Container */}
      <div className="relative w-full max-w-2xl bg-neutral-900/90 border border-neutral-800/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.15)] flex flex-col items-center overflow-hidden">
        {/* Top Scanning Laser Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-pulse" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between w-full mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-widest font-mono uppercase">
                  Neural Vision Pipeline
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[240px] sm:max-w-xs">
                {productName || "Target Commodity Scan"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tighter">
              {progress}%
            </div>
            <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
              Processing
            </p>
          </div>
        </div>

        {/* Central Visual Telemetry Zone */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-2">
          {/* Left: Interactive Aspect Preview with Laser Sweep */}
          <div className="relative aspect-[4/3] rounded-2xl border border-amber-500/30 bg-neutral-950 overflow-hidden flex items-center justify-center shadow-inner group">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt="Target Aspect"
                className="w-full h-full object-cover opacity-80 filter brightness-105 contrast-110"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-neutral-600">
                <Layers className="w-8 h-8 animate-pulse text-amber-400/50" />
                <span className="text-xs font-mono">Analyzing Frame...</span>
              </div>
            )}

            {/* Matrix HUD Overlay over image */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.08)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

            {/* Sweeping Laser Beam */}
            <div
              className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(245,158,11,1)] pointer-events-none animate-[scanline_2.2s_easeInOut_infinite]"
              style={{
                animation: "scanline 2s ease-in-out infinite alternate",
              }}
            />

            {/* Target Reticle corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

            {/* Aspect Tag */}
            <div className="absolute bottom-3 left-3 bg-neutral-900/90 border border-amber-500/40 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              Scanning: {currentAspect.toUpperCase()} ASPECT
            </div>
          </div>

          {/* Right: Radar Cybernetic Orbital Visualizer */}
          <div className="relative flex flex-col items-center justify-center p-4">
            <div className="relative w-40 h-40 rounded-full border border-amber-500/30 overflow-hidden bg-neutral-950/80 shadow-[0_0_40px_rgba(245,158,11,0.2)] flex items-center justify-center">
              {/* Radar Grid Circles */}
              <div className="absolute inset-2 rounded-full border border-neutral-800" />
              <div className="absolute inset-8 rounded-full border border-neutral-800" />
              <div className="absolute inset-14 rounded-full border border-amber-500/20" />

              {/* Grid Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-neutral-800" />
                <div className="h-full w-[1px] bg-neutral-800 absolute" />
              </div>

              {/* Rotating Radar Conic Sweep */}
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,transparent_75%,rgba(245,158,11,0.45)_100%)] rounded-full animate-[spin_2s_linear_infinite]" />

              {/* Counter-rotating Outer Dash Ring */}
              <div className="absolute inset-1 rounded-full border border-dashed border-amber-400/30 animate-[spin_8s_linear_infinite_reverse]" />

              {/* Center Core Node */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>

              {/* Simulated target blip nodes */}
              <div className="absolute top-8 right-10 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute bottom-10 left-8 w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDelay: "0.7s" }} />
            </div>

            {/* Quick 3-Aspect Mini Indicators */}
            <div className="flex gap-2 mt-4">
              {aspects.map((asp, idx) => (
                <div
                  key={asp}
                  className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all duration-300 flex items-center gap-1 ${
                    idx === activeAspectIndex
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30 scale-105"
                      : "bg-neutral-800/80 text-neutral-400 border border-neutral-700"
                  }`}
                >
                  {idx <= activeAspectIndex ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-neutral-600" />}
                  {asp}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full mt-4 space-y-2">
          <div className="h-2 w-full bg-neutral-800/80 rounded-full overflow-hidden p-0.5 border border-neutral-700/50">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Live Streaming Terminal Logs */}
        <div className="w-full mt-4 bg-neutral-950/90 border border-neutral-800 rounded-2xl p-3.5 font-mono text-xs overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest pb-2 mb-2 border-b border-neutral-800/80">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-amber-400" />
              OCR TELEMETRY STREAM
            </span>
            <span className="text-emerald-400 font-bold">● LIVE INFERENCE</span>
          </div>

          <div className="space-y-1.5 max-h-20 overflow-y-auto">
            {TELEMETRY_LOGS.slice(0, logIndex + 1).slice(-3).map((log, i, arr) => {
              const isLatest = i === arr.length - 1;
              return (
                <div
                  key={log}
                  className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                    isLatest
                      ? "text-amber-300 font-bold translate-x-1"
                      : "text-neutral-500 opacity-60"
                  }`}
                >
                  <span className="text-neutral-600 text-[10px] select-none">&gt;</span>
                  <span className="truncate">{log}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0%; opacity: 0.2; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
