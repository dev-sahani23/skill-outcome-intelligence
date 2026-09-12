import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running pre-migration script...');
  
  try {
    // Check if FORMAL_EMPLOYMENT already exists in the enum
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'OutcomeType' AND enumlabel = 'FORMAL_EMPLOYMENT';
    `;
    
    if (Array.isArray(result) && result.length === 0) {
      console.log("Adding 'FORMAL_EMPLOYMENT' to OutcomeType enum...");
      await prisma.$executeRawUnsafe(`ALTER TYPE "OutcomeType" ADD VALUE 'FORMAL_EMPLOYMENT';`);
    }

    console.log("Updating 'PLACED' to 'FORMAL_EMPLOYMENT'...");
    // Update existing rows
    const updateResult = await prisma.$executeRawUnsafe(`
      UPDATE "employment_outcomes" 
      SET "type" = 'FORMAL_EMPLOYMENT' 
      WHERE "type"::text = 'PLACED';
    `);
    
    console.log(`Updated rows successfully.`);
  } catch (error) {
    console.error('Error during pre-migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
