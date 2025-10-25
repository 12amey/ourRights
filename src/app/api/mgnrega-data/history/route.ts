import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { districts, districtPerformance } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtCode = searchParams.get('district');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate required parameter
    if (!districtCode) {
      return NextResponse.json(
        { 
          error: 'District code is required',
          code: 'MISSING_DISTRICT_CODE' 
        },
        { status: 400 }
      );
    }

    // Find district by districtCode
    const district = await db.select()
      .from(districts)
      .where(eq(districts.districtCode, districtCode))
      .limit(1);

    if (district.length === 0) {
      return NextResponse.json(
        { 
          error: 'District not found',
          code: 'DISTRICT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const districtData = district[0];

    // Build query conditions
    const conditions = [eq(districtPerformance.districtId, districtData.id)];

    if (startDate) {
      conditions.push(gte(districtPerformance.dataDate, startDate));
    }

    if (endDate) {
      conditions.push(lte(districtPerformance.dataDate, endDate));
    }

    // Query performance records with filters
    const whereCondition = conditions.length > 1 
      ? and(...conditions)
      : conditions[0];

    const history = await db.select()
      .from(districtPerformance)
      .where(whereCondition)
      .orderBy(desc(districtPerformance.dataDate));

    // Return response with district and history
    return NextResponse.json({
      district: {
        id: districtData.id,
        districtCode: districtData.districtCode,
        districtNameEn: districtData.districtNameEn,
        districtNameHi: districtData.districtNameHi,
        stateName: districtData.stateName
      },
      history: history
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}