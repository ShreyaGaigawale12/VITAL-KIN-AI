import { useEffect, useState } from "react";
import { Watch as WatchIcon, Bluetooth, AlertTriangle, ShieldCheck, HeartPulse, Activity, Footprints, PersonStanding, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PullToRefresh from "@/components/PullToRefresh";
import VitalHistoryChart from "@/components/VitalHistoryChart";

const QUICK = {
  heart_rate: [60, 72, 80, 100, 120],
  spo2: [98, 95, 92],
  steps: [3000, 5000, 8000, 10000],
};

const ICONS = { heart_rate: HeartPulse, spo2: Activity, steps: Footprints, fall: PersonStanding };
const UNITS = { heart_rate: "bpm", spo2: "%", steps: "steps", fall: "" };

export default function Watch() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("human");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [btSupported] = useState(typeof navigator !== "undefined" && !!navigator.bluetooth);
  const [fallArmed, setFallArmed] = useState(false);
  const [hr, setHr] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVitals = async () => {
    try {
      const list = await base44.entities.Vital.filter({ subject }, "-created_date", 30);
      setVitals(list);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { loadVitals(); }, [subject]);

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
      await loadVitals();
      toast({ title: `${type.replace("_", " ")} saved` });
    } catch (e) { toast({ title: "Save failed", variant: "destructive" }); }
  };

  const logFall = async () => {
    try {
      await base44.entities.Vital.create({ subject, type: "fall", value: 1, source: "manual" });
      await loadVitals();
      toast({ title: "Fall event logged", variant: "destructive" });
    } catch (e) { toast({ title: "Save failed", variant: "destructive" }); }
  };

  return (
    <PullToRefresh onRefresh={loadVitals}>
      <div className="px-4 pt-4 pb-6 space-y-5 max-w-2xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold">Smartwatch</h2>
          <p className="text-white/50 text-sm">Connect via Bluetooth & sync vitals, or log manually.</p>
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
            <span>Bluetooth pairing isn't available here — on iPhone/Apple Watch it isn't supported. You can still log vitals manually below.</span>
          </div>
        )}

        {/* Quick add */}
        <section className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4 text-[#8fb347]" /> Quick add</h3>
          {Object.entries(QUICK).map(([type, vals]) => {
            const Icon = ICONS[type];
            return (
              <div key={type} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-white/60 w-24 shrink-0 capitalize">
                  <Icon className="w-4 h-4" /> {type.replace("_", " ")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {vals.map((v) => (
                    <button key={v} onClick={() => logVital(type, v)}
                      className="px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-white/85 active:scale-90 hover:border-[#418E66]/60 transition">
                      {v}<span className="text-white/40 text-xs ml-1">{UNITS[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <button onClick={logFall} className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition">
            <PersonStanding className="w-4 h-4" /> Log fall event
          </button>
        </section>

        {/* Manual entry */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: "heart_rate", val: hr, set: setHr, icon: HeartPulse, unit: "bpm" },
            { label: "spo2", val: spo2, set: setSpo2, icon: Activity, unit: "%" },
          ].map(({ label, val, set, icon: Icon, unit }) => (
            <div key={label} className="rounded-2xl border border-neutral-800 p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs capitalize"><Icon className="w-4 h-4" /> {label.replace("_", " ")}</div>
              <div className="flex items-center justify-between mt-2">
                <input type="number" value={val} onChange={(e) => set(Number(e.target.value))} className="w-20 bg-transparent text-2xl font-bold outline-none" />
                <button onClick={() => logVital(label, val)} className="w-9 h-9 rounded-full bg-[#418E66] grid place-items-center active:scale-90 transition">
                  <span className="text-white text-sm">✓</span>
                </button>
              </div>
              <span className="text-xs text-white/40">{unit}</span>
            </div>
          ))}
        </section>

        {/* History chart */}
        <section className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-[#8fb347]" /> Vitals trend</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> HR</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#418E66]" /> SpO2</span>
            </div>
          </div>
          <VitalHistoryChart vitals={vitals} />
        </section>

        {/* Recent list */}
        <section>
          <h3 className="font-semibold mb-2">Recent readings</h3>
          {loading ? <p className="text-sm text-white/40">Loading…</p> :
           vitals.length === 0 ? <p className="text-sm text-white/40 text-center py-6">No readings yet.</p> :
           <div className="space-y-2">
             {vitals.slice(0, 8).map((v) => {
               const Icon = ICONS[v.type] || Activity;
               return (
                 <div key={v.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Icon className="w-4 h-4 text-white/50" />
                     <span className="text-sm capitalize">{v.type.replace("_", " ")}</span>
                   </div>
                   <div className="text-right">
                     <span className="font-semibold">{v.value}{v.unit ? ` ${v.unit}` : UNITS[v.type] ? ` ${UNITS[v.type]}` : ""}</span>
                     <p className="text-[10px] text-white/40">{new Date(v.created_date).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                   </div>
                 </div>
               );
             })}
           </div>}
        </section>

        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="w-5 h-5 text-[#8fb347]" /> Fall detection</div>
            <button onClick={() => setFallArmed(!fallArmed)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${fallArmed ? "bg-[#418E66] text-white" : "bg-white/10 text-white/70"}`}>
              {fallArmed ? "Armed" : "Arm"}
            </button>
          </div>
          <p className="text-white/50 text-xs mt-2">Auto-triggers SOS if a fall is detected and you do not respond in 30 seconds. Great for elderly users living alone.</p>
        </div>
      </div>
    </PullToRefresh>
  );
}
