import { NavLink } from "react-router-dom";
import { Home, MessageCircle, Pill, Watch } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/consult", label: "Consult", icon: MessageCircle },
  { to: "/pharmacy", label: "Pharmacy", icon: Pill },
  { to: "/watch", label: "Watch", icon: Watch },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-black border-t border-neutral-900 z-40 select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-3 py-1 rounded-2xl transition active:scale-90 ${
                isActive ? "text-white bg-white/10" : "text-white/45 hover:text-white/80"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.6 : 2} />
                <span className="text-[10px] mt-0.5 font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
