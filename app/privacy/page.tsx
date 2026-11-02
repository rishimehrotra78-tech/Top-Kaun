import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, fullAddress } from "@/lib/business";
import { F, LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>This policy explains what personal data {BUSINESS.legalName} ({fullAddress()}) collects through topkaun.lol, why, and your rights under the Digital Personal Data Protection Act, 2023.</p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>If you buy a listing:</strong> your brand details, the name and state for your invoice, your GSTIN if you give it, and your email address.</li>
        <li><strong>Payment details:</strong> handled entirely by Razorpay. We receive a payment ID and the amount, never your card, bank or UPI details.</li>
        <li><strong>If you browse:</strong> we count clicks on each listing. We don&apos;t use advertising cookies or track you across other sites. Our hosting provider keeps standard server logs (such as IP address and browser type) for security.</li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>To publish your listing and process your payment.</li>
        <li>To issue GST invoices and meet tax and accounting law.</li>
        <li>To contact you about your listing, payment or a refund.</li>
        <li>To keep the site secure and prevent fraud.</li>
      </ul>
      <p>We don&apos;t sell your personal data or use it for anyone else&apos;s marketing.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li>Razorpay, to process payments.</li>
        <li>Our hosting and database providers (Vercel and Supabase), who store data on our behalf.</li>
        <li>Government or tax authorities when the law requires it.</li>
      </ul>
      <p>Your brand name, description, deal, link and ad spend are public on the leaderboard. Your email, invoice details and GSTIN are never shown publicly.</p>

      <h2>How long we keep it</h2>
      <p>We keep invoice and payment records for as long as GST and income-tax law require (currently at least six years after the relevant annual return). Other data is deleted when it&apos;s no longer needed or when you ask, unless the law requires us to keep it.</p>

      <h2>Your rights</h2>
      <p>You can ask to see, correct or delete your personal data, or withdraw consent where we rely on it. Write to {BUSINESS.email}. We reply within 30 days.</p>

      <h2>Grievance officer</h2>
      <p><F v={BUSINESS.grievanceOfficer} />, {BUSINESS.email}, {fullAddress()}. See <Link href="/contact">Contact</Link>. If you&apos;re not satisfied with our reply, you can complain to the Data Protection Board of India.</p>
    </LegalPage>
  );
}
