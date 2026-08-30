import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Siren, MessageCircle, Activity } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import PullToRefresh from "@/components/PullToRefresh";
import { Image } from "@/components/ui/image";

const HERO_AVATAR = "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/01cf17905_generated_image.png";

const services = [
  { label: "AI Consult", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/999cf611f_generated_image.png", to: "/consult" },
  { label: "Pet Vet AI", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/0a323f215_generated_image.png", to: "/consult?subject=pet" },
  { label: "Appointments", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/1a2b75ef5_generated_image.png", to: "/appointments" },
  { label: "Video consult", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/53a30ab81_generated_image.png", to: "/appointments?type=video" },
  { label: "Pharmacy", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/e0b05f996_generated_image.png", to: "/pharmacy" },
  { label: "Loans", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/ee87e0234_generated_image.png", to: "/finance" },
  { label: "Insurance", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/8658a4b9f_generated_image.png", to: "/finance" },
  { label: "Smartwatch", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/6975ab335_generated_image.png", to: "/watch" },
  { label: "Household", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/65ba70879_generated_image.png", to: "/household" },
  { label: "Medical ID", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/6ab5a6772_generated_image.png", to: "/medical-id" },
  { label: "Blood donor", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/802d58cf5_generated_image.png", to: "/blood" },
  { label: "Responders", img: "https://media.base44.com/images/public/6a93397b4b5acaa69bef71a9/35c97c03c_generated_image.png", to: "/responders" },
];

export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sos, setSos] = useState(false);
  const [coords, setCoords] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [vitals, setVitals] = useState([]);

  const loadVitals = async () => {
    try {
      const v = await base44.entities.Vital.list("-created_date", 5);
      setVitals(v);
    } catch {}
  };
  useEffect(() => { loadVitals(); }, []);

  const triggerSOS = () => {
    setSos(true);
    if (!navigator.geolocation) {
      toast({ title: "Location not supported", description: "Geolocation unavailable on this device.", variant: "destructive" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        const q = encodeURIComponent("hospital clinic emergency near me");
        setHospitals([
          { name: "Nearest Hospital", url: `https://www.google.com/maps/search/?api=1&query=${q}&query=${latitude},${longitude}` },
          { name: "Private Ambulance", url: `https://www.google.com/maps/search/?api=1&query=private+ambulance+${latitude},${longitude}` },
          { name: "24x7 Clinic", url: `https://www.google.com/maps/search/?api=1&query=24x7+clinic+${latitude},${longitude}` },
        ]);
      },
      (err) => {
        toast({ title: "Location blocked", description: "Enable location permission for nearby care.", variant: "destructive" });
        setSos(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <PullToRefresh onRefresh={loadVitals}>
      <div className="px-6 pt-6 pb-2 space-y-6 max-w-5xl mx-auto">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#377d61] to-[#3f8d6d] shadow-xl">
          <div className="absolute -top-6 -right-4 w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/20 shadow-lg">
            <Image src={HERO_AVATAR} alt="VitalKin assistant" className="w-full h-full object-cover" fittingType="fill" />
          </div>
          <div className="p-8 pr-36">
            <p className="text-white/80 text-sm">Welcome to</p>
            <h2 className="text-4xl font-bold text-white leading-tight">VitalKin AI</h2>
            <p className="text-white/90 text-lg mt-1">Your AI health & lifeline companion — for humans and pets.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button onClick={() => navigate("/consult")} className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition shadow">
                <MessageCircle className="w-4 h-4" /> Start consult
              </button>
              <button onClick={triggerSOS} className="flex items-center gap-2 bg-[#e55e5e] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition shadow">
                <Siren className="w-4 h-4" /> SOS · 102
              </button>
              <button onClick={triggerSOS} className="flex items-center gap-2 bg-transparent text-white text-sm font-semibold px-5 py-2.5 rounded-full border border-[#4c8a70] hover:bg-white/10 active:scale-95 transition">
                <MapPin className="w-4 h-4" /> Nearby care
              </button>
            </div>
          </div>
        </div>

        {/* SOS panel */}
        {sos && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 space-y-3 animate-[fadeIn_.3s_ease]">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <Siren className="w-5 h-5 animate-pulse" /> SOS Active
            </div>
            <a href="tel:102" className="block w-full text-center bg-[#ef4444] text-white font-bold py-3 rounded-xl active:scale-95 transition">Call Ambulance · 102</a>
            {coords ? (
              <p className="text-xs text-white/60">Live location: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)} — shared with nearby hospitals.</p>
            ) : (
              <p className="text-xs text-white/60 animate-pulse">Detecting your live location…</p>
            )}
            <div className="grid sm:grid-cols-3 gap-2">
              {hospitals.map((h) => (
                <a key={h.name} href={h.url} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 text-sm active:scale-95 transition">
                  <span>{h.name}</span>
                  <MapPin className="w-4 h-4 text-[#48b88d]" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Services grid */}
        <section>
          <h3 className="text-lg font-semibold mb-4 select-none">Services</h3>
          <div className="grid grid-cols-4 gap-5">
            {services.map(({ label, img, to }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2 active:scale-90 hover:scale-[1.05] transition select-none group"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-lg group-hover:ring-[#48b88d]/60 transition">
                  <Image src={img} alt={label} className="w-full h-full object-cover" fittingType="fill" />
                </div>
                <span className="text-sm text-white/85 text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Vitals */}
        <section>
          <div className="flex items-center justify-between mb-3 select-none">
            <h3 className="text-lg font-semibold">Vitals</h3>
            <button onClick={() => navigate("/watch")} className="text-sm text-[#48b88d] font-medium hover:underline">Sync watch ›</button>
          </div>
          <div className="rounded-2xl bg-[#151515] border border-neutral-800 p-6 text-center">
            <Activity className="w-9 h-9 text-neutral-600 mx-auto mb-3" />
            {vitals.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {vitals.map((v) => (
                  <div key={v.id} className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl font-bold">{v.value}</div>
                    <div className="text-xs text-white/50 capitalize">{v.type.replace("_", " ")}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-sm text-white/70">No vitals yet. Connect your smartwatch to sync heart rate, SpO2 and more.</p>
                <button onClick={() => navigate("/watch")} className="mt-3 text-sm text-[#48b88d] font-medium hover:underline">Connect device ›</button>
              </>
            )}
          </div>
        </section>
      </div>
    </PullToRefresh>
  );
}
