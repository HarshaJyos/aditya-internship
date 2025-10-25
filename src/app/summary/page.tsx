import Summary from "@/components/Summary";
import { Suspense } from "react";

export default function SummaryPage() {
  return (
    <Suspense fallback={<>...</>}>
      <Summary />
    </Suspense>
  );
}
