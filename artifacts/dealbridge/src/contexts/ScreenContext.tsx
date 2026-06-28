// @refresh reset
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Screen =
  | "landing"
  | "prospect-chat"
  | "account-brief"
  | "routing"
  | "handoff"
  | "dashboard";

interface ScreenContextValue {
  currentScreen: Screen;
  setScreen: (name: Screen) => void;
  previousScreen: Screen | null;
  showNav: boolean;
  setShowNav: (v: boolean) => void;
  hasLeftLanding: boolean;
  setHasLeftLanding: (v: boolean) => void;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [previousScreen, setPreviousScreen] = useState<Screen | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [hasLeftLanding, setHasLeftLanding] = useState(false);

  const setScreen = (name: Screen) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(name);
    if (name !== "landing") setHasLeftLanding(true);
  };

  useEffect(() => {
    if (hasLeftLanding && currentScreen === "landing") {
      setCurrentScreen("prospect-chat");
    }
  }, [currentScreen, hasLeftLanding]);

  return (
    <ScreenContext.Provider value={{ currentScreen, setScreen, previousScreen, showNav, setShowNav, hasLeftLanding, setHasLeftLanding }}>
      {children}
    </ScreenContext.Provider>
  );
}

export function useScreen() {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error("useScreen must be used within ScreenProvider");
  return ctx;
}
