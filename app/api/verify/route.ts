import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/supabase";
import { verifyCheckoutSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

const Body = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// Called by the browser right after Razorpay Checkout succeeds, so the user sees
// their rank instantly. The webhook does the same work as a backup; apply_payment is idempotent.
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });

  const { data, error } = await db().rpc("apply_payment", {
    p_order_id: razorpay_order_id,
    p_payment_id: razorpay_payment_id,
  });
  if (error || !data?.[0]) return NextResponse.json({ error: "Payment received; your listing will appear shortly." }, { status: 202 });

  revalidatePath("/");
  const row = data[0] as { listing_id: string; rank: number; total_paise: number; payment_id: string };
  return NextResponse.json({
    listingId: row.listing_id,
    rank: Number(row.rank),
    totalRupees: Number(row.total_paise) / 100,
    invoiceUrl: `/invoice/${row.payment_id}`,
  });
}
