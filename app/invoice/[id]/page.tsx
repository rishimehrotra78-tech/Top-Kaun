import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvoice } from "@/lib/supabase";
import InvoiceView from "@/components/InvoiceView";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

// The invoice id is the payment's random UUID, so only the payer (who gets the link) can open it.
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getInvoice(id);
  if (!p || !p.invoice_no) notFound();
  return (
    <main className="page">
      <div className="wrap">
        <div className="invbar noprint"><span className="muted">Keep this invoice for your GST records.</span><PrintButton /></div>
        <InvoiceView inv={{
          invoice_no: p.invoice_no,
          invoice_date: p.invoice_date,
          amount_paise: Number(p.amount_paise),
          listing: `${p.name} (${p.domain})`,
          bill_name: p.bill_name ?? p.name,
          bill_state: p.bill_state ?? "Uttar Pradesh",
          bill_gstin: p.bill_gstin,
          email: p.email,
          payment_id: p.razorpay_payment_id,
        }} />
        <p className="fine noprint">On the print screen, choose &ldquo;Save as PDF&rdquo; as the destination.</p>
      </div>
    </main>
  );
}
