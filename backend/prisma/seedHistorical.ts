import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const csvPath = path.join(__dirname, 'historical_data.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`Please create ${csvPath} and paste the CSV data into it.`);
    process.exit(1);
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n').filter(line => line.trim().length > 0);

  // Skip header
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} records. Processing...`);

  let count = 0;
  for (const line of dataLines) {
    // S.no,Financial Year,State Name,District Name,Enrolled ,Assessed 
    const cols = line.split(',');
    if (cols.length < 6) continue;

    const financialYear = cols[1].trim();
    const stateName = cols[2].trim();
    const districtName = cols[3].trim();
    const enrolledStr = cols[4].trim();
    const assessedStr = cols[5].trim();

    if (!financialYear || !districtName) continue;

    const enrolled = parseInt(enrolledStr, 10) || 0;
    const assessed = parseInt(assessedStr, 10) || 0;

    // Ensure district exists
    let district = await prisma.district.findFirst({
      where: {
        name: districtName,
        state: stateName
      }
    });

    if (!district) {
      district = await prisma.district.create({
        data: {
          name: districtName,
          state: stateName
        }
      });
      console.log(`Created new District: ${districtName}, ${stateName}`);
    }

    // Upsert historical data
    await prisma.districtHistoricalData.upsert({
      where: {
        districtId_financialYear: {
          districtId: district.id,
          financialYear: financialYear
        }
      },
      update: {
        enrolled,
        assessed
      },
      create: {
        districtId: district.id,
        financialYear,
        enrolled,
        assessed
      }
    });

    count++;
    if (count % 100 === 0) {
      console.log(`Processed ${count} records...`);
    }
  }

  console.log(`Successfully imported ${count} historical records!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
