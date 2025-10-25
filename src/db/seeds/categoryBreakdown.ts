import { db } from '@/db';
import { categoryBreakdown, districts } from '@/db/schema';

async function main() {
    // Query all districts
    const allDistricts = await db.select({ id: districts.id }).from(districts);
    
    if (allDistricts.length === 0) {
        console.log('⚠️ No districts found. Please seed districts table first.');
        return;
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const categoryData = [];

    // Category definitions with percentage ranges
    const categories = [
        { name: 'Road Construction', minPct: 30, maxPct: 35 },
        { name: 'Water Conservation', minPct: 25, maxPct: 30 },
        { name: 'Agriculture', minPct: 15, maxPct: 20 },
        { name: 'Infrastructure', minPct: 12, maxPct: 16 },
        { name: 'Others', minPct: 5, maxPct: 10 }
    ];

    // Generate data for each district
    for (const district of allDistricts) {
        // Generate base work completed for this district
        const baseWorkCompleted = Math.floor(Math.random() * (800 - 300 + 1)) + 300;

        // Generate raw percentages within ranges
        const rawPercentages = categories.map(cat => {
            return Math.random() * (cat.maxPct - cat.minPct) + cat.minPct;
        });

        // Calculate total and normalize to 100%
        const totalPercentages = rawPercentages.reduce((sum, pct) => sum + pct, 0);
        const normalizedPercentages = rawPercentages.map(pct => 
            Math.round((pct / totalPercentages) * 100)
        );

        // Ensure percentages sum to exactly 100 by adjusting the largest percentage
        const percentageSum = normalizedPercentages.reduce((sum, pct) => sum + pct, 0);
        if (percentageSum !== 100) {
            const maxIndex = normalizedPercentages.indexOf(Math.max(...normalizedPercentages));
            normalizedPercentages[maxIndex] += (100 - percentageSum);
        }

        // Calculate work counts based on percentages
        let totalWorkCount = 0;
        const workCounts = normalizedPercentages.map((pct, index) => {
            const workCount = Math.floor((pct / 100) * baseWorkCompleted);
            totalWorkCount += workCount;
            return workCount;
        });

        // Adjust the last category's work count to match baseWorkCompleted exactly
        const workCountDifference = baseWorkCompleted - totalWorkCount;
        workCounts[workCounts.length - 1] += workCountDifference;

        // Create category records for this district
        categories.forEach((category, index) => {
            categoryData.push({
                districtId: district.id,
                dataDate: currentDate,
                categoryName: category.name,
                percentage: normalizedPercentages[index],
                workCount: workCounts[index],
                createdAt: new Date().toISOString(),
            });
        });
    }

    // Insert all category breakdown records
    await db.insert(categoryBreakdown).values(categoryData);
    
    console.log(`✅ Category breakdown seeder completed successfully`);
    console.log(`   Districts processed: ${allDistricts.length}`);
    console.log(`   Total records inserted: ${categoryData.length} (${allDistricts.length} × 5 categories)`);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});