import { BUSINESS, fullAddress } from "@/lib/business";
import { gstSplit, inr } from "@/lib/config";
import { F } from "@/components/Legal";

export type InvoiceData = {
  invoice_no: string;
  invoice_date: string; // YYYY-MM-DD
  amount_paise: number;
  listing: string;
  bill_name: string;
  bill_state: string;
  bill_gstin: string | null;
  email: string | null;
  payment_id: string | null;
};

// Rupees in words, Indian system (for the "amount in words" line on GST invoices).
function words(n: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number) => (x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : ""));
  const three = (x: number) => (x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + two(x % 100) : "") : two(x));
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7); n %= 1e7;
  const lakh = Math.floor(n / 1e5); n %= 1e5;
  const thousand = Math.floor(n / 1e3); n %= 1e3;
  if (crore) parts.push(three(crore) + " Crore");
  if (lakh) parts.push(two(lakh) + " Lakh");
  if (thousand) parts.push(two(thousand) + " Thousand");
  if (n) parts.push(three(n));
  return parts.join(" ");
}

export default function InvoiceView({ inv, sample = false }: { inv: InvoiceData; sample?: boolean }) {
  const intra = inv.bill_state === BUSINESS.address.state;
  const g = gstSplit(inv.amount_paise, intra);
  const rupees = Math.floor(inv.amount_paise / 100), paise = inv.amount_paise % 100;
  const date = new Date(inv.invoice_date + "T00:00:00+05:30").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="inv">
      <div className="hd">
        <div>
          <h1>Tax Invoice{sample ? " (sample)" : ""}</h1>
          <div style={{ fontSize: 14, marginTop: 4 }}>Invoice no. <strong>{inv.invoice_no}</strong> · {date}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 14 }}>
          <strong>{BUSINESS.legalName}</strong><br />
          Proprietor: <F v={BUSINESS.proprietorName} /><br />
          GSTIN: <F v={BUSINESS.gstin} />
        </div>
      </div>

      <div className="parties">
        <div>
          <b>Supplier</b>
          {BUSINESS.legalName} (topkaun.lol)<br />
          {fullAddress()}<br />
          State: {BUSINESS.address.state} ({BUSINESS.address.stateCode})<br />
          {BUSINESS.email}
        </div>
        <div>
          <b>Billed to</b>
          {inv.bill_name}<br />
          State: {inv.bill_state}<br />
          {inv.bill_gstin ? <>GSTIN: {inv.bill_gstin}<br /></> : <>Unregistered<br /></>}
          {inv.email}
        </div>
      </div>

      <div className="tblwrap">
        <table>
          <thead>
            <tr><th>Description</th><th>SAC</th><th className="r">Taxable value</th>
              {intra ? <><th className="r">CGST 9%</th><th className="r">SGST 9%</th></> : <th className="r">IGST 18%</th>}
              <th className="r">Total</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>{BUSINESS.serviceDescription}<br /><span style={{ color: "#6A6466" }}>Listing: {inv.listing}</span></td>
              <td>{BUSINESS.sac}</td>
              <td className="r">{inr(g.taxable, true)}</td>
              {intra ? <><td className="r">{inr(g.cgst, true)}</td><td className="r">{inr(g.sgst, true)}</td></> : <td className="r">{inr(g.igst, true)}</td>}
              <td className="r">{inr(g.total, true)}</td>
            </tr>
            <tr className="tot">
              <td colSpan={intra ? 5 : 4}>Total (Rupees {words(rupees)}{paise ? ` and ${words(paise)} Paise` : ""} only)</td>
              <td className="r">{inr(g.total, true)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="foot">
        <span>Place of supply: {inv.bill_state}. Tax payable on reverse charge: No.</span>
        {inv.payment_id && <span>Paid online via Razorpay. Payment ID: {inv.payment_id}</span>}
        <span>This is a computer-generated invoice and does not need a signature.</span>
      </div>
    </div>
  );
}
