# ContractPulse

> AI-powered contract renewal intelligence for modern teams. Never miss a renewal again.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Database:** Aurora PostgreSQL (AWS)
- **File Storage:** Vercel Blob
- **AI Parsing:** Amazon Textract
- **Deployment:** Vercel
- **ORM:** Prisma

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local for dev, Aurora for production)
- AWS account (for Textract)
- Vercel account

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and AWS credentials

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL` — your Aurora PostgreSQL connection string
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `NEXTAUTH_SECRET`

## Architecture

See [docs/architecture.md](./docs/architecture.md) for full architecture diagrams.

## Hackathon Track

**Track 2: Monetizable B2B App** — Contract renewal intelligence SaaS for teams managing multiple vendor relationships.
