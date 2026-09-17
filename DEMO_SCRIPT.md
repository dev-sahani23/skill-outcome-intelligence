# Demo Flow (5 minutes)

## Credentials for Demo
Use password `Demo@1234` for all accounts below:
- **Admin:** admin@skillportal.gov.in
- **Provider A (Good):** providerA@skillcorp.in
- **Provider B (Bad):** providerB@badprovider.in
- **Trainee:** trainee1@skillportal.com

---

## 1. Trainee Portal (90 seconds)
- **Login** as `trainee1@skillportal.com`.
- Show the **Dashboard**: Highlight the enrollment status, next follow-up date, and dynamic quick actions.
- Navigate to **Skill Verification**: Start and complete a quick assessment. 
- Show **Assessment Results**: Point out how the AI correctly identifies specific skill gaps and provides verified reasoning exclusively for gaps.
- Navigate to **Outcome Passport**: Show the generated passport card and scan the **QR Code** with a mobile phone to demonstrate the public, trustless verification API in action.

## 2. WhatsApp Follow-up (60 seconds)  
- Show the **Timeline** on the trainee dashboard detailing past follow-ups.
- Behind the scenes (or via the Admin panel), trigger the `DAY_30` follow-up.
- **Show Logs**: Switch to the backend terminal to show the generated WhatsApp message payload targeting the trainee's phone.
- Run `npm run simulate:webhook` (or `npx tsx simulateWebhookReply.ts`) to simulate a natural language reply in Hindi from the trainee.
- Switch back to the Database/Dashboard and show the FollowUp status updating live to **RESPONDED** with perfectly extracted JSON data (salary, job role, sentiment).

## 3. Government Admin Dashboard (90 seconds)
- **Login** as `admin@skillportal.gov.in`.
- Show the **Top Metrics**: Total Trainees, Placement Rate, etc.
- Show **District Placement Analytics**: The Recharts bar graph displaying variance across districts.
- Show **Skill Gap Radar**: Highlight the top 5 skill gaps matching market demand vs training supply.
- Point to the **Provider Anomaly Flag** at the bottom (Provider B has a confirmed flag for wage clustering).
- Demonstrate actionability: Click **Confirm/Dismiss** on an open anomaly flag and explain how it writes the admin's audit trail.

## 4. Provider Portal (60 seconds)
- **Login** as `providerB@badprovider.in` (QuickFix Training Center).
- Show the **Low Course Rating (51)** and point out the specific components dragging it down (e.g., poor placement rate).
- Point to the **Remedial Warning Banner** resulting from the admin confirming the anomaly flag in the previous step.
- **Login** as `providerA@skillcorp.in` (Excel Skills Academy) to show the stark contrast — a high score of 82 with no banners, proving the system effectively isolates low-quality providers.

## 5. Course Rating Engine (30 seconds)
- Discuss the **Explainable Score Breakdown** shown on the Provider Dashboard.
- **Key Talking Point:** "This is not a black box. Every component—placements, relevance, wage progression, and relative layoff rates—is transparent and traceable. Providers can see exactly what moved their score, driving actionable improvement rather than blind punishment."
