import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Linking generated programs and trainees to default provider...');
  
  // Find default provider
  const defaultUser = await prisma.user.findUnique({
    where: { email: 'provider@example.com' },
    include: { providerProfile: true }
  });

  if (!defaultUser || !defaultUser.providerProfile) {
    console.log('Default provider not found.');
    return;
  }

  const providerId = defaultUser.providerProfile.id;

  // Get all training programs not belonging to default provider
  const otherPrograms = await prisma.trainingProgram.findMany({
    where: { providerId: { not: providerId } }
  });

  if (otherPrograms.length > 0) {
    console.log(`Found ${otherPrograms.length} programs not owned by default provider. Reassigning them...`);
    await prisma.trainingProgram.updateMany({
      where: { providerId: { not: providerId } },
      data: { providerId: providerId }
    });
    console.log('Successfully reassigned programs.');
  } else {
    console.log('No other programs found or all already assigned.');
  }

  const totalPrograms = await prisma.trainingProgram.count({
    where: { providerId: providerId }
  });

  console.log(`Default provider now has ${totalPrograms} programs.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
