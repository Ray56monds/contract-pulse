import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

async function getContracts(orgId: string) {
  return prisma.contract.findMany({
    where: { orgId },
    include: { vendor: true },
    orderBy: { endDate: "asc" },
  });
}

function getRiskBadge(risk: string) {
  const colors: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-green-100 text-green-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[risk] ?? colors.low}`}>
      {risk}
    </span>
  );
}

export default async function ContractsPage() {
  const orgId = await getOrgId();
  const contracts = await getContracts(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Manage all your vendor contracts</p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Contract
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Contract</th>
                <th className="px-4 py-3 text-left font-medium">Vendor</th>
                <th className="px-4 py-3 text-left font-medium">Value</th>
                <th className="px-4 py-3 text-left font-medium">End Date</th>
                <th className="px-4 py-3 text-left font-medium">Auto-Renew</th>
                <th className="px-4 py-3 text-left font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/contracts/${c.id}`} className="flex items-center gap-2 font-medium text-primary hover:underline">
                      <FileText className="h-4 w-4" />
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.vendor.name}</td>
                  <td className="px-4 py-3">${c.annualValue.toNumber().toLocaleString()}/yr</td>
                  <td className="px-4 py-3">{new Date(c.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{c.autoRenew ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{getRiskBadge(c.riskLevel)}</td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No contracts yet. Add your first contract to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
