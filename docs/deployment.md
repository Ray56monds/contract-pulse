# Deployment Guide

## 1. Provision Aurora PostgreSQL

### Option A: AWS Console (Easiest)

1. Go to **RDS → Create database**
2. Choose **Amazon Aurora** → **PostgreSQL-Compatible**
3. Select **Serverless v2** (cost-efficient for hackathon)
4. Settings:
   - Cluster identifier: `contractpulse-db`
   - Master username: `cpulse_admin`
   - Master password: (generate a secure one)
   - Database name: `contractpulse`
5. Connectivity:
   - **Public access: Yes** (required for Vercel to connect)
   - Create a new VPC security group
6. After creation, edit the security group to allow inbound TCP on port **5432** from `0.0.0.0/0`

### Option B: AWS CLI

Run `scripts/setup-aurora.sh` after filling in your variables.

### Get your DATABASE_URL

```
postgresql://cpulse_admin:<password>@<cluster-endpoint>:5432/contractpulse?sslmode=require
```

Find the endpoint in RDS → Your cluster → Connectivity & security.

---

## 2. Deploy to Vercel

### Connect GitHub Repo

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `Ray56monds/contract-pulse`
3. Framework: **Next.js** (auto-detected)
4. Set environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Aurora PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` to generate |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://contract-pulse.vercel.app`) |
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `BLOB_READ_WRITE_TOKEN` | Create in Vercel → Storage → Blob |

5. Click **Deploy**

### Post-Deploy

After first deploy, run migrations against your Aurora database:

```bash
# Set DATABASE_URL locally to your Aurora endpoint
export DATABASE_URL="postgresql://cpulse_admin:pass@your-cluster.us-east-1.rds.amazonaws.com:5432/contractpulse?sslmode=require"

# Push schema
npx prisma db push

# Seed data
npm run db:seed
```

---

## 3. Vercel Blob Storage

1. In Vercel dashboard → your project → **Storage**
2. Click **Create** → **Blob**
3. Copy the `BLOB_READ_WRITE_TOKEN` to your environment variables
4. Redeploy

---

## 4. AWS Textract IAM Policy

Create an IAM user with this policy for the `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "textract:AnalyzeDocument",
        "textract:DetectDocumentText"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## 5. Verify Deployment

- [ ] Landing page loads at root URL
- [ ] Login works with seeded email (`admin@acme.com`)
- [ ] Dashboard shows stats and chart
- [ ] Contracts list loads
- [ ] File upload triggers Textract parsing
- [ ] Cron job visible in Vercel → Cron Jobs tab

---

## 6. Screenshots Needed for Submission

1. **Vercel Storage Configuration** — showing Blob store connected
2. **Vercel project settings** — showing environment variables (redacted)
3. **RDS Console** — showing Aurora cluster running
4. **App screenshots** — Dashboard, Contracts, Contract Detail with extracted terms
