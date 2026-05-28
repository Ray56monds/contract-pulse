import { prisma } from "@/lib/prisma";
import { getOrgId } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { SpendChart } from "@/components/spend-chart";
import { FileText, AlertTriangle, DollarSign, Building2 } from "lucide-react";

async function getStats(orgId: string) {
  const [contractCount, vendorCount, upcomingRenewals, totalSpend] =
    await Promise.all([
      prisma.contract.count({ where: { orgId } }),
      prisma.vendor.count({ where: { orgId } }),
      prisma.contract.count({
        where: {
          orgId,
          endDate: {
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          status: "active",
        },
      }),
      prisma.contract.aggregate({
        _sum: { annualValue: true },
        where: { orgId, status: "active" },
      }),
    ]);

  return {
    contractCount,
    vendorCount,
    upcomingRenewals,
    totalSpend: totalSpend._sum.annualValue?.toNumber() ?? 0,
  };
}

async function getUpcomingContracts(orgId: string) {
  return prisma.contract.findMany({
    where: {
      orgId,
      endDate: {
        lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        gte: new Date(),
      },
      status: "active",
    },
    include: { vendor: true },
    orderBy: { endDate: "asc" },
    take: 5,
  });
}

async function getVendorSpend(orgId: string) {
  const vendors = await prisma.vendor.findMany({
    where: { orgId },
    orderBy: { totalSpend: "desc" },
    take: 6,
  });
  return vendors.map((v) => ({ name: v.name, spend: v.totalSpend.toNumber() }));
}

export default async function DashboardPage() {
  const orgId = await getOrgId();
  const [stats, upcoming, vendorSpend] = await Promise.all([
    getStats(orgId),
    getUpcomingContracts(orgId),
    getVendorSpend(orgId),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Contract renewal overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Contracts"
          value={stats.contractCount}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
        />
        <MetricCard
          title="Vendors"
          value={stats.vendorCount}
          icon={<Building2 className="h-5 w-5 text-green-600" />}
        />
        <MetricCard
          title="Renewals (90 days)"
          value={stats.upcomingRenewals}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
        />
        <MetricCard
          title="Annual Spend"
          value={`$${stats.totalSpend.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-purple-600" />}
        />
      </div>

      {vendorSpend.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Spend by Vendor</h2>
          <Card className="p-6">
            <SpendChart data={vendorSpend} />
          </Card>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold">Upcoming Renewals</h2>
        <Card className="divide-y">
          {upcoming.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              No upcoming renewals in the next 90 days.
            </p>
          ) : (
            upcoming.map((contract) => {
              const daysLeft = Math.ceil(
                (new Date(contract.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium">{contract.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.vendor.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {daysLeft} days left
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${contract.annualValue.toNumber().toLocaleString()}/yr
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="flex items-center gap-4 p-6">
      <div className="rounded-full bg-muted p-3">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}
