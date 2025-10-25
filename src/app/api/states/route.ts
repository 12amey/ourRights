import { NextResponse } from 'next/server';
import { db } from '@/db';
import { districts } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get unique states that have districts in the database
    const statesWithData = await db
      .select({
        stateName: districts.stateName,
      })
      .from(districts)
      .groupBy(districts.stateName);

    // Map state names back to codes
    const STATE_NAME_TO_CODE: Record<string, { code: string; nameHi: string }> = {
      'Jammu and Kashmir': { code: "01", nameHi: "जम्मू और कश्मीर" },
      'Himachal Pradesh': { code: "02", nameHi: "हिमाचल प्रदेश" },
      'Punjab': { code: "03", nameHi: "पंजाब" },
      'Chandigarh': { code: "04", nameHi: "चंडीगढ़" },
      'Uttarakhand': { code: "05", nameHi: "उत्तराखंड" },
      'Haryana': { code: "06", nameHi: "हरियाणा" },
      'Delhi': { code: "07", nameHi: "दिल्ली" },
      'Rajasthan': { code: "08", nameHi: "राजस्थान" },
      'Uttar Pradesh': { code: "09", nameHi: "उत्तर प्रदेश" },
      'Bihar': { code: "10", nameHi: "बिहार" },
      'Sikkim': { code: "11", nameHi: "सिक्किम" },
      'Arunachal Pradesh': { code: "12", nameHi: "अरुणाचल प्रदेश" },
      'Nagaland': { code: "13", nameHi: "नागालैंड" },
      'Manipur': { code: "14", nameHi: "मणिपुर" },
      'Mizoram': { code: "15", nameHi: "मिजोरम" },
      'Tripura': { code: "16", nameHi: "त्रिपुरा" },
      'Meghalaya': { code: "17", nameHi: "मेघालय" },
      'Assam': { code: "18", nameHi: "असम" },
      'West Bengal': { code: "19", nameHi: "पश्चिम बंगाल" },
      'Jharkhand': { code: "20", nameHi: "झारखंड" },
      'Odisha': { code: "21", nameHi: "ओडिशा" },
      'Chhattisgarh': { code: "22", nameHi: "छत्तीसगढ़" },
      'Madhya Pradesh': { code: "23", nameHi: "मध्य प्रदेश" },
      'Gujarat': { code: "24", nameHi: "गुजरात" },
      'Daman and Diu': { code: "25", nameHi: "दमन और दीव" },
      'Dadra and Nagar Haveli': { code: "26", nameHi: "दादरा और नगर हवेली" },
      'Maharashtra': { code: "27", nameHi: "महाराष्ट्र" },
      'Karnataka': { code: "28", nameHi: "कर्नाटक" },
      'Goa': { code: "29", nameHi: "गोवा" },
      'Lakshadweep': { code: "30", nameHi: "लक्षद्वीप" },
      'Kerala': { code: "31", nameHi: "केरल" },
      'Tamil Nadu': { code: "32", nameHi: "तमिलनाडु" },
      'Puducherry': { code: "33", nameHi: "पुडुचेरी" },
      'Andaman and Nicobar Islands': { code: "34", nameHi: "अंडमान और निकोबार द्वीप समूह" },
      'Telangana': { code: "35", nameHi: "तेलंगाना" },
      'Andhra Pradesh': { code: "36", nameHi: "आंध्र प्रदेश" },
      'Ladakh': { code: "37", nameHi: "लद्दाख" }
    };

    // Build the response with only states that have data
    const availableStates = statesWithData
      .map(({ stateName }) => {
        const stateInfo = STATE_NAME_TO_CODE[stateName];
        if (!stateInfo) return null;
        
        return {
          code: stateInfo.code,
          nameEn: stateName,
          nameHi: stateInfo.nameHi
        };
      })
      .filter((state): state is NonNullable<typeof state> => state !== null)
      .sort((a, b) => a.code.localeCompare(b.code));

    return NextResponse.json({
      states: availableStates,
      source: 'database',
      count: availableStates.length
    });

  } catch (error) {
    console.error('States API error:', error);
    
    return NextResponse.json({
      error: 'Failed to load states',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}