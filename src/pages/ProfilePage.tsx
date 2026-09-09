import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth";
import { BACKEND_CONFIGURED } from "@/api/api";
import { User, Mail, Pencil, Save, Loader2, Camera, Shield, Phone, Hash, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const userId = user?.id || user?._id;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "Officer",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !BACKEND_CONFIGURED) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true);
    authApi.getProfile(userId)
      .then((res) => {
        const u = res.data?.data || res.data;
        if (u) {
          setForm({
            name: u.name || user?.name || "",
            email: u.email || user?.email || "",
            phone: u.phone || user?.phone || "",
          });
          if (u.avatarUrl) setAvatarPreview(u.avatarUrl);
          setUser({
            ...user!,
            name: u.name || user?.name,
            email: u.email || user?.email,
            phone: u.phone,
            avatarUrl: u.avatarUrl,
            officerId: u.officerId || user?.officerId,
          });
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote profile:", err);
      })
      .finally(() => {
        setFetching(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (user?.avatarUrl && !avatarFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvatarPreview(user.avatarUrl);
    }
  }, [user?.avatarUrl, avatarFile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setError("Active session identifier not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let payload: Record<string, unknown> | FormData;
      if (avatarFile) {
        const data = new FormData();
        data.append("name", form.name);
        if (form.phone) data.append("phone", form.phone);
        data.append("profileImage", avatarFile);
        payload = data;
      } else {
        payload = {
          name: form.name,
          phone: form.phone,
        };
      }

      const res = await authApi.updateProfile(userId, payload);
      const updatedUser = res.data?.data || res.data;

      setUser({
        ...user!,
        name: updatedUser?.name || form.name,
        phone: updatedUser?.phone || form.phone,
        avatarUrl: updatedUser?.avatarUrl || avatarPreview || user?.avatarUrl,
      });

      if (updatedUser?.avatarUrl) {
        setAvatarPreview(updatedUser.avatarUrl);
      }
      setAvatarFile(null);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      setError(e.response?.data?.message || e.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = (form.name || "OF")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Officer Profile</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">
            Credentialed Enforcement Officer Credentials
          </p>
        </div>
        {fetching && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Syncing Profile...
          </div>
        )}
      </div>

      {/* Avatar card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
        <div className="relative group">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt={form.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/30 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {initials}
            </div>
          )}
          <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 dark:bg-neutral-700 dark:border-neutral-600 flex items-center justify-center hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors cursor-pointer shadow-sm">
            <Camera className="w-3.5 h-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{form.name}</h2>
            {user?.officerId && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                <Hash className="w-2.5 h-2.5 text-amber-300" />
                {user.officerId}
              </span>
            )}
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-mono mt-0.5">{form.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-400/20">
              <Shield className="w-3 h-3" />
              Verified Enforcement Authority
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Account Credentials</h3>
          {!editing && (
            <button
              id="edit-profile-btn"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-amber-500 dark:text-amber-300 hover:text-amber-400 dark:hover:text-amber-200 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3.5 flex items-center gap-2.5 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          <input
            value={form.name}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 dark:bg-neutral-800/60 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          />
        </div>

        <div>
          <label className="flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Officer Email Address
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">Immutable System Key</span>
          </label>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full bg-neutral-100/70 border border-neutral-200 dark:bg-neutral-800/40 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-neutral-500 dark:text-neutral-400 text-sm cursor-not-allowed opacity-80"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
            <Phone className="w-3.5 h-3.5" /> Official Contact Number
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 dark:bg-neutral-800/60 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
          />
        </div>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-xs font-semibold">
            Officer profile synchronized with backend cluster!
          </div>
        )}

        {editing && (
          <div className="flex gap-3 pt-2">
            <button
              id="save-profile-btn"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-400 hover:to-violet-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-md shadow-neutral-500/10"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setForm({
                  name: user?.name ?? "Officer",
                  email: user?.email ?? "",
                  phone: user?.phone ?? "",
                });
                setAvatarFile(null);
                setAvatarPreview(user?.avatarUrl ?? null);
              }}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
