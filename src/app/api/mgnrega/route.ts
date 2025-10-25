import { NextResponse } from "next/server";
import { generateMockDistrictData, districts } from "@/lib/mgnrega-data";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("district");

    if (!districtId) {
      return NextResponse.json(
        { error: "District ID is required" },
        { status: 400 }
      );
    }

    // Check cache
    const cached = cache.get(districtId);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        timestamp: cached.timestamp,
        source: "cache"
      });
    }

    // Try to fetch from database API first
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/mgnrega-data?district=${districtId}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const dbData = await response.json();

        // Transform database response to match frontend DistrictData interface
        const transformedData = {
          id: dbData.district.districtCode,
          name: {
            en: dbData.district.districtNameEn,
            hi: dbData.district.districtNameHi,
          },
          metrics: {
            workCompleted: dbData.performance?.workCompleted || 0,
            fundsUtilized: dbData.performance?.fundsUtilizedPercentage || 0,
            activeWorkers: dbData.performance?.activeWorkers || 0,
            averageWage: dbData.performance?.averageWage || 0,
            workCompletionRate: dbData.performance?.workCompletionRate || 0,
            fundUtilizationRate: dbData.performance?.fundUtilizationRate || 0,
            workerParticipation: dbData.performance?.workerParticipationRate || 0,
          },
          monthlyData: dbData.monthlyTrends.reverse().map((trend: any) => ({
            month: monthNames[trend.month - 1],
            workCompleted: trend.workCompleted,
            fundsUtilized: trend.fundsUtilized,
            workers: trend.activeWorkers,
          })),
          categoryData: dbData.categoryBreakdown.map((cat: any, index: number) => ({
            name: cat.categoryName,
            value: cat.percentage,
            color: `hsl(var(--chart-${(index % 5) + 1}))`,
          })),
          targetVsAchievement: {
            target: dbData.performance?.targetWorks || 100,
            achievement: dbData.performance?.achievementWorks || 0,
          },
        };

        // Update cache
        cache.set(districtId, { data: transformedData, timestamp: now });

        return NextResponse.json({
          data: transformedData,
          cached: false,
          timestamp: now,
          source: "database"
        });
      }
    } catch (dbError) {
      console.log("Database API not available, using mock data:", dbError);
    }

    // Fallback: Check if district exists in hardcoded list for mock data
    const district = districts.find(d => d.id === districtId);
    if (district) {
      console.log(`Generating mock data for district: ${district.name.en} (${districtId})`);
      const mockData = generateMockDistrictData(districtId);

      // Update cache with mock data
      cache.set(districtId, { data: mockData, timestamp: now });

      return NextResponse.json({
        data: mockData,
        cached: false,
        timestamp: now,
        source: "mock",
        message: "Using simulated data. Database integration pending."
      });
    }

    // District not found in database or mock data
    return NextResponse.json(
      { error: "District data not available", districtId },
      { status: 404 }
    );

  } catch (error) {
    console.error("MGNREGA API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch district data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}