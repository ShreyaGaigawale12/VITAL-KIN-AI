import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const SPECIALTIES = ["General physician", "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Veterinarian"];
const TIMES = ["09:00", "11:00", "14:00", "16:00", "18:00"];

export default function AppointmentsNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toast } = useToast();
  const [subject, setSubject] = useState("human");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [type, setType] = useState(params.get("type") === "video" ? "video" : "in-person");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(TIMES[0]);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name || !date) { toast({ title: "Name and date required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await base44.entities.Appointment.create({ subject, patient_name: name, specialty, type, date, time, status: "requested" });
      toast({ title: "Appointment requested" });
      navigate("/appointments");
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const Picker = ({ label, value, options, onChange }) => (
    <div>
      <label className="text-xs text-white/50 select-none">{label}</label>
      <Drawer>
        <DrawerTrigger asChild>
          <button className="w-full mt-1 flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm active:scale-95 transition">
            <span>{value}</span> <ChevronDown className="w-4 h-4 text-white/40" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="bg-neutral-950 border-neutral-800 text-white">
          <DrawerHeader><DrawerTitle>{label}</DrawerTitle></DrawerHeader>
          <div className="px-4 pb-8 space-y-1">
            {options.map((o) => (
              <button key={o} onClick={() => { onChange(o); }} className={`w-full text-left px-4 py-3 rounded-xl ${value === o ? "bg-[#418E66] text-white" : "bg-white/5"}`}>
                {o}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <div className="px-4 pt-4 space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-white/60">‹ Back</button>
      <h2 className="text-2xl font-bold">New appointment</h2>

      <div className="flex bg-neutral-900 rounded-full p-1 w-44 select-none">
        {["human", "pet"].map((s) => (
          <button key={s} onClick={() => setSubject(s)} className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition ${subject === s ? "border border-[#418E66] text-white" : "text-white/50"}`}>{s}</button>
        ))}
      </div>

      <div>
        <label className="text-xs text-white/50 select-none">Patient name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none" />
      </div>

      <Picker label="Specialty" value={specialty} options={SPECIALTIES} onChange={setSpecialty} />
      <Picker label="Time slot" value={time} options={TIMES} onChange={setTime} />

      <div className="flex bg-neutral-900 rounded-full p-1 w-48 select-none">
        {["in-person", "video"].map((t) => (
          <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition ${type === t ? "bg-[#2c5e4a] text-white" : "text-white/50"}`}>{t}</button>
        ))}
      </div>

      <div>
        <label className="text-xs text-white/50 select-none">Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none [color-scheme:dark]" />
      </div>

      <Button onClick={submit} disabled={saving} className="w-full bg-[#418E66] text-white">Request appointment</Button>
    </div>
  );
}
