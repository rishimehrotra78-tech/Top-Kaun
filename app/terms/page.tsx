import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, fullAddress } from "@/lib/business";
import { MIN_RUPEES, inr } from "@/lib/config";
import { LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function Terms() {
  const n = BUSINESS.legalName;
  return (
    <LegalPage title="Terms and conditions">
      <p>These terms apply to everyone who uses topkaun.lol (&ldquo;the site&rdquo;), which is operated by {n}, {fullAddress()} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site or buying a listing, you agree to them.</p>

      <h2>1. What the service is</h2>
      <p>topkaun.lol sells sponsored listings, which are internet advertising space. A listing shows a brand&apos;s name, a short description, a deal for visitors and a link. Listings are ranked by each brand&apos;s total ad spend on the site. The site is advertising. It is not an auction, a game, a contest or a lottery, and nobody wins money, prizes or rewards through it.</p>

      <h2>2. Who can buy a listing</h2>
      <p>You must be at least 18 years old and buying for a business, brand, product or creator you own or are authorised to promote. You must give accurate billing details.</p>

      <h2>3. Buying and ranking</h2>
      <ul>
        <li>You choose the amount, from {inr(MIN_RUPEES)} upwards. All amounts include 18% GST.</li>
        <li>Your listing&apos;s position is its total ad spend compared with all other listings. Ties are ordered by who listed first.</li>
        <li>Other brands can spend more at any time, so your position can go down. We don&apos;t promise any position, number of visits or sales.</li>
        <li>Payments to an already-listed link add to that listing&apos;s total. Only the original lister&apos;s name, description and deal are shown.</li>
        <li>Listings stay live while the site operates, unless removed under section 5.</li>
      </ul>

      <h2>4. Your listing content and deal</h2>
      <ul>
        <li>Every listing must offer a genuine deal for topkaun visitors, and you must honour the coupon code you list for at least 30 days from listing. You are responsible for your deal, products and customer service.</li>
        <li>Your content must be accurate and lawful, and must not infringe anyone&apos;s trademark, copyright or other rights.</li>
        <li>You give us permission to display your name, description, deal and link on the site and in promotion of the site.</li>
      </ul>

      <h2>5. Listings we don&apos;t accept</h2>
      <p>Listings go live as soon as you pay, and we review every listing within 24 hours. We don&apos;t accept betting, gambling or real-money gaming; adult content; cryptocurrency schemes; instant-loan apps; weapons, drugs or anything illegal in India; misleading health claims; or anything that impersonates another brand. If we reject a listing in that review, we remove it and give you a full refund as described in our <Link href="/refunds">Refund policy</Link>. If a live listing breaks these rules, we may remove it without refund.</p>

      <h2>6. Visitors</h2>
      <p>Deals and links on the site are offered by the listed brands, not by us. Purchases you make from a brand are between you and that brand. We remove listings that don&apos;t honour their deals when we&apos;re told about it.</p>

      <h2>7. Payments and invoices</h2>
      <p>Payments are processed by Razorpay. We issue a GST tax invoice for each payment. We don&apos;t store card or UPI details.</p>

      <h2>8. Liability</h2>
      <p>The site is provided as it is. To the extent the law allows, our total liability to you for any claim is limited to the amount you paid us in the 12 months before the claim. We aren&apos;t liable for indirect losses, such as lost profit or business.</p>

      <h2>9. Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version. Changes don&apos;t affect payments made before they were published.</p>

      <h2>10. Law and disputes</h2>
      <p>These terms are governed by the laws of India. Courts at Lakhimpur Kheri, Uttar Pradesh have jurisdiction. Please contact us first at {BUSINESS.email}; we try to resolve every complaint directly.</p>
    </LegalPage>
  );
}
