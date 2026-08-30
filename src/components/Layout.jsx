import { Outlet, useLocation } from "react-router-dom";
import { Sun, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "@/lib/useTheme";
import BottomNav from "@/components/BottomNav";
import SettingsDialog from "@/components/SettingsDialog";
import { useState } from "react";

export default function Layout() {
  const { theme, toggle } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="h-[100dvh] overflow-hidden bg-black dark:bg-black text-white flex flex-col max-w-5xl mx-auto relative">
      {/* Header with safe-area top */}
      <header
        className="sticky top-0 z-30 bg-black/90 backdrop-blur border-b border-neutral-900 px-4 py-3 select-none"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">
              VitalKin <span className="text-[#418E66]">AI</span>
            </h1>
            <p className="text-[11px] text-white/50 leading-none mt-1">LifeLine Dynamics</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/10 active:scale-90 transition"
            >
              <Sun className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-white/10 active:scale-90 transition"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Colorful boundary accent */}
      <div className="h-[3px] bg-gradient-to-r from-[#418E66] via-[#8fb347] to-[#c4793f]" />

      <main
        key={location.pathname}
        className="flex-1 overflow-y-auto pb-24 animate-[fadeIn_.25s_ease]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 6rem)" }}
      >
        <Outlet context={{ theme, toggleTheme: toggle }} />
      </main>

      <BottomNav />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
