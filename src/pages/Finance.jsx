import { useState } from "react";
import { Landmark, ShieldCheck, Zap, TrendingUp, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PullToRefresh from "@/components/PullToRefresh";

export default function Finance() {
  const { toast } = useToast();
  const [tab, setTab] = useState("loan");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!amount) { toast({ title: "Enter amount", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast({ title: tab === "loan" ? "Loan application submitted" : "Insurance enquiry submitted", description: "A partner will reach out shortly." });
      setAmount(""); setPurpose("");
    } catch (e) { toast({ title: "Failed", variant: "destructive" }); }
    finally { setSubmitting(false); }
  };

  return (
    <PullToRefresh onRefresh={async () => {}}>
      <div className="px-4 pt-4 space-y-5">
        <div>
          <h2 className="text-2xl font-bold">Finance & Insurance</h2>
          <p className="text-white/50 text-sm">Medical loans, insurance & one-tap claims</p>
        </div>

        <div className="flex bg-neutral-900 rounded-full p-1 select-none">
          {[
            { k: "loan", label: "Loans", icon: Landmark },
            { k: "insurance", label: "Insurance", icon: ShieldCheck },
          ].map(({ k, label, icon: Icon }) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-1.5 transition ${tab === k ? "bg-[#2c5e4a] text-white" : "text-white/50"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#418E66]/20 to-transparent border border-[#418E66]/40 p-4">
          <div className="flex items-center gap-2 text-[#8fb347] font-semibold text-sm"><Zap className="w-4 h-4" /> Emergency credit line</div>
          <p className="text-xs text-white/60 mt-1">A pre-approved micro-loan triggered directly from SOS — disbursed in minutes when you need it most.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 select-none">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 25000" className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
          <div>
            <label className="text-xs text-white/50 select-none">Purpose</label>
            <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Treatment / surgery / check-up" className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none" />
          </div>
        </div>

        {tab === "insurance" && (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="w-4 h-4 text-[#8fb347]" /> Wellness-linked premiums</div>
            <p className="text-xs text-white/55">Your vitals & activity can gradually lower your premium — rewarding prevention.</p>
            <div className="flex items-center gap-2 text-sm font-semibold pt-1"><FileText className="w-4 h-4 text-[#c9a04a]" /> One-tap claims</div>
            <p className="text-xs text-white/55">Feed an AI Consult diagnosis straight into an insurance claim, cutting paperwork.</p>
          </div>
        )}

        <button onClick={submit} disabled={submitting} className="w-full bg-white text-black font-bold py-3.5 rounded-xl active:scale-95 transition disabled:opacity-50">
          {submitting ? "Submitting…" : tab === "loan" ? "Apply for loan" : "Get insured"}
        </button>
      </div>
    </PullToRefresh>
  );
}
