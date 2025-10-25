import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { districts } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const allDistricts = await db.select({
      id: districts.id,
      districtCode: districts.districtCode,
      districtNameEn: districts.districtNameEn,
      districtNameHi: districts.districtNameHi,
      stateName: districts.stateName,
      createdAt: districts.createdAt,
      updatedAt: districts.updatedAt,
    })
      .from(districts)
      .orderBy(asc(districts.stateName), asc(districts.districtNameEn));

    return NextResponse.json(allDistricts, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}