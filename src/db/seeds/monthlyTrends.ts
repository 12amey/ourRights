import { db } from '@/db';
import { districts, monthlyTrends } from '@/db/schema';

async function main() {
    // Step 1: Query all districts
    const allDistricts = await db.select({ id: districts.id }).from(districts);
    console.log(`Found ${allDistricts.length} districts`);

    // Step 2: Get current date for month/year calculation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Step 3: Build complete trendsData array
    const trendsData = [];
    const createdAt = new Date().toISOString();

    // Step 4: Generate 12 months of data for each district
    for (const district of allDistricts) {
        for (let i = 0; i < 12; i++) {
            // Calculate month and year going back from current
            let month = currentMonth - i;
            let year = currentYear;

            // Handle year rollover
            if (month <= 0) {
                month += 12;
                year -= 1;
            }

            // Generate random values in specified ranges
            const workCompleted = Math.floor(Math.random() * (750 - 250 + 1)) + 250;
            const fundsUtilized = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
            const activeWorkers = Math.floor(Math.random() * (14000 - 7000 + 1)) + 7000;

            trendsData.push({
                districtId: district.id,
                month,
                year,
                workCompleted,
                fundsUtilized,
                activeWorkers,
                createdAt,
            });
        }
    }

    console.log(`Generated ${trendsData.length} records`);

    // Step 5: Insert all records in one batch
    await db.insert(monthlyTrends).values(trendsData);

    console.log(`✅ Monthly trends seeder completed successfully - inserted ${trendsData.length} records`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});