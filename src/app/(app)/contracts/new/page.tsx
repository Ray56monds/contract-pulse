"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Vendor {
  id: string;
  name: string;
}

export default function NewContractPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/vendors").then((r) => r.json()).then(setVendors);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        vendorId: form.get("vendorId"),
        annualValue: Number(form.get("annualValue")),
        startDate: form.get("startDate"),
        endDate: form.get("endDate"),
        autoRenew: form.get("autoRenew") === "on",
        noticePeriodDays: Number(form.get("noticePeriodDays")) || null,
      }),
    });

    if (res.ok) {
      const contract = await res.json();
      // Upload file if provided
      const file = form.get("file") as File;
      if (file?.size > 0) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("contractId", contract.id);
        await fetch("/api/upload", { method: "POST", body: uploadData });
      }
      router.push(`/contracts/${contract.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Contract</h1>
        <p className="text-muted-foreground">Create a new contract and optionally upload the PDF for AI parsing</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Contract Title" name="title" type="text" required />

            <div>
              <label htmlFor="vendorId" className="mb-1 block text-sm font-medium">Vendor</label>
              <select name="vendorId" id="vendorId" required className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <Field label="Annual Value ($)" name="annualValue" type="number" required />

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" name="startDate" type="date" required />
              <Field label="End Date" name="endDate" type="date" required />
            </div>

            <Field label="Notice Period (days)" name="noticePeriodDays" type="number" />

            <div className="flex items-center gap-2">
              <input type="checkbox" name="autoRenew" id="autoRenew" aria-label="Auto-renews" className="h-4 w-4" />
              <label htmlFor="autoRenew" className="text-sm font-medium">Auto-renews</label>
            </div>

            <div>
              <label htmlFor="file" className="mb-1 block text-sm font-medium">Contract PDF (optional)</label>
              <input type="file" name="file" id="file" accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm" />
              <p className="mt-1 text-xs text-muted-foreground">Upload to extract terms with AI</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Contract"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, name, type, required }: { label: string; name: string; type: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
