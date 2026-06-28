import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScreenProvider, useScreen, type Screen } from "@/contexts/ScreenContext";
import Landing from "@/screens/Landing";
import ProspectChat from "@/screens/ProspectChat";
import AccountBrief from "@/screens/AccountBrief";
import RoutingDecision from "@/screens/RoutingDecision";
import HandoffOutcome from "@/screens/HandoffOutcome";
import Dashboard from "@/screens/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const NAV_TABS: { id: Screen; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "prospect-chat", label: "Prospect Chat" },
  { id: "account-brief", label: "Account Brief" },
  { id: "routing", label: "Routing" },
  { id: "handoff", label: "Handoff" },
];

function Header() {
  const { currentScreen, setScreen, hasLeftLanding } = useScreen();
  const [hoveredTab, setHoveredTab] = useState<Screen | null>(null);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: "60px",
        background: "rgba(10, 14, 39, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0, 212, 255, 0.12)",
      }}
    >
      {/* Logo */}
      <button
        data-testid="button-logo-home"
        onClick={() => setScreen("landing")}
        className="flex-shrink-0 flex items-center gap-2 transition-all duration-300"
        style={{ color: "var(--db-accent)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "drop-shadow(0 0 8px rgba(0,212,255,0.6))";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "none";
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
          style={{
            background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(0,212,255,0.1))",
            border: "1px solid rgba(0,212,255,0.35)",
            color: "var(--db-accent)",
          }}
        >
          DB
        </div>
        <span
          className="text-xl font-semibold tracking-tight hidden sm:block"
          style={{ fontFamily: "var(--app-font-serif)", color: "var(--db-accent)" }}
        >
          DealBridge <span style={{ color: "var(--db-text-primary)" }}>AI</span>
        </span>
      </button>

      {/* Center tabs — always visible after leaving landing */}
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Main navigation"
        style={{
          opacity: hasLeftLanding ? 1 : 0,
          pointerEvents: hasLeftLanding ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      >
        {NAV_TABS.map((tab) => {
          const isActive = currentScreen === tab.id;
          const isHovered = hoveredTab === tab.id;
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setScreen(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
              style={{
                color: isActive
                  ? "var(--db-accent)"
                  : isHovered
                  ? "var(--db-text-primary)"
                  : "var(--db-text-secondary)",
                background: isActive
                  ? "rgba(0, 212, 255, 0.07)"
                  : isHovered
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                textShadow: isActive || isHovered
                  ? "0 0 16px rgba(0,212,255,0.5)"
                  : "none",
              }}
            >
              {tab.label}
              <span
                className="absolute bottom-0 left-0 h-[2px] rounded-full"
                style={{
                  background: "var(--db-accent)",
                  boxShadow: "0 0 8px rgba(0,212,255,0.7)",
                  width: isActive ? "100%" : "0%",
                  transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transformOrigin: "left",
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Mobile tab selector — visible after leaving landing */}
      {hasLeftLanding && (
        <select
          className="md:hidden text-sm rounded-lg px-3 py-1.5 outline-none"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--db-text-primary)",
            transition: "opacity 300ms ease",
          }}
          value={currentScreen}
          onChange={(e) => setScreen(e.target.value as Screen)}
          aria-label="Navigation"
        >
          {NAV_TABS.map((tab) => (
            <option key={tab.id} value={tab.id} style={{ background: "#0a0e27" }}>
              {tab.label}
            </option>
          ))}
        </select>
      )}

      {/* Right: status */}
      <div
        className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
        style={{
          background: "rgba(0,212,255,0.06)",
          border: "1px solid rgba(0,212,255,0.15)",
          color: "var(--db-text-secondary)",
        }}
      >
        <span className="status-dot active" />
        <span style={{ color: "var(--db-text-primary)" }}>Aicoo Pulse</span>
        <span>Live</span>
      </div>
    </header>
  );
}

function ScreenRenderer() {
  const { currentScreen } = useScreen();
  const [visible, setVisible] = useState(true);
  const [renderedScreen, setRenderedScreen] = useState(currentScreen);

  useEffect(() => {
    if (currentScreen === renderedScreen) return;
    setVisible(false);
    const timer = setTimeout(() => {
      setRenderedScreen(currentScreen);
      setVisible(true);
    }, 180);
    return () => clearTimeout(timer);
  }, [currentScreen, renderedScreen]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 200ms ease, transform 200ms ease",
        minHeight: "100%",
      }}
    >
      {renderedScreen === "landing" && <Landing />}
      {renderedScreen === "prospect-chat" && <ProspectChat />}
      {renderedScreen === "account-brief" && <AccountBrief />}
      {renderedScreen === "routing" && <RoutingDecision />}
      {renderedScreen === "handoff" && <HandoffOutcome />}
      {renderedScreen === "dashboard" && <Dashboard />}
    </div>
  );
}

function Footer() {
  return (
    <footer
      className="flex-shrink-0 flex items-center justify-end px-6 py-3"
      style={{
        background: "rgba(10, 14, 39, 0.6)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span className="text-xs" style={{ color: "var(--db-text-secondary)" }}>
        Powered by{" "}
        <span className="font-medium" style={{ color: "var(--db-accent)", opacity: 0.8 }}>
          Aicoo Pulse API
        </span>
      </span>
    </footer>
  );
}

function AppShell() {
  return (
    <div
      className="flex flex-col"
      style={{ minHeight: "100dvh", background: "var(--db-primary-dark)" }}
    >
      <Header />
      <div style={{ height: "60px", flexShrink: 0 }} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-[300px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0,212,255,0.1) 0%, transparent 70%)",
          }}
        />
        <ScreenRenderer />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScreenProvider>
          <AppShell />
        </ScreenProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
