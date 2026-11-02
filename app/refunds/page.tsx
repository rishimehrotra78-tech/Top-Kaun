import type { Metadata } from "next";
import { BUSINESS } from "@/lib/business";
import { LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "Refund and cancellation policy" };

export default function Refunds() {
  return (
    <LegalPage title="Refund and cancellation policy">
      <p>This policy covers payments for sponsored listings on topkaun.lol, operated by {BUSINESS.legalName}.</p>

      <h2>Full refunds</h2>
      <p>You get a full refund in these cases:</p>
      <ul>
        <li><strong>We reject your listing</strong> in our review, which happens within 24 hours of payment (for example, because it falls in a category we don&apos;t accept). We remove it, email you, and start the refund within 2 business days of the decision.</li>
        <li><strong>You were charged twice</strong> for the same payment, or charged but no listing or top-up was recorded.</li>
        <li><strong>A technical error on our side</strong> stopped your listing from being shown.</li>
      </ul>

      <h2>When payments are not refundable</h2>
      <ul>
        <li>Your listing goes live as soon as you pay. Once it has passed our review, the advertising service has been delivered and the payment is not refundable. This includes when another brand moves above you.</li>
        <li>If we remove a live listing because it broke our Terms (for example, the deal wasn&apos;t honoured or the content was misleading), the payment is not refunded.</li>
      </ul>

      <h2>Cancellation</h2>
      <p>You can ask us to remove your listing at any time. Removal on request is not refunded, because the listing has already been shown.</p>

      <h2>How to ask for a refund</h2>
      <p>Email {BUSINESS.email} with your payment ID (it starts with <code>pay_</code>) and the reason. We reply within 2 business days.</p>

      <h2>How long it takes</h2>
      <p>Approved refunds go back to the original payment method (your UPI account, card or bank). Refunds are credited within 5–7 business days of approval, depending on your bank. If you get a refund for GST you paid, we issue a credit note.</p>
    </LegalPage>
  );
}
