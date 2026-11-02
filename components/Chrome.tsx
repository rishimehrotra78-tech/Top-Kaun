import Link from "next/link";
import { BUSINESS, fullAddress } from "@/lib/business";

export function SiteHeader() {
  return (
    <header>
      <div className="wrap">
        <Link className="logo" href="/">ek<span>number</span>.in</Link>
        <nav className="top" aria-label="Main">
          <Link href="/#why">Why eknumber</Link>
          <Link href="/#how">How ranking works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap footgrid">
        <nav aria-label="Policies" className="footlinks">
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/terms">Terms and conditions</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/refunds">Cancellation and refunds</Link>
          <Link href="/shipping">Shipping and delivery</Link>
        </nav>
        <div className="biz">
          <strong>{BUSINESS.legalName}</strong> (Proprietor: {BUSINESS.proprietorName}) operates eknumber.in.<br />
          {fullAddress()}<br />
          GSTIN {BUSINESS.gstin} · {BUSINESS.email} · {BUSINESS.phone}<br />
          Payments are processed securely by Razorpay. All prices in INR, inclusive of 18% GST.
        </div>
      </div>
    </footer>
  );
}
