git checkout main
git pull origin main

git checkout -B feature/whatsapp-testing

git add backend/package.json backend/package-lock.json backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "chore: update dependencies and database schema"

git add backend/src/server.ts backend/src/utils/pagination.ts backend/src/modules/admin/
git commit -m "feat(backend): add core server and admin modules"

git add backend/src/modules/course/ backend/src/modules/enrollment/
git commit -m "feat(backend): implement course and enrollment controllers"

git add backend/src/modules/reports/ backend/prisma/seed-full.ts backend/prisma/link-to-default-provider.ts
git commit -m "feat(backend): add reporting modules and database seed scripts"

git add frontend/src/components/ui/ frontend/src/styles/
git commit -m "feat(frontend): add core UI components and styling updates"

git add frontend/src/pages/auth/ frontend/src/lib/auth.ts
git commit -m "feat(frontend): implement authentication pages and logic"

git add frontend/src/app/Router.tsx frontend/src/pages/dashboard/OrgDashboard.tsx frontend/src/pages/dashboard/ProviderDashboard.tsx frontend/src/pages/dashboard/CoursesList.tsx
git commit -m "feat(frontend): setup main application routing and provider dashboard"

git add frontend/src/pages/dashboard/TraineesList.tsx frontend/src/pages/dashboard/TraineeDashboard.tsx frontend/src/components/trainee/AddTrainingRecordModal.tsx frontend/src/pages/dashboard/ProviderTraineesList.tsx
git commit -m "feat(frontend): build trainee management and dashboard components"

git add frontend/src/pages/dashboard/SkillGaps.tsx frontend/src/pages/reports/ frontend/src/api/
git commit -m "feat(frontend): add skill gaps analysis and reporting views"

git add frontend/src/pages/trainee/ frontend/src/pages/public/PublicVerify.tsx
git commit -m "feat(frontend): implement trainee specific views and public verification"

git add .
if ((git status --porcelain).length -gt 0) {
    git commit -m "chore: commit remaining miscellaneous updates"
}

git push -u origin feature/whatsapp-testing

git checkout main
git pull origin main
git merge feature/whatsapp-testing -m "Merge branch 'feature/whatsapp-testing' into main"
git push origin main
