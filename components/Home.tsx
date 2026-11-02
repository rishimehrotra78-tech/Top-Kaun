"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AD_REINVEST_PERCENT, CATEGORIES, MIN_RUPEES, count, inr } from "@/lib/config";
import type { Listing } from "@/lib/supabase";
import ClaimDialog, { type ClaimStart } from "./ClaimDialog";

type Props = {
  view: "all" | "today";
  board: Listing[];
  allTime: Listing[];
  stats: { totalRupees: number; brands: number; clicks: number; adFundSpentRupees: number };
};

const PAGE = 25;
const HUES = ["#C4161C", "#1F5FAE", "#0E7A4F", "#7A3FB0", "#B7791F", "#0F7C8C", "#A13A68", "#4B5563"];
const hue = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return HUES[h % HUES.length]; };

export default function Home({ view, board, allTime, stats }: Props) {
  const [cat, setCat] = useState("All");
  const [shown, setShown] = useState(PAGE);
  const [claim, setClaim] = useState<ClaimStart | null>(null);
  const [toast, setToast] = useState("");

  const topPrice = allTime.length ? allTime[0].amount_paise / 100 + 1 : MIN_RUPEES;
  const [amt, setAmt] = useState<number>(topPrice);
  const a = Math.max(MIN_RUPEES, amt || 0);
  const rankFor = (rupees: number) => allTime.filter((l) => l.amount_paise / 100 >= rupees).length + 1;

  const rows = useMemo(
    () => board.map((l, i) => ({ l, rank: i + 1 })).filter((r) => cat === "All" || r.l.category === cat),
    [board, cat],
  );

  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(""), 1800); };
  const copy = async (code: string) => {
    try { await navigator.clipboard.writeText(code); flash(`Code copied: ${code}`); } catch { flash(`Code: ${code}`); }
  };

  const pool = (stats.totalRupees * AD_REINVEST_PERCENT) / 100;

  return (
    <main>
      <div className="wrap">
        <div className="intro">
          <h1>India&apos;s sponsored leaderboard. <em>Ek number deals.</em></h1>
          <p>Brands rank by total ad spend. You get an exclusive deal from every one of them.</p>
          <div className="stats">
            <span><b>{inr(stats.totalRupees)}</b> ad spend</span>
            <span><b>{count(stats.brands)}</b> brands</span>
            <span><b>{count(stats.clicks)}</b> visits sent</span>
          </div>
        </div>

        <form className="spend" aria-label="Get listed" onSubmit={(e) => { e.preventDefault(); setClaim({ amount: a }); }}>
          <span className="lbl">Reach #{rankFor(a)} for</span>
          <div className="stepper">
            <button type="button" aria-label="Lower by ₹100" onClick={() => setAmt(Math.max(MIN_RUPEES, a - 100))}>−</button>
            <label htmlFor="spAmt">₹<input
              id="spAmt" inputMode="numeric" aria-label="Ad spend in rupees"
              value={amt ? new Intl.NumberFormat("en-IN").format(amt) : ""}
              onChange={(e) => setAmt(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0)}
              onBlur={() => setAmt(a)}
            /></label>
            <button type="button" aria-label="Raise by ₹100" onClick={() => setAmt(a + 100)}>+</button>
          </div>
          <button className="btn" type="submit">Get listed</button>
        </form>
        <p className="fine">From {inr(MIN_RUPEES)}. Pay by UPI. Prices include 18% GST; you get a tax invoice.</p>

        <div className="bar" id="board">
          <div className="tabs" role="group" aria-label="Time range">
            <Link href="/" aria-pressed={view === "all"} role="button" className="tab">All-time</Link>
            <Link href="/?view=today" aria-pressed={view === "today"} role="button" className="tab">Today</Link>
          </div>
          <select className="cat" aria-label="Category" value={cat} onChange={(e) => { setCat(e.target.value); setShown(PAGE); }}>
            {["All", ...CATEGORIES].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <ol className="list">
          {rows.length ? rows.slice(0, shown).map(({ l, rank }) => {
            const spend = l.amount_paise / 100;
            return (
              <li key={l.id} className={"item" + (rank <= 3 ? " top" : "")}>
                <span className="rk">{rank}</span>
                <span className="av" style={{ background: hue(l.name) }} aria-hidden="true">{l.name[0]}</span>
                <div className="body">
                  <a className="name" href={`/go/${l.id}`} target="_blank" rel="noopener sponsored">{l.name}</a>
                  <div className="tag">{l.tagline}</div>
                  <div className="sub">
                    {l.code && (
                      <button className="deal" onClick={() => copy(l.code)} aria-label={`Copy code ${l.code}`}>
                        {l.deal} · <code>{l.code}</code>
                      </button>
                    )}
                    <span>{l.category}</span>
                    <span className="num">{count(l.clicks)} visits</span>
                  </div>
                </div>
                <div className="right">
                  <span className="amt">{inr(spend)}</span>
                  <button className="reach" onClick={() => setClaim({ amount: spend + 1, category: l.category })}>Reach #{rank} →</button>
                </div>
              </li>
            );
          }) : (
            <li className="empty">No {cat === "All" ? "" : cat + " "}brands {view === "today" ? "today" : "yet"}. Be the first one listed.</li>
          )}
        </ol>
        {rows.length > shown && <button className="more" type="button" onClick={() => setShown(shown + PAGE)}>Show more</button>}

        <section className="block" id="why">
          <h2>Why eknumber</h2>
          <div className="two">
            <div className="card">
              <h3>For shoppers</h3>
              <ul>
                <li><b>Exclusive codes.</b> Every brand here offers a deal for eknumber visitors.</li>
                <li><b>New Indian brands first.</b> D2C launches, apps and local favourites in one list.</li>
                <li><b>Changes every day.</b> The ranking moves as brands spend, so there&apos;s always something new.</li>
              </ul>
            </div>
            <div className="card">
              <h3>For brands</h3>
              <ul>
                <li><b>Live in minutes.</b> No ad account, no creative review, no learning phase.</li>
                {AD_REINVEST_PERCENT > 0 && <li><b>Paid traffic, not just a slot.</b> {AD_REINVEST_PERCENT}% of all ad spend buys ads that send shoppers to this board.</li>}
                <li><b>Proof it works.</b> Public visit counts per listing, and your coupon code tracks real sales.</li>
                <li><b>Any budget.</b> List from {inr(MIN_RUPEES)}. The #1 spot goes to whoever spends most.</li>
              </ul>
            </div>
          </div>
          {AD_REINVEST_PERCENT > 0 && (
            <>
              <div className="fund">
                <span>Spent promoting this board</span>
                <div className="meter" aria-hidden="true"><i style={{ width: `${pool ? Math.min(100, (stats.adFundSpentRupees / pool) * 100) : 0}%` }} /></div>
                <b>{inr(stats.adFundSpentRupees)}</b>
              </div>
              <p className="fine">{AD_REINVEST_PERCENT}% of all ad spend ({inr(pool)} so far) is set aside for Meta and Google ads that bring shoppers here.</p>
            </>
          )}
        </section>

        <section className="block" id="how">
          <h2>How ranking works</h2>
          <ol className="steps">
            <li><b>Your position is your total ad spend.</b> Add more any time and it adds up.</li>
            <li><b>To move above a brand,</b> your total needs to be at least ₹1 more than theirs.</li>
            <li><b>Your listing stays up</b> for as long as the site runs. There&apos;s no expiry.</li>
            <li><b>Every listing must include a working deal</b> for eknumber visitors.</li>
            <li><b>We review every listing within 24 hours.</b> No betting, adult content, crypto schemes or instant-loan apps. <Link href="/refunds">Rejected listings get a full refund</Link> within 7 business days.</li>
          </ol>
        </section>
      </div>

      {claim && <ClaimDialog start={claim} rankFor={rankFor} onClose={() => setClaim(null)} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
