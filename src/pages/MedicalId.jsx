import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Save, UserPlus } from "lucide-react";

const FIELDS = [
  ["full_name", "Full name"],
  ["blood_type", "Blood type (e.g. O+)"],
  ["allergies", "Allergies"],
  ["conditions", "Medical conditions"],
  ["emergency_contact", "Emergency contact (phone)"],
  ["pet_breed", "Pet breed"],
  ["pet_meds", "Pet medications"],
  ["vet_contact", "Vet contact"],
];

export default function MedicalId() {
  const { toast } = useToast();
  const [rec, setRec] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", blood_type: "", allergies: "", conditions: "",
    emergency_contact: "", pet_breed: "", pet_meds: "", vet_contact: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.MedicalID.list("-created_date", 1);
        if (list[0]) { setRec(list[0]); setForm({ ...list[0] }); }
      } catch {}
    })();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!form.full_name) return toast({ title: "Name is required", variant: "destructive" });
    setSaving(true);
    try {
      if (rec) {
        await base44.entities.MedicalID.update(rec.id, form);
      } else {
        const created = await base44.entities.MedicalID.create(form);
        setRec(created);
      }
      toast({ title: "Medical ID saved" });
    } catch (err) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const qrData = encodeURIComponent(JSON.stringify({ n: form.full_name, b: form.blood_type, a: form.allergies, c: form.conditions, e: form.emergency_contact }));
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrData}`;

  return (
    <div className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Medical ID</h1>
        <p className="text-sm text-white/55 mt-1">A first responder can scan this to see your critical info even when the phone is locked.</p>
      </header>

      {rec && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 flex flex-col items-center gap-3">
          <div className="w-40 h-40 rounded-xl overflow-hidden bg-white p-2">
            <img src={qr} alt="Medical ID QR" className="w-full h-full object-contain" />
          </div>
          <p className="text-sm font-semibold">{form.full_name || "—"}</p>
          <div className="flex gap-2 text-xs">
            {form.blood_type && <span className="px-2 py-0.5 rounded-full bg-[#418E66]/30 text-[#8fb347]">{form.blood_type}</span>}
            {form.allergies && <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">Allergies: {form.allergies}</span>}
          </div>
        </div>
      )}

      <form onSubmit={save} className="space-y-3">
        {FIELDS.map(([key, label]) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-white/60">{label}</Label>
            <Input
              value={form[key] || ""}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="bg-neutral-900 border-neutral-800"
            />
          </div>
        ))}
        <Button type="submit" disabled={saving} className="w-full bg-[#418E66] hover:bg-[#418E66]/90 flex items-center gap-2">
          {saving ? "Saving…" : rec ? <><Save className="w-4 h-4" /> Update Medical ID</> : <><UserPlus className="w-4 h-4" /> Register Medical ID</>}
        </Button>
      </form>
    </div>
  );
}
