import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, Plus, Phone, MapPin } from "lucide-react";

const TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodDonor() {
  const { toast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", blood_type: "O+", city: "", phone: "", available: true });

  const load = async () => {
    try { setDonors(await base44.entities.BloodDonor.list("-created_date", 100)); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.blood_type) return toast({ title: "Name and blood type required", variant: "destructive" });
    setAdding(true);
    try {
      await base44.entities.BloodDonor.create(form);
      setForm({ name: "", blood_type: "O+", city: "", phone: "", available: true });
      await load();
      toast({ title: "You're registered as a donor" });
    } catch (err) { toast({ title: "Register failed", description: err.message, variant: "destructive" }); }
    finally { setAdding(false); }
  };

  return (
    <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Blood Donor Network</h1>
        <p className="text-sm text-white/55 mt-1">Register to be alerted when someone nearby urgently needs your blood type.</p>
      </header>

      <form onSubmit={add} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Your name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-neutral-900 border-neutral-800" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-white/60">Blood type</Label>
            <div className="grid grid-cols-4 gap-1">
              {TYPES.map((t) => (
                <button type="button" key={t} onClick={() => setForm({ ...form, blood_type: t })}
                  className={`py-1.5 rounded-lg text-xs font-bold ${form.blood_type === t ? "bg-[#c4793f] text-white" : "bg-neutral-900 border border-neutral-800 text-white/60"}`}>{t}</button>
              ))}
            </div>
          </div>
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
        <Button type="submit" disabled={adding} className="w-full bg-[#c4793f] hover:bg-[#c4793f]/90 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {adding ? "Registering…" : "Register as donor"}
        </Button>
      </form>

      <section>
        <div className="flex items-center gap-2 mb-2"><Droplet className="w-4 h-4 text-[#c4793f]" /><h3 className="font-semibold">Available donors</h3></div>
        {loading ? <p className="text-sm text-white/40">Loading…</p> :
         donors.length === 0 ? <p className="text-sm text-white/40 text-center py-8">No donors registered yet.</p> :
         <div className="space-y-2">
           {donors.map((d) => (
             <div key={d.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 flex items-center justify-between gap-3">
               <div>
                 <div className="flex items-center gap-2">
                   <span className="px-2 py-0.5 rounded-full bg-[#c4793f]/20 text-[#c4793f] text-xs font-bold">{d.blood_type}</span>
                   <p className="font-semibold">{d.name}</p>
                   {!d.available && <span className="text-xs text-white/40">· unavailable</span>}
                 </div>
                 <div className="flex gap-3 text-xs text-white/50 mt-1">
                   {d.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.city}</span>}
                   {d.phone && <a href={`tel:${d.phone}`} className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.phone}</a>}
                 </div>
               </div>
             </div>
           ))}
         </div>}
      </section>
    </div>
  );
}
