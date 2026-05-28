import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendors = await prisma.vendor.findMany({
    where: { orgId: session.user.orgId },
    include: { _count: { select: { contracts: true } } },
    orderBy: { totalSpend: "desc" },
  });
  return NextResponse.json(vendors);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const vendor = await prisma.vendor.create({
    data: {
      orgId: session.user.orgId,
      name: body.name,
      category: body.category,
      contactEmail: body.contactEmail,
    },
  });

  return NextResponse.json(vendor, { status: 201 });
}
