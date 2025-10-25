import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { districts, districtPerformance, monthlyTrends, categoryBreakdown } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { districtCode, performance, monthlyTrends: trendsData, categoryBreakdown: categoryData } = body;

    // Validate districtCode
    if (!districtCode) {
      return NextResponse.json({
        error: 'District code is required',
        code: 'MISSING_DISTRICT_CODE'
      }, { status: 400 });
    }

    // Validate performance object
    if (!performance) {
      return NextResponse.json({
        error: 'Performance data is required',
        code: 'MISSING_PERFORMANCE_DATA'
      }, { status: 400 });
    }

    // Validate required performance fields
    const requiredFields = [
      'dataDate',
      'workCompleted',
      'fundsUtilizedPercentage',
      'activeWorkers',
      'averageWage',
      'workCompletionRate',
      'fundUtilizationRate',
      'workerParticipationRate',
      'targetWorks',
      'achievementWorks'
    ];

    for (const field of requiredFields) {
      if (performance[field] === undefined || performance[field] === null) {
        return NextResponse.json({
          error: `Performance field '${field}' is required`,
          code: 'MISSING_REQUIRED_FIELD'
        }, { status: 400 });
      }
    }

    // Find district by districtCode
    const district = await db.select()
      .from(districts)
      .where(eq(districts.districtCode, districtCode))
      .limit(1);

    if (district.length === 0) {
      return NextResponse.json({
        error: 'District not found',
        code: 'DISTRICT_NOT_FOUND'
      }, { status: 404 });
    }

    const districtId = district[0].id;
    const currentTimestamp = new Date().toISOString();

    // Insert performance record
    const newPerformance = await db.insert(districtPerformance)
      .values({
        districtId,
        dataDate: performance.dataDate,
        workCompleted: performance.workCompleted,
        fundsUtilizedPercentage: performance.fundsUtilizedPercentage,
        activeWorkers: performance.activeWorkers,
        averageWage: performance.averageWage,
        workCompletionRate: performance.workCompletionRate,
        fundUtilizationRate: performance.fundUtilizationRate,
        workerParticipationRate: performance.workerParticipationRate,
        targetWorks: performance.targetWorks,
        achievementWorks: performance.achievementWorks,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .returning();

    const performanceId = newPerformance[0].id;

    // Insert monthly trends if provided
    let trendIds: number[] = [];
    if (trendsData && Array.isArray(trendsData) && trendsData.length > 0) {
      for (const trend of trendsData) {
        if (!trend.month || !trend.year || trend.workCompleted === undefined || 
            trend.fundsUtilized === undefined || trend.activeWorkers === undefined) {
          continue;
        }

        const newTrend = await db.insert(monthlyTrends)
          .values({
            districtId,
            month: trend.month,
            year: trend.year,
            workCompleted: trend.workCompleted,
            fundsUtilized: trend.fundsUtilized,
            activeWorkers: trend.activeWorkers,
            createdAt: currentTimestamp
          })
          .returning();

        trendIds.push(newTrend[0].id);
      }
    }

    // Insert category breakdown if provided
    let categoryIds: number[] = [];
    if (categoryData && Array.isArray(categoryData) && categoryData.length > 0) {
      for (const category of categoryData) {
        if (!category.categoryName || category.percentage === undefined || 
            category.workCount === undefined) {
          continue;
        }

        const newCategory = await db.insert(categoryBreakdown)
          .values({
            districtId,
            dataDate: performance.dataDate,
            categoryName: category.categoryName,
            percentage: category.percentage,
            workCount: category.workCount,
            createdAt: currentTimestamp
          })
          .returning();

        categoryIds.push(newCategory[0].id);
      }
    }

    return NextResponse.json({
      message: 'MGNREGA data synced successfully',
      data: {
        performanceId,
        trendIds,
        categoryIds,
        districtId,
        districtCode
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}