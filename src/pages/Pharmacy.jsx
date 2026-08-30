import { useEffect, useState } from "react";
import { Search, Upload, Plus, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import PullToRefresh from "@/components/PullToRefresh";

const CHIPS = ["Paracetamol 500mg", "Amoxicillin 250mg", "Cetirizine 10mg", "ORS Sachet", "Pantoprazole 40mg", "Ibuprofen 400mg", "Vitamin D3", "Insulin (pet)"];

export default function Pharmacy() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("human");
  const [medicine, setMedicine] = useState("");
  const [qty, setQty] = useState(1);
  const [address, setAddress] = useState("");
  const [rx, setRx] = useState(null);
  const [orders, setOrders] = useState([]);

  const load = async () => { try { setOrders(await base44.entities.Order.list("-created_date", 20)); } catch {} };
  useEffect(() => { load(); }, []);

  const place = async () => {
    if (!medicine) { toast({ title: "Enter a medicine", variant: "destructive" }); return; }
    try {
      await base44.entities.Order.create({ subject, medicine, quantity: qty, address, prescription_url: rx, status: "placed" });
      toast({ title: "Order placed" });
      setMedicine(""); setQty(1); setAddress(""); setRx(null);
      load();
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const onRx = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    base44.integrations.Core.UploadFile({ file: f }).then(({ file_url }) => setRx(file_url)).catch(() => toast({ title: "Upload failed", variant: "destructive" }));
  };

  return (
    <PullToRefresh onRefresh={load}>
      <div className="px-4 pt-4 space-y-5">
        <div>
          <h2 className="text-2xl font-bold">Pharmacy</h2>
          <p className="text-white/50 text-sm">Order medicines, delivered home</p>
        </div>

        <div className="flex bg-neutral-900 rounded-full p-1 w-44 select-none">
          {["human", "pet"].map((s) => (
            <button key={s} onClick={() => setSubject(s)} className={`flex-1 py-2 rounded-full text-sm font-semibold capitalize transition ${subject === s ? "border border-[#418E66] text-white" : "text-white/50"}`}>{s}</button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-white/40" />
          <input value={medicine} onChange={(e) => setMedicine(e.target.value)} placeholder="Search medicines…" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1" style={{ overscrollBehaviorX: "none" }}>
          {CHIPS.map((c) => (
            <button key={c} onClick={() => setMedicine(c)} className="shrink-0 px-3 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-white/80 active:scale-95 transition whitespace-nowrap">{c}</button>
          ))}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 select-none">Or enter medicine</label>
            <input value={medicine} onChange={(e) => setMedicine(e.target.value)} placeholder="Medicine name & strength" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none mt-1" />
          </div>
          <div>
            <label className="text-xs text-white/50 select-none">Quantity</label>
            <div className="flex items-center gap-3 mt-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 active:scale-90">−</button>
              <span className="text-lg font-semibold w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 active:scale-90">+</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/50 select-none">Prescription</label>
            <label className="mt-1 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-neutral-700 rounded-xl py-6 cursor-pointer active:scale-95 transition">
              <Upload className="w-5 h-5 text-white/50" />
              <span className="text-xs text-white/50">{rx ? "Rx uploaded ✓" : "Upload Rx"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={onRx} />
            </label>
          </div>
          <div>
            <label className="text-xs text-white/50 select-none">Delivery address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, street, city, PIN" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm outline-none mt-1" />
          </div>
        </div>

        <button onClick={place} className="w-full bg-white text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition">
          <Plus className="w-5 h-5" /> Place order
        </button>

        <div>
          <h3 className="font-semibold mb-2">Your orders</h3>
          {orders.length ? (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{o.medicine} × {o.quantity}</div>
                    <div className="text-xs text-white/50 capitalize">{o.status}</div>
                  </div>
                  <Package className="w-5 h-5 text-[#418E66]" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-white/40 text-sm py-8">No orders yet.</p>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}
