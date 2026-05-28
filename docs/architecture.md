# ContractPulse — Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        U[User Browser]
    end

    subgraph "Vercel Platform"
        FE[Next.js 14 App Router<br/>Tailwind + shadcn/ui]
        API[API Routes<br/>Server Actions]
        CRON[Vercel Cron Jobs<br/>Daily Renewal Check]
        BLOB[Vercel Blob<br/>Contract PDF Storage]
    end

    subgraph "AWS Cloud"
        subgraph "VPC"
            RDS[(Aurora PostgreSQL<br/>Primary Instance)]
            RDS_R[(Aurora PostgreSQL<br/>Read Replica)]
        end
        TEXTRACT[Amazon Textract<br/>PDF/Document Parsing]
        SES[Amazon SES<br/>Email Alerts]
    end

    subgraph "External Services"
        AUTH[NextAuth.js<br/>Google/Email Provider]
        SLACK[Slack Webhooks<br/>Notifications]
    end

    U -->|HTTPS| FE
    FE --> API
    API -->|Prisma ORM| RDS
    API -->|Read Queries| RDS_R
    API -->|Upload| BLOB
    API -->|Parse Contract| TEXTRACT
    CRON -->|Check Renewals| RDS
    CRON -->|Send Alerts| SES
    CRON -->|Notify| SLACK
    AUTH --> API
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Next.js Frontend
    participant API as API Routes
    participant DB as Aurora PostgreSQL
    participant S3 as Vercel Blob
    participant AI as Amazon Textract

    U->>FE: Upload Contract PDF
    FE->>API: POST /api/upload
    API->>S3: Store PDF
    S3-->>API: File URL
    API->>AI: Extract Text & Terms
    AI-->>API: Extracted Data (dates, values, clauses)
    API->>DB: INSERT contract + terms
    DB-->>API: Contract ID
    API-->>FE: Success + Contract Preview
    FE-->>U: Show Extracted Terms for Review
```

## Alert Flow

```mermaid
sequenceDiagram
    participant CRON as Vercel Cron (Daily)
    participant DB as Aurora PostgreSQL
    participant SES as Amazon SES
    participant SLACK as Slack

    CRON->>DB: Query contracts expiring in 30/60/90 days
    DB-->>CRON: Contracts needing alerts
    CRON->>DB: Check user alert preferences
    DB-->>CRON: Preferences (email/slack/both)
    CRON->>SES: Send email alerts
    CRON->>SLACK: Send Slack notifications
    CRON->>DB: Log alert as sent
```

## Database Schema (ER Diagram)

```mermaid
erDiagram
    organizations ||--o{ users : has
    organizations ||--o{ vendors : has
    organizations ||--o{ contracts : has
    vendors ||--o{ contracts : has
    contracts ||--o{ contract_terms : has
    contracts ||--o{ alerts : has
    contracts ||--o{ notes : has
    users ||--o{ notes : writes
    users ||--o{ alerts : receives

    organizations {
        uuid id PK
        string name
        string plan
        timestamp created_at
    }

    users {
        uuid id PK
        uuid org_id FK
        string email
        string name
        string role
        jsonb alert_preferences
        timestamp created_at
    }

    vendors {
        uuid id PK
        uuid org_id FK
        string name
        string category
        string contact_email
        decimal total_spend
        timestamp created_at
    }

    contracts {
        uuid id PK
        uuid org_id FK
        uuid vendor_id FK
        uuid uploaded_by FK
        string title
        string status
        decimal annual_value
        date start_date
        date end_date
        boolean auto_renew
        integer notice_period_days
        string file_url
        string risk_level
        timestamp created_at
    }

    contract_terms {
        uuid id PK
        uuid contract_id FK
        string term_type
        string term_value
        text raw_text
        float confidence
    }

    alerts {
        uuid id PK
        uuid contract_id FK
        uuid user_id FK
        string alert_type
        integer days_before
        timestamp scheduled_for
        timestamp sent_at
        string status
    }

    notes {
        uuid id PK
        uuid contract_id FK
        uuid user_id FK
        text content
        timestamp created_at
    }
```

## Infrastructure Notes

- **Database:** Aurora PostgreSQL (Serverless v2 recommended for cost efficiency during hackathon)
- **Deployment:** Vercel (auto-deploy from GitHub main branch)
- **File Storage:** Vercel Blob (for contract PDFs)
- **AI Parsing:** Amazon Textract (AnalyzeDocument API)
- **Email:** Amazon SES (or Resend as simpler alternative)
- **Auth:** NextAuth.js with Google + Email magic link providers
- **ORM:** Prisma (type-safe, great DX, easy migrations)

## Scaling Considerations

- Aurora read replicas for dashboard analytics queries
- Prisma connection pooling via Vercel's edge config
- Vercel ISR for dashboard pages (revalidate every 60s)
- DynamoDB could be added later for high-frequency alert logs

## Why Aurora PostgreSQL?

1. **Serverless v2** — scales to zero during inactivity, cost-efficient for a SaaS product starting out
2. **PostgreSQL compatibility** — rich JSON support for alert preferences, full-text search for contract terms
3. **Production-grade** — same engine used by enterprises, automatic failover, point-in-time recovery
4. **Prisma integration** — first-class support with type-safe queries and migrations
5. **Read replicas** — can offload analytics queries as the product scales
