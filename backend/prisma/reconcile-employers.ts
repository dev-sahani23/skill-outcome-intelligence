import { prisma } from "../src/lib/prisma";
import { normalizeEmployerName } from "../src/utils/normalizer";

async function main() {
  console.log("Starting Employer Reconciliation...");

  // 1. Fetch all employers
  const employers = await prisma.employer.findMany();
  if (employers.length === 0) {
    console.log("No employers to reconcile.");
    return;
  }

  // 2. Compute normalizedName and group them
  const grouped = new Map<string, typeof employers>();

  for (const emp of employers) {
    const norm = normalizeEmployerName(emp.name);
    if (!grouped.has(norm)) {
      grouped.set(norm, []);
    }
    grouped.get(norm)!.push(emp);
  }

  // 3. Reconcile duplicates
  for (const [norm, emps] of grouped.entries()) {
    if (emps.length === 1) {
      // No duplicates, just backfill normalizedName
      const emp = emps[0];
      if (emp.normalizedName !== norm) {
        await prisma.employer.update({
          where: { id: emp.id },
          data: { normalizedName: norm },
        });
      }
      continue;
    }

    console.log(`Found ${emps.length} duplicates for "${norm}"`);

    // Determine canonical record: prefer isVerified, then oldest
    emps.sort((a, b) => {
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;
      return a.id.localeCompare(b.id); // Since it's UUID, we could sort by createdAt if it existed, but fallback to ID or we could fetch EmploymentOutcome creation dates. UUIDv4 is random. We will just use ID since we don't have createdAt.
    });

    const canonical = emps[0];
    const duplicates = emps.slice(1);

    // Run in transaction to guarantee consistency
    await prisma.$transaction(async (tx) => {
      // Set canonical normalized name
      await tx.employer.update({
        where: { id: canonical.id },
        data: { normalizedName: norm },
      });

      // Transfer relations for duplicates
      for (const dup of duplicates) {
        await tx.employmentOutcome.updateMany({
          where: { employerId: dup.id },
          data: { employerId: canonical.id },
        });

        // Delete duplicate
        await tx.employer.delete({
          where: { id: dup.id },
        });
      }
    });

    console.log(`Resolved duplicates for "${norm}", canonical ID: ${canonical.id}`);
  }

  console.log("Reconciliation complete.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
