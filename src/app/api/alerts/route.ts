import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This runs as a Vercel Cron Job (configured in vercel.json)
export async function GET() {
  const now = new Date();
  const alertWindows = [30, 60, 90];

  for (const days of alertWindows) {
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const windowStart = new Date(targetDate);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(targetDate);
    windowEnd.setHours(23, 59, 59, 999);

    const contracts = await prisma.contract.findMany({
      where: {
        status: "active",
        endDate: { gte: windowStart, lte: windowEnd },
      },
      include: { vendor: true, organization: { include: { users: true } } },
    });

    for (const contract of contracts) {
      for (const user of contract.organization.users) {
        // Check if alert already sent
        const existing = await prisma.alert.findFirst({
          where: {
            contractId: contract.id,
            userId: user.id,
            daysBefore: days,
            status: "sent",
          },
        });

        if (existing) continue;

        // Create and "send" alert
        await prisma.alert.create({
          data: {
            contractId: contract.id,
            userId: user.id,
            alertType: "renewal_reminder",
            daysBefore: days,
            scheduledFor: now,
            sentAt: now,
            status: "sent",
          },
        });

        // TODO: Send actual email via SES or Resend
        console.log(
          `Alert: ${contract.title} expires in ${days} days. Notifying ${user.email}`
        );
      }
    }
  }

  return NextResponse.json({ success: true, timestamp: now.toISOString() });
}
