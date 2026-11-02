"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, GSTIN_RE, MIN_RUPEES, STATES, inr, normDomain } from "@/lib/config";

export type ClaimStart = { amount: number; category?: string };

type RzpResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    document.body.appendChild(s);
  });
}

type Done = { name: string; rank?: number; totalRupees?: number; invoiceUrl?: string };

export default function ClaimDialog({ start, rankFor, onClose }: {
  start: ClaimStart; rankFor: (r: number) => number; onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [f, setF] = useState({
    name: "", url: "", tagline: "", deal: "", code: "", category: start.category ?? "D2C",
    amount: String(start.amount), billName: "", billState: "", billGstin: "", email: "",
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => { ref.current?.showModal(); }, []);

  const amount = parseInt(f.amount.replace(/\D/g, ""), 10) || 0;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const close = () => { ref.current?.close(); onClose(); };

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const gstin = f.billGstin.trim().toUpperCase();
    if (!f.name.trim()) return setErr("Add your brand name.");
    if (!normDomain(f.url)) return setErr("Add a website or Instagram link.");
    if (!f.tagline.trim()) return setErr("Add one line about your brand.");
    if (!f.deal.trim() || !f.code.trim()) return setErr("Every listing needs a deal and a coupon code for visitors.");
    if (amount < MIN_RUPEES) return setErr(`The minimum is ${inr(MIN_RUPEES)}.`);
    if (!f.billName.trim() || !f.billState) return setErr("Add the invoice name and your state.");
    if (gstin && !GSTIN_RE.test(gstin)) return setErr("That GSTIN doesn't look right. Leave it empty if you don't have one.");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Add an email for your invoice.");

    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, billGstin: gstin, amount }),
      });
      const o = await res.json();
      if (!res.ok) throw new Error(o.error ?? "Could not start payment.");
      await loadCheckout();

      const rzp = new window.Razorpay!({
        key: o.keyId,
        order_id: o.orderId,
        amount: o.amountPaise,
        currency: "INR",
        name: "eknumber.in",
        description: o.topUp ? `Ad spend for ${o.listingName}` : `Sponsored listing: ${o.listingName}`,
        prefill: { email: f.email },
        theme: { color: "#C4161C" },
        config: { display: { preferences: { show_default_blocks: true }, sequence: ["block.upi"], blocks: { upi: { name: "Pay with UPI", instruments: [{ method: "upi" }] } } } },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: RzpResponse) => {
          const v = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
          const d = await v.json().catch(() => ({}));
          setDone(v.status === 200 ? { name: o.listingName, rank: d.rank, totalRupees: d.totalRupees, invoiceUrl: d.invoiceUrl } : { name: o.listingName });
          setBusy(false);
          router.refresh();
        },
      });
      rzp.on("payment.failed", () => { setErr("Payment didn't go through and no money was taken. Try again."); setBusy(false); });
      rzp.open();
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <dialog ref={ref} onClose={onClose} aria-labelledby="dT">
        <div className="dlg">
          <div className="big">{done.rank ? `#${done.rank}` : "✓"}</div>
          <h3 id="dT">{done.name} is live</h3>
          <p className="fine" style={{ margin: 0 }}>
            {done.totalRupees ? `Total ad spend ${inr(done.totalRupees)}. ` : "Payment received. Your listing appears in a few seconds. "}
            Keep your tax invoice for your records.
          </p>
          <div className="acts">
            {done.invoiceUrl && <a className="btn ghost" href={done.invoiceUrl} target="_blank" rel="noopener">View invoice</a>}
            <button type="button" className="btn" onClick={close}>See my listing</button>
          </div>
        </div>
      </dialog>
    );
  }

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="dT">
      <form className="dlg" onSubmit={pay} noValidate>
        <h3 id="dT">Get listed</h3>
        <label>Brand name<input id="fName" maxLength={40} value={f.name} onChange={set("name")} placeholder="Masala Lab" autoFocus /></label>
        <label>Website or Instagram<input id="fUrl" value={f.url} onChange={set("url")} placeholder="masalalab.co" /></label>
        <label>One line about it<input id="fTag" maxLength={80} value={f.tagline} onChange={set("tagline")} placeholder="Single-origin spices, harvest date on every jar" /></label>
        <div className="r2">
          <label>Deal for visitors<input id="fDeal" maxLength={28} value={f.deal} onChange={set("deal")} placeholder="15% off" /></label>
          <label>Coupon code<input id="fCode" maxLength={16} value={f.code} onChange={set("code")} placeholder="EKNUMBER15" style={{ textTransform: "uppercase" }} /></label>
        </div>
        <div className="r2">
          <label>Category<select id="fCat" value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Ad spend (₹)<input id="fAmt" inputMode="numeric" value={f.amount} onChange={set("amount")} /></label>
        </div>
        <div className="r2">
          <label>Name on invoice<input id="fBill" maxLength={80} value={f.billName} onChange={set("billName")} placeholder="Masala Lab Pvt Ltd" /></label>
          <label>State<select id="fState" value={f.billState} onChange={set("billState")}>
            <option value="">Choose…</option>{STATES.map((s) => <option key={s}>{s}</option>)}
          </select></label>
        </div>
        <div className="r2">
          <label>GSTIN (optional)<input id="fGst" maxLength={15} value={f.billGstin} onChange={set("billGstin")} placeholder="For input tax credit" style={{ textTransform: "uppercase" }} /></label>
          <label>Email for invoice<input id="fEmail" type="email" value={f.email} onChange={set("email")} placeholder="you@brand.in" /></label>
        </div>
        <div className="sum">
          <div><span>Your rank</span><span>{amount >= MIN_RUPEES ? `#${rankFor(amount)}` : `Min ${inr(MIN_RUPEES)}`}</span></div>
          <div className="t"><span>Total (incl. 18% GST)</span><span className="num">{inr(amount)}</span></div>
        </div>
        <p className="fine" style={{ margin: 0 }}>
          If this link is already listed, your spend adds to its total. By paying you agree to the <a href="/terms" target="_blank">Terms</a> and <a href="/refunds" target="_blank">Refund policy</a>.
        </p>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="acts">
          <button type="button" className="btn ghost" onClick={close}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? "Opening UPI…" : "Pay with UPI"}</button>
        </div>
      </form>
    </dialog>
  );
}
