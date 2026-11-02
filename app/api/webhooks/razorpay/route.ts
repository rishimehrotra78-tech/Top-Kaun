import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

// Razorpay Dashboard → Settings → Webhooks → URL: https://<your-domain>/api/webhooks/razorpay
// Events: payment.captured, order.paid. Secret: RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!sig || !verifyWebhookSignature(raw, sig)) return new NextResponse("bad signature", { status: 400 });

  const evt = JSON.parse(raw);
  const s = db();

  if (evt.event === "payment.captured" || evt.event === "order.paid") {
    const pay = evt.payload?.payment?.entity;
    if (pay?.order_id && pay?.id) {
      const { error } = await s.rpc("apply_payment", { p_order_id: pay.order_id, p_payment_id: pay.id });
      // Unknown orders (e.g. from another app on the same Razorpay account) are ignored.
      if (error && !/unknown order/.test(error.message)) return new NextResponse("retry", { status: 500 });
      revalidatePath("/");
    }
  } else if (evt.event === "payment.failed") {
    const pay = evt.payload?.payment?.entity;
    if (pay?.order_id)
      await s.from("payments").update({ status: "failed" }).eq("razorpay_order_id", pay.order_id).eq("status", "created");
  }
  return NextResponse.json({ ok: true });
}
