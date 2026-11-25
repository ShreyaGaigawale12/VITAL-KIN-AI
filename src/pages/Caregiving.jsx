import { useEffect, useState } from "react";
import { HeartHandshake, Phone, Wallet, Activity, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PullToRefresh from "@/components/PullToRefresh";

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export default function Caregiving() {
  const { toast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ward_name: "", relation: "", phone: "", city: "", upi_id: "" });

  const load = async () => {
    try { setLinks(await base44.entities.CareLink.list("-created_date")); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.ward_name) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      await base44.entities.CareLink.create({ ...form, medication_adherence: 0, last_vitals_checkin: new Date().toISOString().slice(0, 10), sos_triggered: false });
      setForm({ ward_name: "", relation: "", phone: "", city: "", upi_id: "" });
      setAdding(false);
      load();
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const checkin = async (l) => {
    await base44.entities.CareLink.update(l.id, { last_vitals_checkin: new Date().toISOString().slice(0, 10) });
    load();
  };
  const resolveSos = async (l) => {
    await base44.entities.CareLink.update(l.id, { sos_triggered: false });
    load();
  };
  const setAdherence = async (l, v) => {
    await base44.entities.CareLink.update(l.id, { medication_adherence: v });
    load();
  };

  const fund = (l) => {
    if (!l.upi_id) { toast({ title: "No UPI ID saved", description: "Add a UPI ID for this ward first.", variant: "destructive" }); return; }
    const amt = prompt(`Send to ${l.ward_name} (₹)`, "1000");
    if (!amt) return;
    const pa = encodeURIComponent(l.upi_id), pn = encodeURIComponent(l.ward_name), am = encodeURIComponent(amt);
    window.location.href = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=Care`;
  };

  return (
    <PullToRefresh onRefresh={load}>
      <div className="px-4 pt-4 pb-6 space-y-5 max-w-3xl mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2"><HeartHandshake className="w-6 h-6 text-[#48b88d]" /> Long-distance care</h2>
            <p className="text-white/50 text-sm">Watch over parents from anywhere — adherence, check-ins & alerts.</p>
          </div>
          <button onClick={() => setAdding((a) => !a)} className="shrink-0 w-10 h-10 grid place-items-center rounded-full bg-[#418E66] active:scale-90 transition"><Plus className="w-5 h-5" /></button>
        </div>

        {adding && (
          <div className="rounded-2xl bg-[#151515] border border-neutral-800 p-4 space-y-2">
            <input value={form.ward_name} onChange={(e) => setForm({ ...form, ward_name: e.target.value })} placeholder="Parent's name" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="Relation" className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            </div>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <input value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} placeholder="UPI ID (for fund care)" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
            <button onClick={add} className="w-full bg-white text-black font-bold py-2.5 rounded-xl active:scale-95 transition">Add ward</button>
          </div>
        )}

        {links.map((l) => {
          const days = daysSince(l.last_vitals_checkin);
          const overdue = days == null || days >= 1;
          return (
            <div key={l.id} className="rounded-2xl bg-[#151515] border border-neutral-800 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{l.ward_name}</p>
                  <p className="text-xs text-white/50">{l.relation}{l.city ? ` · ${l.city}` : ""}</p>
                </div>
                {l.sos_triggered && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-300 animate-pulse">SOS</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-xl p-3 border ${overdue ? "border-red-500/40 bg-red-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
                  <p className="text-xs text-white/50 flex items-center gap-1">{overdue ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />} Vitals check-in</p>
                  <p className="text-sm font-semibold mt-0.5">{days == null ? "Never" : days === 0 ? "Today" : `${days}d ago`}</p>
                </div>
                <div className="rounded-xl p-3 border border-neutral-800 bg-white/5">
                  <p className="text-xs text-white/50 flex items-center gap-1"><Activity className="w-3 h-3" /> Med adherence</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden"><div className="h-full bg-[#418E66]" style={{ width: `${l.medication_adherence || 0}%` }} /></div>
                    <span className="text-xs font-semibold">{l.medication_adherence || 0}%</span>
                  </div>
                </div>
              </div>

              {overdue && <p className="text-xs text-red-300">Missed check-in — consider calling {l.ward_name.split(" ")[0]}.</p>}

              <div className="flex flex-wrap gap-2">
                {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 text-xs font-semibold px-3 py-2 rounded-lg"><Phone className="w-3.5 h-3.5" /> Call</a>}
                <button onClick={() => fund(l)} className="flex items-center gap-1 bg-[#418E66] text-white text-xs font-semibold px-3 py-2 rounded-lg"><Wallet className="w-3.5 h-3.5" /> Fund care</button>
                <button onClick={() => checkin(l)} className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 text-xs font-semibold px-3 py-2 rounded-lg"><CheckCircle2 className="w-3.5 h-3.5" /> Log check-in</button>
                {l.sos_triggered && <button onClick={() => resolveSos(l)} className="flex items-center gap-1 bg-red-500/20 text-red-300 text-xs font-semibold px-3 py-2 rounded-lg">Resolve SOS</button>}
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={() => setAdherence(l, Math.max(0, (l.medication_adherence || 0) - 10))} className="w-7 h-7 grid place-items-center bg-neutral-900 border border-neutral-800 rounded-lg text-sm">−</button>
                  <button onClick={() => setAdherence(l, Math.min(100, (l.medication_adherence || 0) + 10))} className="w-7 h-7 grid place-items-center bg-neutral-900 border border-neutral-800 rounded-lg text-sm">+</button>
                </div>
              </div>
              {l.notes && <p className="text-xs text-white/45">{l.notes}</p>}
            </div>
          );
        })}

        {loading && <p className="text-center text-sm text-white/40">Loading…</p>}
        {!loading && links.length === 0 && <p className="text-center text-sm text-white/50">No wards yet. Tap + to add a parent you care for.</p>}
      </div>
    </PullToRefresh>
  );
}
