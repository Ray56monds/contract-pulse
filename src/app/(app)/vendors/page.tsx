import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Building2 } from "lucide-react";

async function getVendors(orgId: string) {
  return prisma.vendor.findMany({
    where: { orgId },
    include: { _count: { select: { contracts: true } } },
    orderBy: { totalSpend: "desc" },
  });
}

export default async function VendorsPage() {
  const orgId = await getOrgId();
  const vendors = await getVendors(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendors</h1>
        <p className="text-muted-foreground">Vendor spend breakdown</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-muted p-3">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{vendor.name}</h3>
                <p className="text-sm text-muted-foreground">{vendor.category ?? "Uncategorized"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    ${vendor.totalSpend.toNumber().toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {vendor._count.contracts} contract{vendor._count.contracts !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {vendors.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            No vendors yet. They'll appear here when you add contracts.
          </p>
        )}
      </div>
    </div>
  );
}
