import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Camera, X, Loader2, ChevronRight, Focus, ShieldCheck, AlertCircle } from "lucide-react";
import { inspectionApi } from "@/api/inspection";

type Side = "front" | "back" | "side";
const SIDES: { key: Side; label: string; hint: string }[] = [
  { key: "front", label: "Front Aspect", hint: "Primary regulatory panel" },
  { key: "back", label: "Back Aspect", hint: "Nutritional matrix / ingredient deck" },
  { key: "side", label: "Lateral Aspect", hint: "UPC Barcode / secondary text" },
];

export default function NewInspectionPage() {
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [images, setImages] = useState<Record<Side, File | null>>({ front: null, back: null, side: null });
  const [previews, setPreviews] = useState<Record<Side, string | null>>({ front: null, back: null, side: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanStep(0);
      return;
    }
    const timer1 = setTimeout(() => setScanStep(1), 1500);
    const timer2 = setTimeout(() => setScanStep(2), 3000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [loading]);

  const handleDrop = useCallback((side: Side, files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImages((prev) => ({ ...prev, [side]: file }));
    setPreviews((prev) => ({ ...prev, [side]: url }));
    setError(null);
  }, []);

  const clearImage = (side: Side) => {
    if (previews[side]) URL.revokeObjectURL(previews[side]!);
    setImages((prev) => ({ ...prev, [side]: null }));
    setPreviews((prev) => ({ ...prev, [side]: null }));
  };

  const allUploaded = images.front && images.back && images.side;

  const handleSubmit = async () => {
    if (!allUploaded) return;
    setLoading(true);
    setError(null);

    try {
      const res = await inspectionApi.scan({
        front: images.front!,
        back: images.back!,
        side: images.side!,
        productName: productName.trim() || undefined,
      });

      const inspectionId =
        res.data?.data?.inspectionId ||
        res.data?.data?.inspection?._id;

      if (inspectionId) {
        navigate(`/inspection/${inspectionId}/ai-analysis`);
      } else {
        setError("Scan succeeded but no inspection ID was returned.");
      }
    } catch (err: unknown) {
      console.error("Scan error:", err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Inspection upload failed. Check network connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pb-24 bg-neutral-900/95 backdrop-blur-md">
          <style>{`
            @keyframes scanline {
              0% { top: -10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 110%; opacity: 0; }
            }
          `}</style>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-8 rounded-full border border-amber-400/30 overflow-hidden bg-neutral-900 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Radar sweep */}
              <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(99,102,241,0)_0%,rgba(99,102,241,0)_80%,rgba(99,102,241,0.6)_100%)] rounded-full animate-[spin_2s_linear_infinite]" />
              
              {/* Horizontal scan line */}
              <div className="absolute left-0 w-full h-[2px] bg-amber-400 shadow-[0_0_15px_rgba(34,211,238,0.9)]" style={{ animation: 'scanline 2s linear infinite' }} />
              
              {/* Center target */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Focus className="w-12 h-12 text-amber-400 opacity-80" />
              </div>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-6 font-mono animate-pulse">
              Scanning Images...
            </h2>
            <div className="flex flex-col items-center gap-5 font-mono text-xs uppercase tracking-widest">
              <p className={`transition-all duration-700 ${scanStep === 0 ? "text-amber-200 font-bold scale-105 animate-[pulse_2s_ease-in-out_infinite]" : "text-amber-400/50"}`}>
                {scanStep > 0 ? "Uploading to Secure Storage [OK]" : "Uploading to Secure Storage..."}
              </p>
              <p className={`transition-all duration-700 ${scanStep === 1 ? "text-amber-200 font-bold scale-105 animate-[pulse_2s_ease-in-out_infinite]" : scanStep > 1 ? "text-amber-400/50" : "opacity-0 translate-y-2"}`}>
                {scanStep > 1 ? "Running Neural OCR Pipeline [DONE]" : "Running Neural OCR Pipeline..."}
              </p>
              <p className={`transition-all duration-700 ${scanStep === 2 ? "text-amber-200 font-bold scale-105 animate-[pulse_2s_ease-in-out_infinite]" : "opacity-0 translate-y-2"}`}>
                Extracting Compliance Data...
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-amber-500 dark:text-amber-300 font-mono tracking-widest uppercase">
          <Focus className="w-3.5 h-3.5" />
          Image Capture Module
        </div>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">New Telemetry Scan</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Load high-resolution target elements to initialize multi-aspect OCR and compliance validation.
        </p>
      </div>

      {/* Product Name Input */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
        <label className="block text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
          Target Commodity / Product Name (Optional)
        </label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. Chamomile Lavender Herbal Tea"
          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-base text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
        />
      </div>

      {/* Upload cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SIDES.map(({ key, label, hint }) => (
          <DropZone
            key={key}
            side={key}
            label={label}
            hint={hint}
            preview={previews[key]}
            onDrop={(f) => handleDrop(key, f)}
            onClear={() => clearImage(key)}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 py-4 flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden">
        <div className="flex gap-4 flex-wrap sm:flex-nowrap flex-1">
          {SIDES.map(({ key, label }, i) => {
            const isCompleted = !!images[key];
            const isActive = i === SIDES.findIndex((s) => !images[s.key]);
            
            return (
              <div key={key} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : isActive
                      ? "bg-amber-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] ring-2 ring-amber-400/30 ring-offset-2 dark:ring-offset-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  0{i + 1}
                </div>
                <span className={`text-xs font-mono tracking-wide ${
                  isCompleted ? "text-emerald-600 dark:text-emerald-400 font-bold" 
                  : isActive ? "text-amber-500 dark:text-amber-300 font-bold" 
                  : "text-neutral-400"
                }`}>
                  {label}
                </span>
                {i < 2 && <ChevronRight className={`w-4 h-4 ml-1 ${isCompleted ? 'text-emerald-400' : 'text-neutral-300 dark:text-neutral-700'}`} />}
              </div>
            );
          })}
        </div>
        <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 md:ml-auto">
          SCAN READY STATUS: {Object.values(images).filter(Boolean).length} / 3 OBJECTS LOADED
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>[SCAN ERROR]: {error}</span>
        </div>
      )}

      <button
        id="start-inspection-btn"
        disabled={!allUploaded || loading}
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-neutral-200 font-bold py-4 rounded-full transition-all shadow-lg shadow-neutral-500/10 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest text-xs hover:scale-[1.01] cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4.5 h-4.5 animate-spin text-amber-200" />
            Uploading to Cloudinary & Running OCR Pipeline…
          </>
        ) : (
          <>
            <ShieldCheck className="w-4.5 h-4.5" /> Start Neural OCR Scan
          </>
        )}
      </button>

      {!allUploaded && (
        <p className="text-center font-mono text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 py-3 rounded-xl border border-amber-200 dark:border-amber-500/20">
          [ALERT]: All 3 aspect vectors must be loaded before scanning
        </p>
      )}
    </div>
    </>
  );
}


/* ── Drop Zone ─────────────────────────────── */
function DropZone({
  label, hint, preview, onDrop, onClear,
}: {
  side: Side; label: string; hint: string;
  preview: string | null; onDrop: (f: File[]) => void; onClear: () => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    disabled: !!preview,
  });

  return (
    <div className="relative group">
      {/* Holographic scanner border */}
      <div
        {...(preview ? {} : getRootProps())}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden aspect-[4/5] flex flex-col items-center justify-center
          ${isDragActive ? "border-amber-300 bg-amber-400/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]" : "border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"}
          ${preview ? "border-solid border-neutral-200 dark:border-neutral-800 cursor-default" : ""}`}
      >
        {/* Futuristic corners */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-neutral-300 dark:border-neutral-700 group-hover:border-amber-400 transition-colors" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-neutral-300 dark:border-neutral-700 group-hover:border-amber-400 transition-colors" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-neutral-300 dark:border-neutral-700 group-hover:border-amber-400 transition-colors" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-neutral-300 dark:border-neutral-700 group-hover:border-amber-400 transition-colors" />

        {!preview && <input {...getInputProps({ capture: "environment" })} />}
        
        {preview ? (
          <div className="relative w-full h-full">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            {/* Pulsing grid scan lines over preview */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-emerald-500 opacity-60 animate-[bounce_3s_infinite]" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-4 select-none">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center transition-transform group-hover:scale-110">
              <ImagePlus className={`hidden sm:block w-6 h-6 ${isDragActive ? "text-amber-500 dark:text-amber-300" : "text-neutral-400 dark:text-neutral-600"}`} />
              <Camera className={`block sm:hidden w-6 h-6 ${isDragActive ? "text-amber-500 dark:text-amber-300" : "text-neutral-400 dark:text-neutral-600"}`} />
            </div>
            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-300 font-mono uppercase tracking-wide">{label}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono uppercase tracking-widest text-center">{hint}</p>
            <span className="hidden sm:inline-block text-[9px] font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-700/50">
              FEED OVERLAY READY
            </span>
            <span className="inline-block sm:hidden text-[9px] font-mono bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-700/50 font-bold shadow-sm">
              TAP TO OPEN CAMERA
            </span>
          </div>
        )}

        {/* Aspect Tag */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded border backdrop-blur-md
            ${preview
              ? "bg-emerald-500/85 border-emerald-400/30 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              : "bg-neutral-100/90 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"}`}>
            {label}
          </span>
        </div>
      </div>
      
      {preview && (
        <button
          onClick={onClear}
          className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 dark:bg-neutral-950/90 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center hover:bg-red-500 hover:text-white dark:hover:bg-red-500/80 text-neutral-600 dark:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
