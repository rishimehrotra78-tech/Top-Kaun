import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

// Outbound click: count it, then send the visitor on with a UTM tag.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.redirect(new URL("/", _req.url));
  const { data } = await db().rpc("bump_click", { p_id: id });
  if (!data) return NextResponse.redirect(new URL("/", _req.url));
  const target = new URL(String(data));
  target.searchParams.set("utm_source", "eknumber");
  return NextResponse.redirect(target, 302);
}
