import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  ClipboardList,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inspection/new", icon: ClipboardList, label: "New Inspection" },
  { to: "/inspection/history", icon: History, label: "History" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-neutral-200 dark:border-neutral-800 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-400/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-base font-black text-neutral-900 dark:text-white tracking-tight leading-none">VALID</p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Compliance Platform</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + "/");
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active
                  ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-400/30"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-indigo-600 dark:text-indigo-300" : "text-neutral-500 group-hover:text-neutral-300"}`} />
              {!collapsed && label}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle & User block */}
      <div className="px-3 pb-4 border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-1">
        <NavLink
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-sm active:scale-95 group ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? `${user?.name || "Officer"} - View Profile` : undefined}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "Officer DP"}
              className="w-8 h-8 rounded-lg object-cover border border-amber-400/40 shadow-sm flex-shrink-0 group-hover:ring-2 group-hover:ring-amber-400/50 group-hover:ring-offset-1 group-hover:ring-offset-neutral-50 dark:group-hover:ring-offset-neutral-900 transition-all duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm group-hover:ring-2 group-hover:ring-amber-400/50 group-hover:ring-offset-1 group-hover:ring-offset-neutral-50 dark:group-hover:ring-offset-neutral-900 transition-all duration-300">
              {initials}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate group-hover:text-amber-500 dark:group-hover:text-amber-300 transition-colors">
                {user?.name || "Officer"}
              </p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                {user?.email}
              </p>
            </div>
          )}
        </NavLink>

        {/* Theme Toggle Button (moved below profile for better alignment with logout) */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Toggle Theme" : undefined}
        >
          {theme === "light" ? (
            <Moon className="w-4.5 h-4.5 text-neutral-500 flex-shrink-0" />
          ) : (
            <Sun className="w-4.5 h-4.5 text-neutral-400 flex-shrink-0" />
          )}
          {!collapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
        </button>
        <button
          id="logout-btn"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-white overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 flex-shrink-0 relative
          ${collapsed ? "w-16" : "w-56"}`}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight className="w-3 h-3 text-neutral-400" /> : <ChevronLeft className="w-3 h-3 text-neutral-400" />}
        </button>
      </aside>

      {/* Sidebar — mobile */}
      <aside
        className={`fixed left-0 top-0 h-full w-56 flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 transition-transform duration-300 lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <Menu className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-300" />
              <span className="text-sm font-bold text-neutral-900 dark:text-white">VALID</span>
            </div>
          </div>
          <NavLink to="/profile" className="flex items-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover border border-amber-400/30"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                {initials}
              </div>
            )}
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-950">
          {children}
        </main>
      </div>
    </div>
  );
}
