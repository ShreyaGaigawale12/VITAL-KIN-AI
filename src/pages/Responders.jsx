import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Plus, Phone, MapPin } from "lucide-react";

export default function Responders() {
  const { toast } = useToast();
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", profession: "Doctor", certifications: "", city: "", phone: "", available: true });

  const load = async () => {
    try { setResponders(await base44.entities.Responder.list("-created_date", 100)); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.profession) return toast({ title: "Name and profession required", variant: "destructive" });
    setAdding(true);
    try {
      await base44.entities.Responder.create(form);
      setForm({ name: "", profession: "Doctor", certifications: "", city: "", phone: "", available: true });
      await load();
      toast({ title: "You're registered as a responder" });
    } catch (err) { toast({ title: "Register failed", description: err.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  return (
    <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Community Responder Network</h1>
        <p className="text-sm text-white/55 mt-1">Off-duty doctors, nurses &amp; CPR-trained volunteers who opt in to be alerted for nearby emergencies.</p>
      </header>

      <form onSubmit={add} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Your name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Profession</Label>
            <select value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })}
              className="w-full h-10 rounded-md bg-neutral-900 border border-neutral-800 px-3 text-sm">
              {["Doctor", "Nurse", "Paramedic", "CPR-trained", "First-aider", "Other"].map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-white/60">Certifications (e.g. BLS, ACLS)</Label>
          <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} className="bg-neutral-900 border-neutral-800" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-white/60">City</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
        </div>
        <Button type="submit" disabled={adding} className="w-full bg-[#418E66] hover:bg-[#418E66]/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {adding ? "Registering…" : "Register as responder"}
        </Button>
      </form>

      <section>
        <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-[#418E66]" /><h3 className="font-semibold">Active responders</h3></div>
        {loading ? <p className="text-sm text-white/40">Loading…</p> :
         responders.length === 0 ? <p className="text-sm text-white/40 text-center py-8">No responders registered yet.</p> :
         <div className="space-y-2">
           {responders.map((r) => (
             <div key={r.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 flex items-center justify-between gap-3">
               <div>
                 <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 rounded-full bg-[#418E66]/20 text-[#8fb347] text-xs font-bold">{r.profession}</span>
                   <p className="font-semibold">{r.name}</p>
                   {!r.available && <span className="text-xs text-white/40">· off-duty</span>}
                 </div>
                 {r.certifications && <p className="text-xs text-white/50 mt-1">{r.certifications}</p>}
                 <div className="flex gap-3 text-xs text-white/50 mt-1">
                   {r.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.city}</span>}
                   {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-1"><Phone className="w-3 h-3" /> {r.phone}</a>}
                 </div>
               </div>
             </div>
           ))}
         </div>}
      </section>
    </div>
  );
}
