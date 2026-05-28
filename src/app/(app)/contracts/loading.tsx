import { Card } from "@/components/ui/card";

export default function ContractsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 rounded bg-muted" />
          <div className="mt-2 h-4 w-56 rounded bg-muted" />
        </div>
        <div className="h-10 w-36 rounded bg-muted" />
      </div>
      <Card className="h-80" />
    </div>
  );
}
