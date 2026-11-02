import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-side client with the secret (service-role) key. Never import this from a client component.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  return createClient(url, key, { auth: { persistSession: false } });
}

export type Listing = {
  id: string;
  name: string;
  domain: string;
  tagline: string;
  category: string;
  city: string;
  clicks: number;
  created_at: string;
  deal: string;
  code: string;
  amount_paise: number; // all-time total or today's total, depending on the board
};

export async function getBoard(view: "all" | "today"): Promise<Listing[]> {
  const s = db();
  const cols = "id,name,domain,tagline,category,city,clicks,created_at,deal,code";
  if (view === "today") {
    const { data, error } = await s.from("today_board")
      .select(cols + ",today_paise")
      .order("today_paise", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw error;
    return ((data ?? []) as unknown as (Omit<Listing, "amount_paise"> & { today_paise: number })[])
      .map((r) => ({ ...r, amount_paise: Number(r.today_paise) }));
  }
  const { data, error } = await s.from("listings")
    .select(cols + ",total_paise")
    .eq("hidden", false)
    .order("total_paise", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return ((data ?? []) as unknown as (Omit<Listing, "amount_paise"> & { total_paise: number })[])
    .map((r) => ({ ...r, amount_paise: Number(r.total_paise) }));
}

export async function getStats() {
  const s = db();
  const [{ data: rows, error }, { data: fund }] = await Promise.all([
    s.from("listings").select("total_paise,clicks").eq("hidden", false),
    s.from("site_stats").select("value").eq("key", "ad_fund_spent_paise").maybeSingle(),
  ]);
  if (error) throw error;
  const list = rows ?? [];
  return {
    totalRupees: list.reduce((a, r) => a + Number(r.total_paise), 0) / 100,
    brands: list.length,
    clicks: list.reduce((a, r) => a + Number(r.clicks), 0),
    adFundSpentRupees: Number(fund?.value ?? 0) / 100,
  };
}

export type Invoice = {
  id: string;
  invoice_no: string;
  invoice_date: string;
  amount_paise: number;
  name: string;
  domain: string;
  bill_name: string | null;
  bill_state: string | null;
  bill_gstin: string | null;
  email: string | null;
  razorpay_payment_id: string | null;
};

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db().from("payments")
    .select("id,invoice_no,invoice_date,amount_paise,name,domain,bill_name,bill_state,bill_gstin,email,razorpay_payment_id")
    .eq("id", id).eq("status", "paid").maybeSingle();
  return (data as Invoice) ?? null;
}
