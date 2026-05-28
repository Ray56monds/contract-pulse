import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contracts = await prisma.contract.findMany({
    where: { orgId: session.user.orgId },
    include: { vendor: true },
    orderBy: { endDate: "asc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const contract = await prisma.contract.create({
    data: {
      title: body.title,
      orgId: session.user.orgId,
      vendorId: body.vendorId,
      uploadedBy: session.user.id,
      annualValue: body.annualValue,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      autoRenew: body.autoRenew ?? false,
      noticePeriodDays: body.noticePeriodDays,
      fileUrl: body.fileUrl,
      riskLevel: calculateRisk(body),
    },
  });

  await prisma.vendor.update({
    where: { id: body.vendorId },
    data: { totalSpend: { increment: body.annualValue } },
  });

  return NextResponse.json(contract, { status: 201 });
}

function calculateRisk(body: { endDate: string; autoRenew: boolean; annualValue: number }): string {
  const daysUntilEnd = Math.ceil(
    (new Date(body.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilEnd <= 30 && body.autoRenew) return "high";
  if (daysUntilEnd <= 60) return "medium";
  return "low";
}
