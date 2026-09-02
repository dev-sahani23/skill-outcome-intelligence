# Skill Outcome Intelligence

## Prerequisites
Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (to run the PostgreSQL database)

---

## Installation & Setup Guide

This project is separated into a frontend and a backend, and uses a Dockerized PostgreSQL database for local development. Follow these steps to get everything running locally.

### 1. Start the Database
From the root of the project, start the PostgreSQL database container in the background:
```bash
docker-compose up -d
```
*(The database will run on `localhost:5432` with the credentials specified in `docker-compose.yml`)*

### 2. Set up the Backend
Open a new terminal window, navigate to the `backend` folder, and install its dependencies:
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add the following configuration:
```env
PORT=5000
DATABASE_URL="postgresql://admin:password123@localhost:5432/skilltrack?schema=public"
JWT_SECRET="super-secret-jwt-key-replace-in-production"
```

Initialize the database schema using Prisma and start the development server:
```bash
npx prisma generate
npx prisma db push
# If you have a seed script to populate initial data, run: npx prisma db seed
npm run dev
```
*(The backend API should now be running on `http://localhost:5000`)*

### 3. Set up the Frontend
Open another new terminal window (leave the database and backend running), navigate to the `frontend` folder, and install its dependencies:
```bash
cd frontend
npm install
npm run dev
```

*(The frontend will start using Vite and you can access the app at `http://localhost:5173`)*

---

## Database Schema

Below is the Entity-Relationship diagram representing the core data models used in this project:

```mermaid
erDiagram
    USER ||--o| TRAINEE_PROFILE : "has"
    USER ||--o| PROVIDER_PROFILE : "has"
    USER ||--o| ADMIN_PROFILE : "has"
    
    PROVIDER_PROFILE ||--o{ TRAINING_PROGRAM : "offers"
    
    TRAINEE_PROFILE ||--o{ ENROLLMENT : "enrolls in"
    TRAINING_PROGRAM ||--o{ ENROLLMENT : "has"
    
    TRAINEE_PROFILE ||--o{ EMPLOYMENT_OUTCOME : "achieves"
    TRAINEE_PROFILE ||--o{ FOLLOW_UP : "receives"

    USER {
        String id PK
        String email UK
        String passwordHash
        Enum role
        DateTime createdAt
        DateTime updatedAt
    }
    
    TRAINEE_PROFILE {
        String id PK
        String userId FK
        String fullName
        String phone
        String qualification
        String district
        Boolean consentGiven
    }
    
    PROVIDER_PROFILE {
        String id PK
        String userId FK
        String instituteName
        String contactPerson
        String phone
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
    }
    
    ENROLLMENT {
        String id PK
        String traineeId FK
        String programId FK
        Enum status
        DateTime enrolledAt
        DateTime completedAt
    }
    
    EMPLOYMENT_OUTCOME {
        String id PK
        String traineeId FK
        Enum type
        String employerName
        String designation
        Float monthlyWage
        Int retentionMonths
        String skillGapIdentified
        String nonPlacementReason
        Boolean isVerified
        DateTime reportedAt
    }
    
    FOLLOW_UP {
        String id PK
        String traineeId FK
        String notes
        String conductedBy
        DateTime createdAt
    }
```
