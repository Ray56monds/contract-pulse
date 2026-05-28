import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, FileText, AlertTriangle, BarChart3, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ContractPulse</span>
        </div>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-8 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Never miss a contract renewal
            <span className="text-primary"> again.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            AI-powered contract intelligence for modern teams. Upload contracts, extract key terms automatically, and get smart alerts before renewals sneak up on you.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">See Features</Button>
            </Link>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/30 px-8 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">Everything you need to manage renewals</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={<FileText className="h-6 w-6 text-primary" />}
                title="AI Contract Parsing"
                description="Upload PDFs and let Amazon Textract extract dates, terms, and clauses automatically."
              />
              <Feature
                icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
                title="Smart Alerts"
                description="Get notified 30, 60, and 90 days before renewals via email or Slack."
              />
              <Feature
                icon={<BarChart3 className="h-6 w-6 text-green-600" />}
                title="Spend Analytics"
                description="Visualize vendor spend and identify cost-saving opportunities."
              />
              <Feature
                icon={<Shield className="h-6 w-6 text-purple-600" />}
                title="Risk Scoring"
                description="Automatic risk assessment based on contract value, auto-renewal, and timeline."
              />
            </div>
          </div>
        </section>

        <section className="px-8 py-20 text-center">
          <h2 className="text-3xl font-bold">Built on production infrastructure</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Powered by Aurora PostgreSQL, deployed on Vercel, with AI from Amazon Textract. Enterprise-grade from day one.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="rounded-full border px-4 py-2">Aurora PostgreSQL</span>
            <span className="rounded-full border px-4 py-2">Next.js 14</span>
            <span className="rounded-full border px-4 py-2">Amazon Textract</span>
            <span className="rounded-full border px-4 py-2">Vercel</span>
            <span className="rounded-full border px-4 py-2">Prisma ORM</span>
          </div>
        </section>
      </main>

      <footer className="border-t px-8 py-6 text-center text-sm text-muted-foreground">
        © 2025 ContractPulse. Built for the AWS + Vercel Hackathon.
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-left">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
