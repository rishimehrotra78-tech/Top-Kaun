import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, fullAddress } from "@/lib/business";
import { AD_REINVEST_PERCENT } from "@/lib/config";
import { LegalPage } from "@/components/Legal";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <LegalPage title="About eknumber" updated={false}>
      <p>eknumber.in is a sponsored leaderboard for Indian brands. Brands buy a sponsored listing, and their position on the list is set by their total ad spend. Every listing includes an exclusive deal for people who visit through topkaun.</p>
      <h2>What we sell</h2>
      <p>We sell internet advertising space: a sponsored listing on eknumber.in with a link to the brand&apos;s website or social page. The brand chooses how much to spend, from ₹49 upwards. There are no subscriptions, auctions or recurring charges. See <Link href="/pricing">Pricing</Link>.</p>
      <h2>Who it&apos;s for</h2>
      <ul>
        <li><strong>Brands</strong> — D2C labels, apps, SaaS products, agencies, creators and local businesses that want visibility quickly, without running their own ad accounts.</li>
        <li><strong>Shoppers</strong> — people looking for new Indian brands and exclusive discount codes.</li>
      </ul>
      {AD_REINVEST_PERCENT > 0 && (
        <>
          <h2>How we bring visitors</h2>
          <p>{AD_REINVEST_PERCENT}% of all ad spend is set aside for Meta and Google advertising that promotes the leaderboard to shoppers in India. The amount spent is shown on the home page.</p>
        </>
      )}
      <h2>Who runs it</h2>
      <p>eknumber.in is operated by <strong>{BUSINESS.legalName}</strong>, a proprietorship owned by {BUSINESS.proprietorName}, {fullAddress()} (GSTIN {BUSINESS.gstin}). Questions: <Link href="/contact">Contact us</Link>.</p>
    </LegalPage>
  );
}
