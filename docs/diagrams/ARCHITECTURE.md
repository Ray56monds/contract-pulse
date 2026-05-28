# ContractPulse — Architecture

## System Overview

```mermaid
graph TB
    subgraph "Client"
        Browser["🌐 User Browser"]
    end

    subgraph "Vercel Platform"
        NextJS["Next.js 14<br/>App Router + RSC"]
        API["API Routes<br/>NextAuth + Prisma"]
        Cron["⏰ Vercel Cron<br/>Daily 8am UTC"]
        Blob["📦 Vercel Blob<br/>PDF Storage"]
        MW["🔒 Middleware<br/>Route Protection"]
    end

    subgraph "AWS Cloud"
        Aurora[("🗄️ Aurora PostgreSQL<br/>Serverless v2")]
        Textract["🤖 Amazon Textract<br/>Document AI"]
        SES["📧 Amazon SES<br/>Email Alerts"]
    end

    Browser -->|HTTPS| NextJS
    Browser -->|HTTPS| API
    NextJS --> MW
    API -->|Prisma ORM| Aurora
    API -->|Upload PDF| Blob
    API -->|Parse Document| Textract
    Textract -->|Extracted Terms| API
    Cron -->|Check Renewals| Aurora
    Cron -->|Send Alerts| SES
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant V as Vercel (Next.js)
    participant B as Vercel Blob
    participant T as Amazon Textract
    participant DB as Aurora PostgreSQL

    U->>V: Upload Contract PDF
    V->>B: Store file
    B-->>V: File URL
    V->>T: AnalyzeDocument (bytes)
    T-->>V: Extracted blocks (terms, dates, clauses)
    V->>DB: Save contract + extracted terms
    DB-->>V: Contract ID
    V-->>U: Show extracted terms for review

    Note over V,DB: Daily Cron Job
    V->>DB: Query contracts expiring in 30/60/90 days
    DB-->>V: Contracts needing alerts
    V->>DB: Log alert as sent
```

## Database Schema

```mermaid
erDiagram
    organizations ||--o{ users : has
    organizations ||--o{ vendors : has
    organizations ||--o{ contracts : has
    vendors ||--o{ contracts : has
    contracts ||--o{ contract_terms : "AI extracted"
    contracts ||--o{ alerts : triggers
    contracts ||--o{ notes : has
    users ||--o{ alerts : receives
    users ||--o{ notes : writes

    organizations {
        uuid id PK
        string name
        string plan
    }
    contracts {
        uuid id PK
        string title
        decimal annual_value
        date end_date
        boolean auto_renew
        string risk_level
    }
    contract_terms {
        uuid id PK
        string term_type
        string term_value
        float confidence
    }
    alerts {
        uuid id PK
        string alert_type
        int days_before
        string status
    }
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + Tailwind + shadcn/ui | Server-rendered React UI |
| Auth | NextAuth.js (JWT) | Session management |
| ORM | Prisma | Type-safe database access |
| Database | **Aurora PostgreSQL Serverless v2** | Primary data store |
| File Storage | Vercel Blob | Contract PDF storage |
| AI | Amazon Textract | Document parsing & term extraction |
| Alerts | Amazon SES + Vercel Cron | Automated renewal notifications |
| Deployment | Vercel | CI/CD, edge network, cron jobs |

## Why Aurora PostgreSQL?

- **Serverless v2** — scales to near-zero during inactivity, cost-efficient for SaaS
- **PostgreSQL** — rich JSON support for preferences, full-text search for terms
- **Production-grade** — automatic failover, encryption at rest, point-in-time recovery
- **Prisma-native** — first-class support with type-safe queries
- **Scalable** — read replicas ready when the product grows
