import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, PawPrint, Trash2 } from "lucide-react";

export default function Household() {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", kind: "human", blood_type: "", conditions: "", medications: "", emergency_contact: "" });

  const load = async () => {
    try { setMembers(await base44.entities.Household.list("-created_date", 50)); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name) return toast({ title: "Name required", variant: "destructive" });
    setAdding(true);
    try {
      await base44.entities.Household.create(form);
      setForm({ name: "", relation: "", kind: "human", blood_type: "", conditions: "", medications: "", emergency_contact: "" });
      await load();
      toast({ title: "Member added" });
    } catch (err) { toast({ title: "Add failed", description: err.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    try { await base44.entities.Household.delete(id); await load(); }
    catch (e) { toast({ title: "Delete failed", variant: "destructive" }); }
  };

  return (
    <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Household Health Hub</h1>
        <p className="text-sm text-white/55 mt-1">One shared record for every family member and pet — vaccinations, meds &amp; check-ups.</p>
      </header>

      <form onSubmit={add} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Relation</Label>
            <Input value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="e.g. Spouse, Son" className="bg-neutral-900 border-neutral-800" />
          </div>
        </div>
        <div className="flex gap-2">
          {["human", "pet"].map((k) => (
            <button type="button" key={k} onClick={() => setForm({ ...form, kind: k })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${form.kind === k ? "bg-[#418E66] text-white" : "bg-neutral-900 border border-neutral-800 text-white/60"}`}>
              {k === "human" ? <Users className="w-4 h-4" /> : <PawPrint className="w-4 h-4" />} {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Blood type</Label>
            <Input value={form.blood_type} onChange={(e) => setForm({ ...form, blood_type: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Conditions</Label>
            <Input value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Medications</Label>
            <Input value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Emergency contact</Label>
            <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
        </div>
        <Button type="submit" disabled={adding} className="w-full bg-[#418E66] hover:bg-[#418E66]/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {adding ? "Adding…" : "Add member"}
        </Button>
      </form>

      <section className="space-y-2">
        {loading ? <p className="text-sm text-white/40">Loading…</p> :
         members.length === 0 ? <p className="text-sm text-white/40 text-center py-8">No members yet. Add your first family member or pet above.</p> :
         members.map((m) => (
           <div key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 flex items-start justify-between gap-3">
             <div>
               <div className="flex items-center gap-2">
                 <p className="font-semibold">{m.name}</p>
                 <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60">{m.kind}</span>
               </div>
               {m.relation && <p className="text-xs text-white/50 mt-0.5">{m.relation}</p>}
               <div className="flex flex-wrap gap-2 mt-2 text-xs">
                 {m.blood_type && <span className="px-2 py-0.5 rounded-full bg-[#418E66]/20 text-[#8fb347]">{m.blood_type}</span>}
                 {m.conditions && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{m.conditions}</span>}
                 {m.medications && <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60">{m.medications}</span>}
               </div>
             </div>
             <button onClick={() => remove(m.id)} className="text-white/40 hover:text-red-400 active:scale-90 transition"><Trash2 className="w-4 h-4" /></button>
           </div>
         ))}
      </section>
    </div>
  );
}
