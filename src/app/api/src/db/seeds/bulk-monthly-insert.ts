import { db } from '@/db';
import { monthlyTrends, districts } from '@/db/schema';

async function main() {
  try {
    console.log('Starting bulk monthly trends insert...');

    // Query all districts
    const allDistricts = await db.select({ id: districts.id }).from(districts);
    console.log(`Found ${allDistricts.length} districts`);

    if (allDistricts.length === 0) {
      console.log('No districts found. Please seed districts first.');
      return;
    }

    // Generate all records
    const allRecords = [];
    const totalDistricts = allDistricts.length;

    for (let districtIndex = 0; districtIndex < totalDistricts; districtIndex++) {
      const district = allDistricts[districtIndex];
      
      if ((districtIndex + 1) % 100 === 0 || districtIndex === 0) {
        console.log(`Processing district ${districtIndex + 1} of ${totalDistricts}...`);
      }

      // Generate 12 months of data going backward from January 2025
      for (let i = 0; i < 12; i++) {
        let month = 1 - i;
        let year = 2025;

        if (month <= 0) {
          month += 12;
          year = 2024;
        }

        const record = {
          districtId: district.id,
          month,
          year,
          workCompleted: Math.floor(Math.random() * 501) + 250, // 250-750
          fundsUtilized: Math.floor(Math.random() * 31) + 60, // 60-90
          activeWorkers: Math.floor(Math.random() * 7001) + 7000, // 7000-14000
          createdAt: new Date().toISOString(),
        };

        allRecords.push(record);
      }
    }

    console.log(`Generated ${allRecords.length} total records`);

    // Insert in batches of 500
    const batchSize = 500;
    const totalBatches = Math.ceil(allRecords.length / batchSize);
    let insertedCount = 0;

    for (let i = 0; i < allRecords.length; i += batchSize) {
      const batch = allRecords.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`Inserting batch ${batchNumber} of ${totalBatches}...`);
      
      await db.insert(monthlyTrends).values(batch);
      insertedCount += batch.length;
    }

    console.log(`✅ Successfully inserted ${insertedCount} records`);
  } catch (error) {
    console.error('Error during bulk insert:', error);
    throw error;
  }
}

main().catch(error => console.error('Error:', error));