import { getBoard, getStats } from "@/lib/supabase";
import Home from "@/components/Home";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: v } = await searchParams;
  const view = v === "today" ? "today" : "all";
  const [board, allTime, stats] = await Promise.all([
    getBoard(view),
    view === "all" ? Promise.resolve(null) : getBoard("all"),
    getStats(),
  ]);
  return <Home view={view} board={board} allTime={allTime ?? board} stats={stats} />;
}
