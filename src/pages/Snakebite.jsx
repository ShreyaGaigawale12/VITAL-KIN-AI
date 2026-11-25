import { useEffect, useRef, useState } from "react";
import { Camera, MapPin, Phone, Navigation, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import PullToRefresh from "@/components/PullToRefresh";

const SEV = {
  red: { bg: "#ef4444", label: "Likely venomous — hospital now" },
  yellow: { bg: "#c9a04a", label: "Caution — get checked" },
  green: { bg: "#418E66", label: "Likely non-venomous" },
};

function distKm(a, b) {
  if (a.lat == null || b.lat == null) return null;
  const R = 6371, toR = (d) => (d * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

export default function Snakebite() {
  const { toast } = useToast();
  const [photo, setPhoto] = useState(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [coords, setCoords] = useState(null);
  const fileRef = useRef(null);

  const loadFacilities = async () => {
    try { setFacilities(await base44.entities.AntivenomFacility.list()); } catch {}
  };
  useEffect(() => { loadFacilities(); }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    base44.integrations.Core.UploadFile({ file })
      .then(({ file_url }) => setPhoto(file_url))
      .catch(() => toast({ title: "Upload failed", variant: "destructive" }));
  };

  const identify = async () => {
    if (!photo && !desc) { toast({ title: "Add a photo or describe the snake", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("SnakebiteIdentify", { image_url: photo, description: desc });
      setResult(res.data?.result || res.data);
    } catch (e) {
      toast({ title: "Identification failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const sorted = [...facilities].sort((a, b) => {
    if (a.antivenom_in_stock !== b.antivenom_in_stock) return a.antivenom_in_stock ? -1 : 1;
    if (coords) return (distKm(coords, a) ?? 0) - (distKm(coords, b) ?? 0);
    return 0;
  });

  return (
    <PullToRefresh onRefresh={loadFacilities}>
      <div className="px-4 pt-4 pb-6 space-y-5 max-w-3xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-6 h-6 text-amber-400" /> Snakebite response</h2>
          <p className="text-white/50 text-sm">Identify the likely snake and find a facility with antivenom in stock.</p>
        </div>

        <div className="rounded-2xl bg-red-500/10 border border-red-500/40 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-300">Get to a hospital regardless of what this tool says.</p>
            <p className="text-xs text-white/60 mt-1">Photo ID is unreliable. Do not delay transport waiting for a result.</p>
            <a href="tel:102" className="mt-2 inline-flex items-center gap-1 bg-[#ef4444] text-white text-sm font-bold px-4 py-2 rounded-lg">Call Ambulance · 102</a>
          </div>
        </div>

        <div className="rounded-2xl bg-[#151515] border border-neutral-800 p-4 space-y-3">
          <button onClick={() => fileRef.current?.click()} className="w-full aspect-[4/2] rounded-xl border-2 border-dashed border-neutral-700 grid place-items-center overflow-hidden">
            {photo ? <Image src={photo} alt="snake" className="w-full h-full object-cover" /> : (
              <div className="text-center text-white/50"><Camera className="w-7 h-7 mx-auto mb-1" /><p className="text-xs">Snap the snake if safe to do so</p></div>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPhoto} />
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe: colour, markings, where seen, time of bite, symptoms…" rows={2} className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none" />
          <button onClick={identify} disabled={loading} className="w-full bg-[#418E66] text-white font-bold py-3 rounded-xl active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Identifying…</> : "Identify likely snake"}
          </button>
        </div>

        {result && (
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: SEV[result.severity]?.bg || "#262626" }}>{(result.severity || "none").toUpperCase()}</span>
              <span className="text-xs text-white/60">{SEV[result.severity]?.label}</span>
            </div>
            <p className="text-sm"><span className="text-white/50">Likely snake: </span><span className="font-semibold">{result.likely_snake}</span>
              {result.venomous != null && <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${result.venomous ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>{result.venomous ? "Venomous" : "Likely non-venomous"}</span>}
            </p>
            {result.first_aid?.length > 0 && (
              <div><p className="text-xs font-semibold text-[#8fb347]">First aid</p>{result.first_aid.map((f, i) => <p key={i} className="text-xs text-white/70 pl-4">• {f}</p>)}</div>
            )}
            {result.home_remedies?.length > 0 && (
              <div><p className="text-xs font-semibold text-[#c9a04a]">Home / supportive measures</p>{result.home_remedies.map((f, i) => <p key={i} className="text-xs text-white/70 pl-4">• {f}</p>)}</div>
            )}
            {result.do_not?.length > 0 && (
              <div><p className="text-xs font-semibold text-red-300">Do NOT</p>{result.do_not.map((f, i) => <p key={i} className="text-xs text-white/70 pl-4">• {f}</p>)}</div>
            )}
            <p className="text-xs text-amber-200/80 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2">{result.warning}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-[#48b88d]" /> Antivenom facilities</h3>
            {coords && <span className="text-xs text-white/40">Sorted by stock &amp; distance</span>}
          </div>
          {sorted.map((f) => {
            const d = coords ? distKm(coords, f) : null;
            const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.name + " " + (f.address || f.city || ""))}`;
            return (
              <div key={f.id} className="rounded-2xl bg-[#151515] border border-neutral-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{f.name}</p>
                    <p className="text-xs text-white/50">{f.city}{f.address ? ` · ${f.address}` : ""}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${f.antivenom_in_stock ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{f.antivenom_in_stock ? "In stock" : "Out of stock"}</span>
                </div>
                {f.snake_types && <p className="text-xs text-white/45 mt-1">Covers: {f.snake_types}</p>}
                {f.stock_note && <p className="text-xs text-white/45">{f.stock_note}</p>}
                <div className="flex gap-2 mt-3">
                  {f.phone && <a href={`tel:${f.phone}`} className="flex-1 flex items-center justify-center gap-1 bg-neutral-900 border border-neutral-800 text-xs font-semibold py-2 rounded-lg"><Phone className="w-3.5 h-3.5" /> Call</a>}
                  <a href={maps} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 bg-[#418E66] text-white text-xs font-semibold py-2 rounded-lg"><Navigation className="w-3.5 h-3.5" /> {d != null ? `${d} km` : "Directions"}</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PullToRefresh>
  );
}
