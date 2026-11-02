import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export function SiteHeader() {
  return (
    <header>
      <div className="wrap">
        <Link className="logo" href="/">top<span>kaun</span>.lol</Link>
        <nav className="top" aria-label="Main">
          <Link href="/#why">Why topkaun</Link>
          <Link href="/#how">How ranking works</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <span>topkaun.lol is operated by {BUSINESS.legalName} · Made in India</span>
        <nav aria-label="Legal">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refunds">Refunds</Link>
        </nav>
      </div>
    </footer>
  );
}
