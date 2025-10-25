import { db } from '@/db';
import { districts, districtPerformance } from '@/db/schema';

async function main() {
    // Query all districts from the database
    const allDistricts = await db.select({ id: districts.id }).from(districts);
    
    console.log(`Found ${allDistricts.length} districts to seed performance data for...`);
    
    // Helper function to generate random integer within range
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Generate performance records for each district
    const performanceRecords = allDistricts.map((district) => {
        const workCompleted = randomInt(300, 800);
        const currentDate = new Date().toISOString().split('T')[0];
        const currentTimestamp = new Date().toISOString();
        
        return {
            districtId: district.id,
            dataDate: currentDate,
            workCompleted: workCompleted,
            fundsUtilizedPercentage: randomInt(65, 95),
            activeWorkers: randomInt(8000, 15000),
            averageWage: randomInt(250, 300),
            workCompletionRate: randomInt(70, 95),
            fundUtilizationRate: randomInt(65, 92),
            workerParticipationRate: randomInt(60, 85),
            targetWorks: randomInt(400, 1000),
            achievementWorks: workCompleted, // Must equal workCompleted
            createdAt: currentTimestamp,
            updatedAt: currentTimestamp,
        };
    });
    
    // Insert all performance records
    await db.insert(districtPerformance).values(performanceRecords);
    
    console.log(`✅ District performance seeder completed successfully - ${performanceRecords.length} records inserted`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});