import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { districts } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{ stateCode: string }>;
}

// Map state codes to state names
const STATE_CODE_MAP: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Karnataka',
  '29': 'Goa',
  '30': 'Lakshadweep',
  '31': 'Kerala',
  '32': 'Tamil Nadu',
  '33': 'Puducherry',
  '34': 'Andaman and Nicobar Islands',
  '35': 'Telangana',
  '36': 'Andhra Pradesh',
  '37': 'Ladakh',
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { stateCode } = await context.params;

    if (!stateCode) {
      return NextResponse.json(
        { error: 'State code is required', code: 'MISSING_STATE_CODE' },
        { status: 400 }
      );
    }

    // Get state name from code
    const stateName = STATE_CODE_MAP[stateCode];
    
    if (!stateName) {
      return NextResponse.json(
        { error: 'Invalid state code', code: 'INVALID_STATE_CODE' },
        { status: 400 }
      );
    }

    // Fetch districts from database
    const dbDistricts = await db
      .select({
        code: districts.districtCode,
        nameEn: districts.districtNameEn,
        nameHi: districts.districtNameHi,
      })
      .from(districts)
      .where(eq(districts.stateName, stateName))
      .orderBy(districts.districtNameEn);

    return NextResponse.json({
      stateCode,
      stateName,
      districts: dbDistricts,
      count: dbDistricts.length,
      source: 'database'
    });

  } catch (error) {
    console.error('Districts API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}