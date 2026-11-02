import { NextResponse } from "next/server";
import { z } from "zod";
import { CATEGORIES, GSTIN_RE, MAX_RUPEES, MIN_RUPEES, STATES, normDomain, toUrl } from "@/lib/config";
import { db } from "@/lib/supabase";
import { createOrder, publicKeyId } from "@/lib/razorpay";

export const runtime = "nodejs";

const Body = z.object({
  name: z.string().trim().min(1, "Add your brand name.").max(40),
  url: z.string().trim().min(4, "Add a website or Instagram link."),
  tagline: z.string().trim().min(1, "Add one line about your brand.").max(80),
  deal: z.string().trim().min(1, "Every listing needs a deal for visitors.").max(28),
  code: z.string().trim().min(2, "Add the coupon code visitors should use.").max(16)
    .transform((s) => s.toUpperCase()).refine((s) => /^[A-Z0-9_-]+$/.test(s), "Coupon codes can use letters, numbers, - and _ only."),
  category: z.enum(CATEGORIES),
  billName: z.string().trim().min(1, "Add the name for the invoice.").max(80),
  billState: z.enum(STATES, { errorMap: () => ({ message: "Choose your state for the invoice." }) }),
  billGstin: z.string().trim().toUpperCase().optional().default("")
    .refine((s) => s === "" || GSTIN_RE.test(s), "That GSTIN doesn't look right. Leave it empty if you don't have one."),
  email: z.string().trim().email("Add an email for your invoice."),
  amount: z.number().int().min(MIN_RUPEES, `The minimum is ₹${MIN_RUPEES}.`).max(MAX_RUPEES),
});

// Listings we never accept (extend as needed). Matches the rules on the site.
const BLOCKED = [/bet|casino|satta|rummy|teen-?patti/i, /loan-?app|instant-?loan/i];

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const domain = normDomain(body.url);
  if (!domain) return NextResponse.json({ error: "Add a valid website or Instagram link." }, { status: 400 });
  if (BLOCKED.some((r) => r.test(domain) || r.test(body.name)))
    return NextResponse.json({ error: "We can't accept this kind of listing. See How ranking works." }, { status: 400 });

  const amountPaise = body.amount * 100;
  const s = db();

  // Adding to an existing listing keeps its name, line and deal, so nobody can change someone else's listing.
  const { data: existing } = await s.from("listings")
    .select("name,tagline,category,city,url,deal,code").eq("domain", domain).maybeSingle();

  const order = await createOrder(amountPaise, `tk_${Date.now()}`, { domain, name: body.name });

  const { error } = await s.from("payments").insert({
    razorpay_order_id: order.id,
    amount_paise: amountPaise,
    domain,
    url: existing?.url ?? toUrl(body.url),
    name: existing?.name ?? body.name,
    tagline: existing?.tagline ?? body.tagline,
    category: existing?.category ?? body.category,
    city: existing?.city ?? body.billState,
    deal: existing?.deal ?? body.deal,
    code: existing?.code ?? body.code,
    bill_name: body.billName,
    bill_state: body.billState,
    bill_gstin: body.billGstin || null,
    email: body.email,
  });
  if (error) return NextResponse.json({ error: "Could not start payment. Try again." }, { status: 500 });

  return NextResponse.json({
    orderId: order.id,
    amountPaise,
    keyId: publicKeyId(),
    listingName: existing?.name ?? body.name,
    topUp: Boolean(existing),
  });
}
