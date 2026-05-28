import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { prisma } from "@/lib/prisma";

const textract = new TextractClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const contractId = formData.get("contractId") as string;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(`contracts/${contractId}/${file.name}`, file, {
    access: "public",
  });

  // Parse with Textract
  const bytes = await file.arrayBuffer();
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: new Uint8Array(bytes) },
    FeatureTypes: ["FORMS", "TABLES"],
  });

  const textractResult = await textract.send(command);
  const extractedTerms = parseTextractResponse(textractResult);

  // Save file URL and extracted terms
  await prisma.contract.update({
    where: { id: contractId },
    data: { fileUrl: blob.url },
  });

  if (extractedTerms.length > 0) {
    await prisma.contractTerm.createMany({
      data: extractedTerms.map((term) => ({
        contractId,
        termType: term.type,
        termValue: term.value,
        rawText: term.rawText,
        confidence: term.confidence,
      })),
    });
  }

  return NextResponse.json({ url: blob.url, terms: extractedTerms });
}

function parseTextractResponse(result: any) {
  const terms: { type: string; value: string; rawText: string; confidence: number }[] = [];
  const blocks = result.Blocks ?? [];

  const keyTerms = [
    "termination",
    "renewal",
    "notice period",
    "payment terms",
    "liability",
    "indemnification",
    "confidentiality",
    "auto-renew",
    "cancellation",
  ];

  for (const block of blocks) {
    if (block.BlockType === "LINE" && block.Text) {
      const text = block.Text.toLowerCase();
      for (const term of keyTerms) {
        if (text.includes(term)) {
          terms.push({
            type: term.replace(/\s+/g, "_"),
            value: block.Text,
            rawText: block.Text,
            confidence: (block.Confidence ?? 0) / 100,
          });
        }
      }
    }
  }

  return terms;
}
