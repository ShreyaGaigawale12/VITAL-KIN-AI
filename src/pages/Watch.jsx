import { useState } from "react";
import { Watch as WatchIcon, Bluetooth, AlertTriangle, ShieldCheck, HeartPulse, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PullToRefresh from "@/components/PullToRefresh";

export default function Watch() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("human");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [btSupported] = useState(typeof navigator !== "undefined" && !!navigator.bluetooth);
  const [fallArmed, setFallArmed] = useState(false);
  const [hr, setHr] = useState(0);
  const [spo2, setSpo2] = useState(0);

  const connect = async () => {
    if (!btSupported) {
      toast({ title: "Web Bluetooth unsupported", description: "Open in Chrome on Android or the installed app.", variant: "destructive" });
      return;
    }
    setConnecting(true);
    try {
      const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      setConnected(true);
      toast({ title: `Connected to ${device.name || "device"}` });
    } catch (e) {
      toast({ title: "Connection cancelled", variant: "destructive" });
    } finally {
      setConnecting(false);
    }
  };

  const logVital = async (type, value) => {
    if (!value) return;
    try {
      await base44.entities.Vital.create({ subject, type, value: Number(value), source: "manual" });
      toast({ title: `${type.replace("_", " ")} saved` });
    } catch (e) { toast({ title: "Save failed", variant: "destructive" }); }
  };

  return (
    <PullToRefresh onRefresh={async () => {}}>
      <div className="px-4 pt-4 space-y-5">
        <div>
          <h2 className="text-2xl font-bold">Smartwatch</h2>
          <p className="text-white/50 text-sm">Connect via Bluetooth & sync vitals</p>
        </div>

        <div className="flex bg-neutral-900 rounded-full p-1 w-56 select-none">
          {["human", "Pet collar"].map((s, i) => {
            const key = i === 0 ? "human" : "pet";
            return (
              <button key={s} onClick={() => setSubject(key)} className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${subject === key ? "bg-[#2c5e4a] text-white" : "text-white/50"}`}>{s}</button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#418E66]/20 grid place-items-center mx-auto mb-3">
            <WatchIcon className="w-10 h-10 text-[#418E66]" />
          </div>
          <h3 className="font-bold">{connected ? "Device connected" : "No device connected"}</h3>
          <p className="text-white/50 text-sm mt-1">Pair your smartwatch / fitness band</p>
          <button onClick={connect} disabled={connecting} className="mt-4 bg-white text-black font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 active:scale-95 transition disabled:opacity-50">
            <Bluetooth className="w-4 h-4" /> {connecting ? "Connecting…" : "Connect watch"}
          </button>
        </div>

        {!btSupported && (
          <div className="flex items-start gap-2 bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 text-amber-200/80 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Web Bluetooth isn't supported in this browser. On Android, open in Chrome or the installed app, then tap Connect.</span>
          </div>
        )}

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="w-5 h-5 text-[#8fb347]" /> Fall detection</div>
            <button onClick={() => setFallArmed(!fallArmed)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${fallArmed ? "bg-[#418E66] text-white" : "bg-white/10 text-white/70"}`}>
              {fallArmed ? "Armed" : "Arm"}
            </button>
          </div>
          <p className="text-white/50 text-xs mt-2">Auto-triggers SOS if a fall is detected and you do not respond in 30 seconds. Great for elderly users living alone.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Heart rate", val: hr, set: setHr, icon: HeartPulse, unit: "bpm" },
            { label: "SpO2", val: spo2, set: setSpo2, icon: Activity, unit: "%" },
          ].map(({ label, val, set, icon: Icon, unit }) => (
            <div key={label} className="rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs"><Icon className="w-4 h-4" /> {label}</div>
              <div className="flex items-center justify-between mt-2">
                <input type="number" value={val} onChange={(e) => set(Number(e.target.value))} className="w-16 bg-transparent text-2xl font-bold outline-none" />
                <button onClick={() => logVital(label.toLowerCase().replace(" ", "_"), val)} className="w-9 h-9 rounded-full bg-[#418E66] grid place-items-center active:scale-90 transition">
                  <span className="text-white text-sm">✓</span>
                </button>
              </div>
              <span className="text-xs text-white/40">{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </PullToRefresh>
  );
}
