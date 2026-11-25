import { useEffect, useState } from "react";
import { Leaf, Loader2, Plus, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PullToRefresh from "@/components/PullToRefresh";

const SYSTEMS = [
  { k: "ayurveda", label: "Ayurveda" },
  { k: "yoga", label: "Yoga & Naturopathy" },
  { k: "unani", label: "Unani" },
  { k: "siddha", label: "Siddha" },
  { k: "homeopathy", label: "Homeopathy" },
];

export default function Ayush() {
  const { toast } = useToast();
  const [system, setSystem] = useState("ayurveda");
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [records, setRecords] = useState([]);
  const [logging, setLogging] = useState(false);
  const [form, setForm] = useState({ concern: "", remedy: "", practitioner: "", notes: "" });

  const load = async () => { try { setRecords(await base44.entities.AyushRecord.list("-date", 20)); } catch {} };
  useEffect(() => { load(); }, []);

  const ask = async () => {
    if (!concern) { toast({ title: "Describe your concern", variant: "destructive" }); return; }
    setLoading(true); setAdvice(null);
    try {
      const res = await base44.functions.invoke("AyushConsult", { system, concern });
      setAdvice(res.data?.result || res.data);
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const save = async () => {
    if (!form.concern) { toast({ title: "Concern required", variant: "destructive" }); return; }
    try {
      await base44.entities.AyushRecord.create({ system, ...form, date: new Date().toISOString().slice(0, 10) });
      setForm({ concern: "", remedy: "", practitioner: "", notes: "" });
      setLogging(false);
      load();
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  return (
    <PullToRefresh onRefresh={load}>
      <div className="px-4 pt-4 pb-6 space-y-5 max-w-3xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Leaf className="w-6 h-6 text-[#8fb347]" /> AYUSH care</h2>
          <p className="text-white/50 text-sm">Consult or log Ayurveda, Yoga, Unani, Siddha & Homeopathy.</p>
        </div>

        <div className="flex bg-neutral-900 rounded-full p-1 select-none overflow-x-auto" style={{ overscrollBehaviorX: "none" }}>
          {SYSTEMS.map((s) => (
            <button key={s.k} onClick={() => setSystem(s.k)} className={`shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition ${system === s.k ? "bg-[#418E66] text-white" : "text-white/50"}`}>{s.label}</button>
          ))}
        </div>

        <div className="rounded-2xl bg-[#151515] border border-neutral-800 p-4 space-y-3">
          <p className="text-xs font-semibold text-white/60">{SYSTEMS.find((s) => s.k === system).label} consult</p>
          <textarea value={concern} onChange={(e) => setConcern(e.target.value)} placeholder="Describe your concern — e.g. indigestion, joint stiffness, poor sleep…" rows={3} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
          <button onClick={ask} disabled={loading} className="w-full bg-[#418E66] text-white font-bold py-3 rounded-xl active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Asking…</> : <><Send className="w-4 h-4" /> Ask AYUSH AI</>}
          </button>
        </div>

        {advice && (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
            <p className="text-sm">{advice.summary}</p>
            {advice.remedies?.length > 0 && (
              <div><p className="text-xs font-semibold text-[#8fb347]">Remedies & measures</p>{advice.remedies.map((r, i) => <p key={i} className="text-xs text-white/70 pl-4">• {r}</p>)}</div>
            )}
            {advice.lifestyle?.length > 0 && (
              <div><p className="text-xs font-semibold text-[#c9a04a]">Lifestyle</p>{advice.lifestyle.map((r, i) => <p key={i} className="text-xs text-white/70 pl-4">• {r}</p>)}</div>
            )}
            {advice.caution && <p className="text-xs text-amber-200/80 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2">{advice.caution}</p>}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="font-semibold">My AYUSH log</h3>
          <button onClick={() => setLogging((a) => !a)} className="flex items-center gap-1 text-xs text-[#48b88d] font-medium"><Plus className="w-4 h-4" /> Add entry</button>
        </div>

        {logging && (
          <div className="rounded-2xl bg-[#151515] border border-neutral-800 p-4 space-y-2">
            <input value={form.concern} onChange={(e) => setForm({ ...form, concern: e.target.value })} placeholder="Concern" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={form.remedy} onChange={(e) => setForm({ ...form, remedy: e.target.value })} placeholder="Remedy / prescription" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={form.practitioner} onChange={(e) => setForm({ ...form, practitioner: e.target.value })} placeholder="Practitioner (optional)" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={save} className="w-full bg-white text-black font-bold py-2.5 rounded-xl active:scale-95 transition">Save entry</button>
          </div>
        )}

        {records.map((r) => (
          <div key={r.id} className="rounded-2xl bg-[#151515] border border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#418E66]/20 text-[#8fb347] capitalize">{r.system}</span>
              <span className="text-xs text-white/40">{r.date}</span>
            </div>
            <p className="font-semibold text-sm mt-2">{r.concern}</p>
            {r.remedy && <p className="text-xs text-white/60 mt-1">{r.remedy}</p>}
            {r.practitioner && <p className="text-xs text-white/45 mt-1">By {r.practitioner}</p>}
            {r.notes && <p className="text-xs text-white/45 mt-1">{r.notes}</p>}
          </div>
        ))}
        {records.length === 0 && !logging && <p className="text-center text-sm text-white/50">No entries yet.</p>}
      </div>
    </PullToRefresh>
  );
}
