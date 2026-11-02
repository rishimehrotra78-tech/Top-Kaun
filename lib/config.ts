export const SITE_NAME = "topkaun.lol";
export const MIN_RUPEES = 49;
export const MAX_RUPEES = 10_00_000; // ₹10 lakh per payment
export const GST_RATE = 0.18;
/** Share of all ad spend reinvested in ads that promote the board. Shown on the site — set to 0 to hide. */
export const AD_REINVEST_PERCENT = 30;

export const CATEGORIES = [
  "D2C", "Food", "Fashion", "Beauty", "SaaS", "Fintech", "Edtech", "Health", "Agencies",
  "Creators", "Gaming", "Jobs", "Home", "Local", "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
] as const;

export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const inr = (rupees: number, decimals = false) =>
  "₹" + new Intl.NumberFormat("en-IN", decimals
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 }).format(rupees);

export const count = (n: number) => new Intl.NumberFormat("en-IN").format(n);

/** Split a GST-inclusive amount (paise) into taxable value and tax, in rupees with paise precision. */
export function gstSplit(totalPaise: number, intraState: boolean) {
  const taxable = Math.round(totalPaise / (1 + GST_RATE));
  const tax = totalPaise - taxable;
  const half = Math.round(tax / 2);
  return {
    taxable: taxable / 100,
    cgst: intraState ? half / 100 : 0,
    sgst: intraState ? (tax - half) / 100 : 0,
    igst: intraState ? 0 : tax / 100,
    total: totalPaise / 100,
  };
}

/** "https://www.MasalaLab.co/shop/" → "masalalab.co/shop" ; returns "" if it doesn't look like a link. */
export function normDomain(input: string): string {
  const u = input.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/.test(u) ? u : "";
}

export function toUrl(input: string): string {
  const t = input.trim();
  return /^https?:\/\//i.test(t) ? t : "https://" + t;
}

export function ago(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}
