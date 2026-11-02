import Link from "next/link";
import { BUSINESS } from "@/lib/business";

/** Shows a business detail; values still marked TODO are highlighted so they're easy to spot before launch. */
export function F({ v }: { v: string }) {
  return v.includes("TODO") ? <span className="todo">{v}</span> : <>{v}</>;
}

export function LegalPage({ title, children, updated = true }: { title: string; children: React.ReactNode; updated?: boolean }) {
  return (
    <main className="page">
      <div className="wrap">
        <Link className="back" href="/">← Back to the leaderboard</Link>
        <h1>{title}</h1>
        {updated && <p className="updated">Last updated {BUSINESS.lastUpdated}</p>}
        {children}
      </div>
    </main>
  );
}
