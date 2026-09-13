# Skill Outcome Intelligence

A unified platform for tracking the complete skilling journey — from training and certification to employment, income, and long-term career outcomes. Built for government skill development programmes (MSDE / Skill India) to measure real impact.

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### Database & DevOps
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

---

## Features

| Role | Capabilities |
|---|---|
| **Trainee** | Register, submit training records, report employment outcomes (Employed / Self-Employed / Apprenticeship / Unemployed), KYC via Aadhaar hash, UAN storage |
| **Training Provider** | Create and manage training programs, view enrolled trainees and completion rates |
| **Government Admin** | View district-wise placement analytics, real-time stats (total enrolled, placement rate, avg wage) |

---

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (to run the PostgreSQL database)

---

## Installation & Setup Guide

### Step 1 — Start the Database

From the **root** of the project, start the PostgreSQL container:
```bash
docker-compose up -d
```
> PostgreSQL will be available at `localhost:5432`
> Credentials: `admin` / `password123` / DB: `skilltrack`

---

### Step 2 — Set up the Backend

Open a terminal, navigate to the `backend` folder:
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
DATABASE_URL="postgresql://admin:password123@localhost:5432/skilltrack?schema=public"
JWT_SECRET="super-secret-jwt-key-replace-in-production"
GOVT_ID_HASH_PEPPER="your-random-secret-pepper-string"
```

> ⚠️ `GOVT_ID_HASH_PEPPER` is required for Aadhaar hashing. Set it to any long random string.

Initialize the database and seed demo data:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

Start the backend dev server:
```bash
npm run dev
```
> API runs at `http://localhost:5000`

---

### Step 3 — Set up the Frontend

Open a **new** terminal, navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at `http://localhost:5173`

---

## Demo Accounts

The seed script creates the following test accounts (all with password `password123`):

| Role | Email | Dashboard |
|---|---|---|
| Government Admin | `admin@maharashtra.gov.in` | `/dashboard/admin` |
| Training Provider | `provider@example.com` | `/dashboard/provider` |
| Trainee | `trainee@example.com` | `/dashboard/trainee` |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Register trainee or provider |
| `POST` | `/login` | Login with email + password |
| `POST` | `/logout` | Clear session |
| `GET` | `/me` | Get authenticated user profile |

### Courses — `/api/courses`
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/` | Any auth | List all training programs |
| `GET` | `/my-courses` | Provider | List provider's own courses |
| `POST` | `/` | Provider | Create a new course |

### Enrollments — `/api/enrollments`
| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/record-details` | Trainee | Submit training record |
| `GET` | `/my-enrollments` | Trainee | Get own enrollments |
| `GET` | `/provider-enrollments` | Provider | Get enrollments in own courses |

### Outcomes — `/api/outcomes`
| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/` | Trainee | Report employment outcome |
| `GET` | `/my-outcomes` | Trainee | Get own outcome history |

### Trainees — `/api/trainees`
| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/kyc` | Trainee | Submit KYC (Aadhaar hashed server-side) |
| `POST` | `/contacts` | Trainee | Add reachability contact |
| `GET` | `/contacts` | Trainee | List contacts |
| `PATCH` | `/contacts/:id` | Trainee | Update contact |
| `POST` | `/location` | Trainee | Update location |

