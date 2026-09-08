import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import NewInspectionPage from "@/pages/NewInspectionPage";
import AIAnalysisPage from "@/pages/AIAnalysisPage";
import CompliancePage from "@/pages/CompliancePage";
import EvidencePage from "@/pages/EvidencePage";
import ReportPage from "@/pages/ReportPage";
import HistoryPage from "@/pages/HistoryPage";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/inspection/new"
          element={<ProtectedRoute><NewInspectionPage /></ProtectedRoute>}
        />
        <Route
          path="/inspection/history"
          element={<ProtectedRoute><HistoryPage /></ProtectedRoute>}
        />
        <Route
          path="/inspection/:id/ai-analysis"
          element={<ProtectedRoute><AIAnalysisPage /></ProtectedRoute>}
        />
        <Route
          path="/inspection/:id/compliance"
          element={<ProtectedRoute><CompliancePage /></ProtectedRoute>}
        />
        <Route
          path="/inspection/:id/evidence"
          element={<ProtectedRoute><EvidencePage /></ProtectedRoute>}
        />
        <Route
          path="/inspection/:id/report"
          element={<ProtectedRoute><ReportPage /></ProtectedRoute>}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
