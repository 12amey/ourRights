import { db } from '@/db';
import { districts, monthlyTrends } from '@/db/schema';

async function main() {
    console.log('Starting monthly trends manual seeder...');
    
    // Get all districts
    const allDistricts = await db.select({ id: districts.id }).from(districts);
    console.log(`Found ${allDistricts.length} districts`);

    const currentDate = new Date();
    const currentMonth = 1; // January
    const currentYear = 2025;
    const createdAt = currentDate.toISOString();

    // Build all records
    const trendsData = [];
    
    for (const district of allDistricts) {
        for (let i = 0; i < 12; i++) {
            let month = currentMonth - i;
            let year = currentYear;
            
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            
            const workCompleted = Math.floor(Math.random() * 501) + 250;
            const fundsUtilized = Math.floor(Math.random() * 31) + 60;
            const activeWorkers = Math.floor(Math.random() * 7001) + 7000;
            
            trendsData.push({
                districtId: district.id,
                month: month,
                year: year,
                workCompleted: workCompleted,
                fundsUtilized: fundsUtilized,
                activeWorkers: activeWorkers,
                createdAt: createdAt,
            });
        }
    }

    console.log(`Generated ${trendsData.length} records`);
    console.log(`First record: ${JSON.stringify(trendsData[0])}`);
    console.log(`Last record: ${JSON.stringify(trendsData[trendsData.length - 1])}`);

    // Insert in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < trendsData.length; i += batchSize) {
        const batch = trendsData.slice(i, i + batchSize);
        await db.insert(monthlyTrends).values(batch);
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
    }

    console.log('✅ Monthly trends manual seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Manual seeder failed:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
});