### Admin — `/api/admin`
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/stats` | Gov Admin | Aggregate stats (total enrolled, placement rate, avg wage, district-wise placements) |
| `POST` | `/skill-gap` | Gov Admin | Create a skill gap report |

---

## Database Schema

```mermaid
erDiagram
    USER ||--o| TRAINEE_PROFILE : "has"
    USER ||--o| PROVIDER_PROFILE : "has"
    USER ||--o| ADMIN_PROFILE : "has"
    USER ||--o{ VALIDATION : "validates (as reviewer)"
    USER ||--o{ PROVIDER_ANOMALY_FLAG : "reviews"
    USER ||--o{ AUDIT_LOG : "creates"

    DISTRICT ||--o{ TRAINEE_PROFILE : "contains"
    DISTRICT ||--o{ PROVIDER_PROFILE : "contains"
    DISTRICT ||--o{ EMPLOYER : "contains"
    DISTRICT ||--o{ EMPLOYMENT_OUTCOME : "located in"
    DISTRICT ||--o{ SKILL_GAP_REPORT : "has"

    PROVIDER_PROFILE ||--o{ TRAINING_PROGRAM : "offers"
    PROVIDER_PROFILE ||--o{ PROVIDER_ANOMALY_FLAG : "flagged in"

    TRAINING_PROGRAM ||--o{ ENROLLMENT : "has"
    TRAINING_PROGRAM ||--o{ COURSE_RATING : "rated by"

    TRAINEE_PROFILE ||--o{ ENROLLMENT : "enrolls in"
    TRAINEE_PROFILE ||--o{ EMPLOYMENT_OUTCOME : "achieves"
    TRAINEE_PROFILE ||--o{ FOLLOW_UP : "receives"
    TRAINEE_PROFILE ||--o{ CONTACT : "has"
    TRAINEE_PROFILE ||--o{ CONSENT_RECORD : "gives"
    TRAINEE_PROFILE ||--o{ ATTRITION_RECORD : "has"

    EMPLOYER ||--o{ EMPLOYMENT_OUTCOME : "employs via"

    EMPLOYMENT_OUTCOME ||--o{ WAGE_RECORD : "has"
    EMPLOYMENT_OUTCOME ||--o{ VALIDATION : "verified by"
    EMPLOYMENT_OUTCOME ||--o{ ATTRITION_RECORD : "leads to"

    FOLLOW_UP ||--o{ CASCADE_LOG : "triggers"
    CONTACT ||--o{ CASCADE_LOG : "contacted via"

    USER {
        String id PK
        String email UK
        String passwordHash
        Enum role "TRAINEE | PROVIDER | GOVERNMENT_ADMIN"
        Boolean isActive
        DateTime lastLoginAt
        DateTime createdAt
        DateTime updatedAt
    }

    DISTRICT {
        String id PK
        String name
        String state
        Float avgWageBaseline
        Float avgLayoffRateBaseline
    }

    TRAINEE_PROFILE {
        String id PK
        String userId FK
        String fullName
        String phone
        String qualification
        String district
        String districtId FK
        DateTime dob
        Enum gender "MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY"
        String aadhaarHash UK
        String aadhaarLast4
        String uanNumber UK
        Boolean consentGiven
    }

    PROVIDER_PROFILE {
        String id PK
        String userId FK
        String instituteName
        String contactPerson
        String phone
        String registrationNo UK
        Boolean isVerified
        String districtId FK
    }

    ADMIN_PROFILE {
        String id PK
        String userId FK
        String fullName
        String department
    }

    TRAINING_PROGRAM {
        String id PK
        String providerId FK
        String name
        String description
        Int durationMonths
        String certificationName
        String[] skills
        String sector
        String skillCategory
    }

    ENROLLMENT {
        String id PK
        String traineeId FK
        String programId FK
        Enum status "ENROLLED | IN_PROGRESS | COMPLETED | DROPPED"
        DateTime enrolledAt
        DateTime completedAt
        Float attendancePct
        String trainingNumber
        String batchNumber
        String enrollmentNumber
        String[] skillsAcquired
        Boolean isCertified
        String certificateId
    }

    EMPLOYER {
        String id PK
        String name
        String sector
        String registrationNo UK
        Boolean isVerified
        String contactPhone
        String districtId FK
    }

    EMPLOYMENT_OUTCOME {
        String id PK
        String traineeId FK
        Enum type "FORMAL_EMPLOYMENT | INFORMAL_EMPLOYMENT | APPRENTICESHIP | SELF_EMPLOYED | UNEMPLOYED"
        String employerName
        String employerId FK
        String designation
        Float monthlyWage
        Int retentionMonths
        DateTime joiningDate
        DateTime endDate
        String districtId FK
        Enum trainingRelevance "HIGH | MEDIUM | LOW"
        Enum status "ACTIVE | LEFT | TERMINATED | COMPLETED"
        String napsNumber
        String udyamRegistrationNo
        String businessActivity
        Enum sustainability "GROWING | STABLE | DECLINING | CLOSED"
        String skillGapIdentified
        String nonPlacementReason
        Boolean isVerified
        DateTime reportedAt
    }

    WAGE_RECORD {
        String id PK
        String outcomeId FK
        DateTime recordedDate
        Float salaryAmount
        String source
        DateTime createdAt
    }

    VALIDATION {
        String id PK
        String outcomeId FK
        String validationType
        Enum status "VERIFIED | PARTIALLY_VERIFIED | UNVERIFIED"
        Float confidenceScore
        String evidenceUrl
        String validatedById FK
        DateTime validatedAt
    }

    ATTRITION_RECORD {
        String id PK
        String outcomeId FK
        String traineeId FK
        DateTime exitDate
        Enum reasonCode "COMPANY_SHUTDOWN | MASS_LAYOFF | SKILL_MISMATCH | POOR_WORKING_CONDITIONS | LOW_SALARY | NO_CAREER_PROGRESSION | VOLUNTARY_BETTER_JOB | OTHER"
        Enum reasonSource "AI_CLASSIFIED | SELF_REPORTED | EMPLOYER_REPORTED"
        Float confidenceScore
        DateTime recordedAt
    }

    CONTACT {
        String id PK
        String traineeId FK
        Enum contactType "SELF | GUARDIAN | LOCAL_ANCHOR | EMPLOYER"
        String name
        String phone
        String relationship
        Int priorityOrder
        Boolean isActive
        DateTime lastVerifiedAt
        DateTime createdAt
    }

    CONSENT_RECORD {
        String id PK
        String traineeId FK
        String consentType
        String consentVersion
        DateTime grantedAt
        DateTime revokedAt
    }

    FOLLOW_UP {
        String id PK
        String traineeId FK
        Enum stage "AT_CERTIFICATION | DAY_30 | MONTH_3 | MONTH_6 | MONTH_12 | MONTH_24"
        DateTime scheduledDate
        Enum channelUsed "SMS | WHATSAPP | EMAIL | WEB | MOBILE_APP | ASSISTED_CALL"
        Enum status "PENDING | SENT | RESPONDED | ESCALATED | UNREACHABLE"
        Json responseData
        DateTime completedAt
        String notes
        String conductedBy
        DateTime createdAt
    }

    CASCADE_LOG {
        String id PK
        String followUpId FK
        String contactId FK
        Int attemptNumber
        Enum cascadeStage "PRIMARY_PENDING | GUARDIAN_PENDING | ANCHOR_PENDING | RESOLVED | UNREACHABLE"
        DateTime attemptedAt
        Boolean responseReceived
        DateTime responseAt
    }

    COURSE_RATING {
        String id PK
        String programId FK
        DateTime ratingPeriodStart
        DateTime ratingPeriodEnd
        Float weightedPlacementScore
        Float relativeLayoffScore
        Float relevanceScore
        Float wageProgressionScore
        Int sampleSize
        Float confidenceDiscount
        Float finalScore
        DateTime calculatedAt
    }

    PROVIDER_ANOMALY_FLAG {
        String id PK
        String providerId FK
        Enum flagType "PLACEMENT_VARIANCE | RESPONSE_RATE_OUTLIER | WAGE_CLUSTERING"
        Float zScore
        String detail
        Enum status "OPEN | UNDER_REVIEW | DISMISSED | CONFIRMED"
        DateTime flaggedAt
        String reviewedById FK
        DateTime reviewedAt
    }

    SKILL_GAP_REPORT {
        String id PK
        String districtId FK
        String sector
        String skillName
        Float demandScore
        Float supplyScore
        Float gapScore
        DateTime createdAt
    }
```

---

## Project Structure

```
skill-outcome-intelligence/
├── docker-compose.yml          # PostgreSQL container
├── README.md
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Full DB schema (all models + enums)
│   │   ├── seed.ts             # Demo data seeder
│   │   └── migrations/         # Prisma migration history
│   ├── prisma.config.ts        # Prisma 7 config (schema path, seed cmd)
│   ├── src/
│   │   ├── server.ts           # Express app entry point
│   │   ├── config/env.ts       # Zod-validated env vars
│   │   ├── lib/prisma.ts       # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts         # requireAuth + requireRole guards
│   │   │   ├── validate.ts     # Zod request validation
│   │   │   └── errorHandler.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── govtIdHash.ts   # HMAC-SHA256 Aadhaar hashing
│   │   ├── jobs/
│   │   │   └── reachability.job.ts  # Cascade escalation cron job
│   │   └── modules/
│   │       ├── auth/           # Login, register, JWT
│   │       ├── trainee/        # KYC, contacts, location
│   │       ├── course/         # Training program CRUD
│   │       ├── enrollment/     # Record details, list enrollments
│   │       ├── outcome/        # Employment outcome reporting
│   │       └── admin/          # Stats, skill gap reports
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── lib/
    │   │   ├── api.ts          # Fetch wrapper with auth token injection
    │   │   └── auth.ts         # Typed API helper functions
    │   ├── pages/
    │   │   ├── auth/           # Login, TraineeRegister, ProviderRegister, OrgRegister
    │   │   └── dashboard/      # TraineeDashboard, ProviderDashboard, OrgDashboard
    │   └── components/         # Shared UI components (Button, Input, Card, etc.)
    └── package.json
```

---

## Testing OTP Flow

To test the OTP (One-Time Password) flow for password resets (including enumeration checks and rate limits), ensure your backend server is running and then execute the test script:

```bash
cd backend
npm run test:otp
```

---

## Security Notes

- **Aadhaar** is **never stored in plaintext**. Only an HMAC-SHA256 hash (with server-side pepper) and the last 4 digits are persisted.
- **UAN** is stored on the trainee profile — it is a permanent, citizen-level identifier that persists across job changes.
- **JWT** tokens are issued on login. Access tokens are stored in `localStorage`; refresh tokens in `httpOnly` cookies.
- **Government Admin** accounts cannot be self-registered — they are provisioned internally by platform administrators.

---

## License

[MIT](./LICENSE)
