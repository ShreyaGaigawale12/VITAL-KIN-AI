import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Video, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PullToRefresh from "@/components/PullToRefresh";

export default function Appointments() {
  const navigate = useNavigate();
  const [appts, setAppts] = useState([]);

  const load = async () => { try { setAppts(await base44.entities.Appointment.list("-created_date", 30)); } catch {} };
  useEffect(() => { load(); }, []);

  return (
    <PullToRefresh onRefresh={load}>
      <div className="px-4 pt-4 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Appointments</h2>
            <p className="text-white/50 text-sm">Book in-person or video visits</p>
          </div>
          <button onClick={() => navigate("/appointments/new")} className="w-11 h-11 rounded-full bg-[#418E66] grid place-items-center active:scale-90 transition">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {appts.length ? (
          <div className="space-y-2">
            {appts.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {a.type === "video" ? <Video className="w-4 h-4 text-[#8fb347]" /> : <Calendar className="w-4 h-4 text-[#418E66]" />}
                    {a.patient_name} · {a.specialty || "General"}
                  </div>
                  <div className="text-xs text-white/50">{a.date} {a.time} · <span className="capitalize">{a.status}</span></div>
                </div>
                {a.status === "confirmed" && <CheckCircle2 className="w-5 h-5 text-[#418E66]" />}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-white/40 text-sm py-12">No appointments yet. Tap + to book.</p>
        )}
      </div>
    </PullToRefresh>
  );
}
