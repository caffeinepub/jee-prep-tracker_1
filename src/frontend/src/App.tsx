import { Toaster } from "@/components/ui/sonner";
import {
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  Menu,
  Rocket,
  Timer,
  X,
} from "lucide-react";
import { useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useBackendSync } from "./hooks/useBackendSync";
import DailyTracker from "./pages/DailyTracker";
import Dashboard from "./pages/Dashboard";
import MissionJeet from "./pages/MissionJeet";
import Syllabus from "./pages/Syllabus";
import TimerPage from "./pages/Timer";

type Page = "dashboard" | "missionjeet" | "syllabus" | "timer" | "dailytracker";

const NAV = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "missionjeet" as Page, label: "Mission Jeet", icon: Rocket },
  { id: "syllabus" as Page, label: "Syllabus", icon: BookOpen },
  { id: "timer" as Page, label: "Timer", icon: Timer },
  { id: "dailytracker" as Page, label: "Daily Tracker", icon: CheckSquare },
];

function SyncIndicator({
  status,
}: { status: ReturnType<typeof useBackendSync>["syncStatus"] }) {
  if (status === "idle") return null;

  let dotColor = "";
  let label = "";
  let glowColor = "";

  switch (status) {
    case "loading":
      dotColor = "bg-sky-400";
      glowColor = "rgba(56,189,248,0.6)";
      label = "Loading data...";
      break;
    case "saving":
      dotColor = "bg-amber-400";
      glowColor = "rgba(251,191,36,0.6)";
      label = "Saving...";
      break;
    case "synced":
      dotColor = "bg-emerald-400";
      glowColor = "rgba(52,211,153,0.6)";
      label = "✓ Saved";
      break;
    case "error":
      dotColor = "bg-gray-400";
      glowColor = "rgba(156,163,175,0.5)";
      label = "Offline";
      break;
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
      data-ocid="sync.status"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColor} ${
          status === "saving" || status === "loading" ? "animate-pulse" : ""
        }`}
        style={{ boxShadow: `0 0 5px ${glowColor}` }}
      />
      <span
        className={
          status === "saving"
            ? "text-amber-300"
            : status === "synced"
              ? "text-emerald-300"
              : status === "error"
                ? "text-gray-400"
                : "text-sky-300"
        }
      >
        {label}
      </span>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const { syncStatus } = useBackendSync();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full header-glow"
        style={{
          background: "rgba(10, 13, 28, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,212,224,0.12)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="font-display font-bold text-lg tracking-tight gradient-text">
              AIR PREP
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                data-ocid={`nav.${n.id}.link`}
                onClick={() => setPage(n.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === n.id
                    ? "text-primary"
                    : "text-foreground/50 hover:text-foreground/90 hover:bg-white/5"
                }`}
                style={
                  page === n.id
                    ? {
                        background: "rgba(0,212,224,0.1)",
                        boxShadow: "0 0 12px rgba(0,212,224,0.15)",
                        border: "1px solid rgba(0,212,224,0.2)",
                      }
                    : {}
                }
              >
                <n.icon className="w-4 h-4" />
                {n.label}
              </button>
            ))}
          </nav>

          {/* Right side: sync indicator + mobile menu button */}
          <div className="flex items-center gap-2">
            <SyncIndicator status={syncStatus} />

            {/* Mobile menu button */}
            <button
              type="button"
              data-ocid="nav.mobile.toggle"
              aria-label="Toggle menu"
              className="md:hidden text-foreground/60 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 pt-2"
            style={{ borderTop: "1px solid rgba(0,212,224,0.1)" }}
          >
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                data-ocid={`nav.mobile.${n.id}.link`}
                onClick={() => {
                  setPage(n.id);
                  setMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mt-1 transition-all ${
                  page === n.id
                    ? "text-primary"
                    : "text-foreground/50 hover:text-foreground/90 hover:bg-white/5"
                }`}
                style={
                  page === n.id
                    ? {
                        background: "rgba(0,212,224,0.1)",
                        border: "1px solid rgba(0,212,224,0.2)",
                      }
                    : {}
                }
              >
                <n.icon className="w-4 h-4" />
                {n.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main — ALL pages stay mounted; only display toggles */}
      <main className="flex-1">
        {/* Each page is always mounted but hidden when not active.
            This prevents React from unmounting components on navigation,
            which was causing timer and tracker state to reset. */}
        <div style={{ display: page === "dashboard" ? "block" : "none" }}>
          <Dashboard onNavigate={setPage} />
        </div>
        <div style={{ display: page === "missionjeet" ? "block" : "none" }}>
          <MissionJeet onNavigate={setPage} />
        </div>
        <div style={{ display: page === "syllabus" ? "block" : "none" }}>
          <Syllabus />
        </div>
        <div style={{ display: page === "timer" ? "block" : "none" }}>
          <ErrorBoundary>
            <TimerPage />
          </ErrorBoundary>
        </div>
        <div style={{ display: page === "dailytracker" ? "block" : "none" }}>
          <DailyTracker />
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-center py-5 text-sm text-muted-foreground mt-8"
        style={{ borderTop: "1px solid rgba(0,212,224,0.08)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster />
    </div>
  );
}
