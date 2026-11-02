import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";
import { LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "Shipping and delivery policy" };

export default function Shipping() {
  return (
    <LegalPage title="Shipping and delivery policy">
      <p>topkaun.lol, operated by {BUSINESS.legalName}, sells a digital advertising service: sponsored listings on our website. We don&apos;t sell or ship any physical products.</p>

      <h2>How the service is delivered</h2>
      <ul>
        <li>Your sponsored listing is published on topkaun.lol automatically as soon as your payment is confirmed, usually within a minute.</li>
        <li>Your GST tax invoice is available straight after payment, with a link on the confirmation screen.</li>
        <li>Nothing is sent by post or courier, so there are no shipping charges and no delivery address is needed.</li>
      </ul>

      <h2>If your listing doesn&apos;t appear</h2>
      <p>If you&apos;ve paid and your listing isn&apos;t visible within 30 minutes, email {BUSINESS.email} or call {BUSINESS.phone} ({BUSINESS.supportHours}) with your payment ID. We&apos;ll publish it or refund you in full. See our <Link href="/refunds">Cancellation and refund policy</Link>.</p>

      <h2>Products from listed brands</h2>
      <p>Brands on the leaderboard sell and ship their own products. Their shipping terms apply to anything you buy from them, and any questions about those orders should go to the brand.</p>
    </LegalPage>
  );
}
