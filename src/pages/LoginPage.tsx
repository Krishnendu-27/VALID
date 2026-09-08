import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Loader2, Cpu, UserPlus, LogIn } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    officerId: "",
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!form.officerId || !form.name || !form.email || !form.password) {
          setError("All required fields must be completed.");
          setLoading(false);
          return;
        }
        const regRes = await authApi.register({
          officerId: form.officerId,
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
        });

        if (regRes.data?.success) {
          // After register, automatically log in
          const loginRes = await authApi.login({ email: form.email, password: form.password });
          if (loginRes.data?.token) {
            login(loginRes.data.token, loginRes.data.user);
            navigate("/dashboard");
            return;
          }
        }
      } else {
        const res = await authApi.login({ email: form.email, password: form.password });
        if (res.data?.token) {
          const loggedUser = res.data.user;
          try {
            const profileRes = await authApi.getProfile(loggedUser.id);
            const full = profileRes.data?.data || profileRes.data;
            if (full) {
              login(res.data.token, {
                ...loggedUser,
                avatarUrl: full.avatarUrl,
                phone: full.phone,
              });
              navigate("/dashboard");
              return;
            }
          } catch {
            // fallback
          }
          login(res.data.token, loggedUser);
          navigate("/dashboard");
          return;
        } else {
          setError(res.data?.message || "Invalid credentials.");
        }
      }
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      console.error("Auth error:", err);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Connection failure. Ensure backend service is reachable.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-400/10 blur-[120px] animate-pulse duration-[6000ms]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse duration-[8000ms]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Glow */}
        <div className="absolute -inset-0.5 bg-white text-black dark:text-black border border-neutral-200 dark:border-neutral-700 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />

        <div className="relative bg-neutral-900/80 backdrop-blur-xl border border-neutral-700/40 rounded-2xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden">
          {/* Scanning laser line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60 animate-[bounce_4s_infinite]" />

          {/* Logo / Brand Header */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-500 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-400/30 mb-3 relative group">
              <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShieldCheck className="w-9 h-9 text-white animate-pulse" />
            </div>

            <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-amber-400">
              VALID
            </h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-amber-400 text-xs font-mono tracking-widest uppercase">
                Compliance Gateway
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-neutral-950/80 p-1 border border-neutral-800 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-lg transition-all ${!isRegister
                  ? "bg-amber-500 text-white shadow"
                  : "text-neutral-400 hover:text-white"
                }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-bold rounded-lg transition-all ${isRegister
                  ? "bg-amber-500 text-white shadow"
                  : "text-neutral-400 hover:text-white"
                }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Officer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {isRegister && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                    Officer ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.officerId}
                    onChange={(e) => setForm({ ...form, officerId: e.target.value })}
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
                    placeholder="e.g. OFF_501"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
                    placeholder="Officer Name"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                Operator Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
                placeholder="operator@valid.sys"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                Access Code / Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all pr-10 font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 tracking-wider uppercase mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all font-mono"
                  placeholder="9876543210"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5 text-red-400 text-xs font-mono">
                [ALERT]: {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black dark:text-black border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-200 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-400/25 hover:shadow-amber-400/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3 uppercase tracking-widest text-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  {isRegister ? "Creating Officer Account…" : "Authenticating…"}
                </>
              ) : isRegister ? (
                "Complete Officer Registration"
              ) : (
                "Initialize Session"
              )}
            </button>
          </form>

          <div className="text-center mt-5 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CONNECTED TO RAILWAY BACKEND</span>
          </div>
        </div>
      </div>
    </div>
  );
}

