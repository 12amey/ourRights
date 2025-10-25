import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { districts, districtPerformance, monthlyTrends, categoryBreakdown } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtCode = searchParams.get('district');

    // Validation: Check if district parameter is provided
    if (!districtCode) {
      return NextResponse.json(
        { 
          error: 'District code is required. Please provide a district code in the query parameter.',
          code: 'MISSING_DISTRICT_CODE',
          example: '/api/mgnrega-data?district=1807'
        },
        { status: 400 }
      );
    }

    // Step 1: Find district by districtCode
    const districtResult = await db
      .select()
      .from(districts)
      .where(eq(districts.districtCode, districtCode))
      .limit(1);

    if (districtResult.length === 0) {
      return NextResponse.json(
        { 
          error: `No MGNREGA data available for district code: ${districtCode}. The database does not contain information for this district yet.`,
          code: 'DISTRICT_NOT_FOUND',
          districtCode,
          suggestion: 'Please check if the district code is correct. Available district codes are from Maharashtra (18xx format).'
        },
        { status: 404 }
      );
    }

    const district = districtResult[0];

    // Step 2: Get latest performance data
    const performanceResult = await db
      .select()
      .from(districtPerformance)
      .where(eq(districtPerformance.districtId, district.id))
      .orderBy(desc(districtPerformance.dataDate))
      .limit(1);

    if (performanceResult.length === 0) {
      return NextResponse.json(
        { 
          error: `District "${district.districtNameEn}" (${districtCode}) exists but has no performance data available yet.`,
          code: 'NO_PERFORMANCE_DATA',
          district: {
            code: district.districtCode,
            nameEn: district.districtNameEn,
            nameHi: district.districtNameHi,
            state: district.stateName
          },
          suggestion: 'Real MGNREGA data needs to be synced from the official API. Currently, no data is available for this district.'
        },
        { status: 404 }
      );
    }

    const performance = {
      workCompleted: performanceResult[0].workCompleted,
      fundsUtilizedPercentage: performanceResult[0].fundsUtilizedPercentage,
      activeWorkers: performanceResult[0].activeWorkers,
      averageWage: performanceResult[0].averageWage,
      workCompletionRate: performanceResult[0].workCompletionRate,
      fundUtilizationRate: performanceResult[0].fundUtilizationRate,
      workerParticipationRate: performanceResult[0].workerParticipationRate,
      targetWorks: performanceResult[0].targetWorks,
      achievementWorks: performanceResult[0].achievementWorks,
      dataDate: performanceResult[0].dataDate,
    };

    // Step 3: Get last 12 months of monthly trends
    const trendsResult = await db
      .select()
      .from(monthlyTrends)
      .where(eq(monthlyTrends.districtId, district.id))
      .orderBy(desc(monthlyTrends.year), desc(monthlyTrends.month))
      .limit(12);

    const trends = trendsResult.map(trend => ({
      month: trend.month,
      year: trend.year,
      workCompleted: trend.workCompleted,
      fundsUtilized: trend.fundsUtilized,
      activeWorkers: trend.activeWorkers,
    }));

    // Step 4: Get category breakdown for the latest dataDate
    const categoryResult = await db
      .select()
      .from(categoryBreakdown)
      .where(eq(categoryBreakdown.districtId, district.id))
      .orderBy(desc(categoryBreakdown.dataDate))
      .limit(100);

    // Filter categories by the latest dataDate
    const latestDataDate = performance.dataDate;
    const categories = categoryResult
      .filter(cat => cat.dataDate === latestDataDate)
      .map(cat => ({
        categoryName: cat.categoryName,
        percentage: cat.percentage,
        workCount: cat.workCount,
      }));

    // Step 5: Return combined response
    return NextResponse.json({
      district: {
        id: district.id,
        districtCode: district.districtCode,
        districtNameEn: district.districtNameEn,
        districtNameHi: district.districtNameHi,
        stateName: district.stateName,
      },
      performance,
      monthlyTrends: trends,
      categoryBreakdown: categories,
      dataSource: 'database',
      lastUpdated: performance.dataDate
    });

  } catch (error) {
    console.error('MGNREGA Data API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error occurred while fetching MGNREGA data.',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Please try again later or contact support if the issue persists.'
      },
      { status: 500 }
    );
  }
}