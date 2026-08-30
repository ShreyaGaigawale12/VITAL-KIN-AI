import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function ComingSoon({ title = "Coming soon", note = "This module is on the roadmap for VitalKin AI." }) {
  const navigate = useNavigate();
  return (
    <div className="px-4 pt-6 space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm text-white/60 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="rounded-2xl bg-gradient-to-br from-[#418E66]/20 to-transparent border border-[#418E66]/40 p-6 text-center">
        <Sparkles className="w-8 h-8 text-[#8fb347] mx-auto mb-3" />
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-white/60 text-sm mt-2">{note}</p>
      </div>
    </div>
  );
}
