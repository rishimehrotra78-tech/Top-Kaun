import type { Metadata } from "next";
import InvoiceView from "@/components/InvoiceView";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = { title: "Sample invoice", robots: { index: false, follow: false } };

// For the Razorpay activation form ("sample invoice"): open this page, Print → Save as PDF.
export default function SampleInvoice() {
  return (
    <main className="page">
      <div className="wrap">
        <div className="invbar noprint"><span className="muted">Keep this invoice for your GST records.</span><PrintButton /></div>
        <InvoiceView sample inv={{
          invoice_no: "TK/2627/000001",
          invoice_date: "2026-11-02",
          amount_paise: 49900,
          listing: "Masala Lab (masalalab.co)",
          bill_name: "Masala Lab Private Limited",
          bill_state: "Karnataka",
          bill_gstin: null,
          email: "accounts@example.com",
          payment_id: "pay_SAMPLE0000000",
        }} />
      </div>
    </main>
  );
}
