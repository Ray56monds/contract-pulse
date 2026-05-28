import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create organization
  const org = await prisma.organization.create({
    data: { name: "Acme Corp", plan: "pro" },
  });

  // Create user
  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      email: "admin@acme.com",
      name: "Admin User",
      role: "admin",
      alertPreferences: { email: true, slack: false, days: [30, 60, 90] },
    },
  });

  // Create vendors
  const vendors = await Promise.all([
    prisma.vendor.create({
      data: { orgId: org.id, name: "AWS", category: "Cloud Infrastructure", totalSpend: 48000 },
    }),
    prisma.vendor.create({
      data: { orgId: org.id, name: "Salesforce", category: "CRM", totalSpend: 36000 },
    }),
    prisma.vendor.create({
      data: { orgId: org.id, name: "Slack", category: "Communication", totalSpend: 12000 },
    }),
    prisma.vendor.create({
      data: { orgId: org.id, name: "Datadog", category: "Monitoring", totalSpend: 24000 },
    }),
  ]);

  // Create contracts
  const now = new Date();
  await Promise.all([
    prisma.contract.create({
      data: {
        orgId: org.id,
        vendorId: vendors[0].id,
        uploadedBy: user.id,
        title: "AWS Enterprise Support",
        annualValue: 48000,
        startDate: new Date(now.getFullYear() - 1, 0, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        autoRenew: true,
        noticePeriodDays: 30,
        riskLevel: "high",
      },
    }),
    prisma.contract.create({
      data: {
        orgId: org.id,
        vendorId: vendors[1].id,
        uploadedBy: user.id,
        title: "Salesforce Enterprise License",
        annualValue: 36000,
        startDate: new Date(now.getFullYear() - 1, 3, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
        autoRenew: true,
        noticePeriodDays: 60,
        riskLevel: "medium",
      },
    }),
    prisma.contract.create({
      data: {
        orgId: org.id,
        vendorId: vendors[2].id,
        uploadedBy: user.id,
        title: "Slack Business+ Plan",
        annualValue: 12000,
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear() + 1, 0, 1),
        autoRenew: false,
        noticePeriodDays: 30,
        riskLevel: "low",
      },
    }),
    prisma.contract.create({
      data: {
        orgId: org.id,
        vendorId: vendors[3].id,
        uploadedBy: user.id,
        title: "Datadog Pro Monitoring",
        annualValue: 24000,
        startDate: new Date(now.getFullYear() - 1, 6, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25),
        autoRenew: true,
        noticePeriodDays: 14,
        riskLevel: "high",
      },
    }),
  ]);

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
