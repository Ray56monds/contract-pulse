import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Calendar, DollarSign, AlertTriangle } from "lucide-react";

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: { vendor: true, terms: true, notes: { include: { user: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!contract) notFound();

  const daysUntilEnd = Math.ceil(
    (new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{contract.title}</h1>
        <p className="text-muted-foreground">{contract.vendor.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" /> Annual Value
          </div>
          <p className="mt-1 text-xl font-bold">
            ${contract.annualValue.toNumber().toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" /> End Date
          </div>
          <p className="mt-1 text-xl font-bold">
            {new Date(contract.endDate).toLocaleDateString()}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" /> Days Remaining
          </div>
          <p className="mt-1 text-xl font-bold">{daysUntilEnd}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" /> Auto-Renew
          </div>
          <p className="mt-1 text-xl font-bold">
            {contract.autoRenew ? "Yes" : "No"}
          </p>
        </Card>
      </div>

      {contract.terms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Extracted Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contract.terms.map((term) => (
                <div key={term.id} className="flex items-start justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium capitalize">{term.termType.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">{term.termValue}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(term.confidence * 100)}% confidence
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes & History</CardTitle>
        </CardHeader>
        <CardContent>
          {contract.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {contract.notes.map((note) => (
                <div key={note.id} className="border-l-2 border-primary/30 pl-4">
                  <p className="text-sm">{note.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {note.user.name ?? note.user.email} · {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
