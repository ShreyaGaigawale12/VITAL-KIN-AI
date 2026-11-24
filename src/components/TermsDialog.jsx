import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const STORAGE_KEY = "vitalkin_tc_accepted";

const POINTS = [
  { t: "Not a substitute for a doctor", d: "VitalKin AI gives general guidance only. It never replaces professional medical advice, diagnosis, or emergency care. In an emergency, call 102 / your local emergency number." },
  { t: "Your data is secured", d: "Your health records, vitals and chats are stored securely and tied to your account. We never sell your data. Only you and those you authorise can access it." },
  { t: "AI can be wrong", d: "Symptom checks and snake identification are estimates, not a diagnosis. Always use your judgement and seek professional help when unsure." },
  { t: "Use at your own risk", d: "You are responsible for decisions made using this app. LifeLine Dynamics is not liable for outcomes from acting on app guidance." },
];

export default function TermsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {}
  }, []);

  const accept = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-[#111] border-neutral-800 text-white" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-[#418E66]/20 grid place-items-center mb-1">
            <ShieldCheck className="w-6 h-6 text-[#48b88d]" />
          </div>
          <DialogTitle className="text-xl">Terms &amp; Conditions</DialogTitle>
          <DialogDescription className="text-white/55">
            Please review before using VitalKin AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {POINTS.map((p) => (
            <div key={p.t} className="rounded-xl bg-white/5 border border-neutral-800 p-3">
              <p className="text-sm font-semibold text-[#8fb347]">{p.t}</p>
              <p className="text-xs text-white/65 mt-1 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>

        <button
          onClick={accept}
          className="w-full mt-4 bg-[#418E66] text-white font-bold py-3 rounded-xl active:scale-95 transition"
        >
          I Agree &amp; Continue
        </button>
        <p className="text-[11px] text-white/40 text-center mt-1">
          By continuing you accept these terms.
        </p>
      </DialogContent>
    </Dialog>
  );
}
