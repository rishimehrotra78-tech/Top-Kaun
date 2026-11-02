import type { Metadata } from "next";
import Link from "next/link";
import { MIN_RUPEES, gstSplit, inr } from "@/lib/config";
import { LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "Pricing" };

const EXAMPLES = [49, 499, 2000, 10000];

export default function Pricing() {
  return (
    <LegalPage title="Pricing">
      <p>A sponsored listing on topkaun.lol costs whatever you choose to spend, starting at <strong>{inr(MIN_RUPEES)}</strong>. Your position on the leaderboard is set by your total ad spend compared with other brands. There are no subscriptions, setup fees or recurring charges.</p>
      <h2>What you get</h2>
      <ul>
        <li>A listing with your brand name, one line about you, your deal and coupon code, and a link to your site or social page.</li>
        <li>A position on the all-time leaderboard and, on the day you pay, on Today&apos;s leaderboard.</li>
        <li>A public count of visits sent to you.</li>
        <li>Your listing stays live for as long as topkaun.lol runs. There is no expiry.</li>
      </ul>
      <h2>Taxes</h2>
      <p>All prices include 18% GST. You get a GST tax invoice after payment. Add your GSTIN at checkout to claim input tax credit.</p>
      <div className="tblwrap">
        <table className="inv" style={{ padding: 0, border: 0 }}>
          <thead><tr><th>You pay</th><th className="r">Taxable value</th><th className="r">GST (18%)</th></tr></thead>
          <tbody>
            {EXAMPLES.map((r) => {
              const g = gstSplit(r * 100, false);
              return <tr key={r}><td>{inr(r)}</td><td className="r">{inr(g.taxable, true)}</td><td className="r">{inr(g.igst, true)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
      <h2>Adding more</h2>
      <p>You can add to your listing&apos;s ad spend at any time. Each payment adds to your total and gets its own invoice. To move above another brand, your total needs to be at least ₹1 more than theirs.</p>
      <h2>Payment</h2>
      <p>Payments are processed securely by Razorpay. We accept UPI (Google Pay, PhonePe, Paytm, BHIM and other UPI apps), cards and net banking. We never see or store your card or UPI details.</p>
      <p>See our <Link href="/refunds">Refund policy</Link> for when payments are refunded.</p>
    </LegalPage>
  );
}
