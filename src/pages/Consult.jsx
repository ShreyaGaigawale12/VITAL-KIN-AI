import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Camera, Mic, Send, ShieldCheck, AlertTriangle, Leaf, Stethoscope } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import { painColor, painToSeverity } from "@/lib/triageColors";

const HUMAN_AVATAR = "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/01cf17905_generated_image.png";
const PET_AVATAR = "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/c7386bf33_generated_image.png";

const QUICK = {
  human: ["I have a fever and body ache", "Severe headache since morning", "Stomach pain and nausea", "Chest tightness", "Skin rash with itching", "Cold and sore throat"],
  pet: ["My dog is vomiting", "Cat not eating since a day", "Itching and scratching a lot", "Limping after a walk", "Diarrhea", "Lethargic and weak"],
};

const SEV_STYLE = {
  red: { bg: "#ef4444", label: "Urgent — emergency care now" },
  yellow: { bg: "#c9a04a", label: "Moderate — see a doctor soon" },
  green: { bg: "#418E66", label: "Mild — home care may help" },
  none: { bg: "#262626", label: "" },
};

export default function Consult() {
  const [params, setParams] = useSearchParams();
  const subject = params.get("subject") === "pet" ? "pet" : "human";
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pain, setPain] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const setSubject = (s) => {
    const next = new URLSearchParams(params);
    if (s === "pet") next.set("subject", "pet"); else next.delete("subject");
    setParams(next);
    setMessages([]);
    setPain(null);
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content && !image) return;
    const userMsg = { role: "user", content, image_url: image, painLevel: pain };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    const localImage = image;
    setImage(null);
    setLoading(true);
    try {
      const res = await base44.functions.invoke("AiTriage", {
        subject, message: content, pain, image_url: localImage, history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      const r = res.data?.result || res.data;
      const sev = r.severity || painToSeverity(pain) || "none";
      const assistantMsg = {
        role: "assistant",
        content: r.summary || "I've reviewed your symptoms.",
        severity: sev,
        remedies: r.home_remedies || [],
        recommendation: r.recommendation || "",
        followup: r.followup_question || ""
      };
      setMessages([...newMsgs, assistantMsg]);
      try {
        await base44.entities.ChatMessage.create({ role: "user", content, subject, painLevel: pain, image_url: localImage });
        await base44.entities.ChatMessage.create({ role: "assistant", content: r.summary, subject, severity: sev });
      } catch {}
    } catch (e) {
      toast({ title: "Assessment failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    base44.integrations.Core.UploadFile({ file }).then(({ file_url }) => setImage(file_url)).catch(() => toast({ title: "Upload failed", variant: "destructive" }));
  };

  const onMic = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({ title: "Voice input unsupported", description: "Use Chrome on Android/desktop.", variant: "destructive" });
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.onresult = (e) => setInput((i) => i + e.results[0][0].transcript);
    rec.onerror = () => toast({ title: "Mic error", variant: "destructive" });
    rec.start();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toggle */}
      <div className="px-4 pt-3 space-y-3 select-none">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-neutral-900 rounded-full p-1 flex">
            {["human", "pet"].map((s) => (
              <button key={s} onClick={() => setSubject(s)} className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition ${subject === s ? "bg-[#1f1f1f] text-white" : "text-white/50"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {subject === "pet" && (
          <div className="text-xs text-amber-200/80 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2">Add your pet first for better advice. Add pet ›</div>
        )}
      </div>

      {/* Avatar + prompt */}
      <div className="flex flex-col items-center text-center px-6 py-4 select-none">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-900 ring-2 ring-[#418E66]/40 mb-3">
          <Image src={subject === "pet" ? PET_AVATAR : HUMAN_AVATAR} alt="assistant" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-bold text-lg">{subject === "pet" ? "VitalKin Pet Vet" : "VitalKin AI"}</h2>
        <p className="text-sm text-white/55 mt-1">
          {subject === "pet" ? "Tell me about your pet's symptoms. Share a photo of the affected area." : "Describe your symptoms. Share a photo or use voice — I can assess what I see."}
        </p>
      </div>

      {/* Quick start */}
      <div className="px-4 select-none">
        <p className="text-xs text-white/40 mb-2">Quick start</p>
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ overscrollBehaviorX: "none" }}>
          {QUICK[subject].map((q) => (
            <button key={q} onClick={() => send(q)} className="shrink-0 px-3 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-white/80 active:scale-95 transition whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ overscrollBehaviorY: "none" }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${m.role === "user" ? "bg-[#418E66] text-white" : "bg-neutral-900 border border-neutral-800 text-white"}`}>
              {m.image_url && <Image src={m.image_url} alt="attach" className="rounded-lg mb-2 max-h-40 w-full object-cover" />}
              <p className="text-sm">{m.content}</p>
              {m.painLevel != null && <p className="text-xs text-white/60 mt-1">Pain: {m.painLevel}/10</p>}
              {m.severity && m.severity !== "none" && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: SEV_STYLE[m.severity].bg, color: "#fff" }}>{m.severity.toUpperCase()}</span>
                  <span className="text-xs text-white/60">{SEV_STYLE[m.severity].label}</span>
                </div>
              )}
              {m.remedies?.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-[#8fb347] flex items-center gap-1"><Leaf className="w-3 h-3" /> Home relief</p>
                  {m.remedies.map((r, j) => <p key={j} className="text-xs text-white/70 pl-4">• {r}</p>)}
                </div>
              )}
              {m.recommendation && (
                <p className="text-xs text-white/70 mt-2 flex items-start gap-1"><Stethoscope className="w-3 h-3 mt-0.5 shrink-0" /> {m.recommendation}</p>
              )}
              {m.severity === "red" && (
                <a href="tel:102" className="mt-2 flex items-center justify-center gap-1 bg-[#ef4444] text-white text-xs font-bold py-2 rounded-lg">Call Ambulance · 102</a>
              )}
              {m.followup && <p className="text-xs text-white/50 mt-2 italic">{m.followup}</p>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex gap-1">
              <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:.15s]" />
              <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce [animation-delay:.3s]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pain scale */}
      <div className="px-4 pt-2 select-none">
        <div className="flex items-center justify-between text-xs text-white/50 mb-2">
          <span>How severe is the pain?</span>
          <span>Tap below</span>
        </div>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPain(n)}
              className="aspect-square rounded-lg text-xs font-bold transition active:scale-90"
              style={{ background: pain === n ? painColor(n) : `${painColor(n)}33`, color: pain === n ? "#fff" : "#fff", border: pain === n ? "1.5px solid #fff" : "none" }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-white/40 mt-1">
          <span>1 · No pain</span><span>5 · Moderate</span><span>10 · Severe</span>
        </div>
      </div>

      {/* Input toolbar */}
      <div className="bg-black px-4 py-3 border-t border-neutral-900 flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="w-10 h-10 grid place-items-center rounded-full bg-neutral-900 active:scale-90 transition">
          <Camera className="w-5 h-5" />
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
        <button onClick={onMic} className="w-10 h-10 grid place-items-center rounded-full bg-neutral-900 active:scale-90 transition">
          <Mic className="w-5 h-5" />
        </button>
        {image && <span className="text-xs text-[#8fb347]">Photo ✓</span>}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe symptoms…"
          className="flex-1 bg-neutral-900 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none"
        />
        <button onClick={() => send()} disabled={loading} className="w-10 h-10 grid place-items-center rounded-full bg-[#418E66] active:scale-90 transition disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
