import { redirect } from "next/navigation";

// Some payment reviewers look for this exact path.
export default function CancellationRefund() {
  redirect("/refunds");
}
