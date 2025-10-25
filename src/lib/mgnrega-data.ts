// District data structure for frontend
export interface District {
  id: string;
  name: {
    en: string;
    hi: string;
  };
}

export interface DistrictData {
  id: string;
  name: {
    en: string;
    hi: string;
  };
  metrics: {
    workCompleted: number;
    fundsUtilized: number;
    activeWorkers: number;
    averageWage: number;
    workCompletionRate: number;
    fundUtilizationRate: number;
    workerParticipation: number;
  };
  monthlyData: Array<{
    month: string;
    workCompleted: number;
    fundsUtilized: number;
    workers: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  targetVsAchievement: {
    target: number;
    achievement: number;
  };
}

// Maharashtra districts from MGNREGA official data (State Code: 18)
export const districts: District[] = [
  { id: "1809", name: { en: "Ahmednagar", hi: "अहमदनगर" } },
  { id: "1823", name: { en: "Akola", hi: "अकोला" } },
  { id: "1824", name: { en: "Amravati", hi: "अमरावती" } },
  { id: "1817", name: { en: "Beed", hi: "बीड" } },
  { id: "1830", name: { en: "Bhandara", hi: "भंडारा" } },
  { id: "1825", name: { en: "Buldhana", hi: "बुलढाणा" } },
  { id: "1832", name: { en: "Chandrapur", hi: "चंद्रपुर" } },
  { id: "1834", name: { en: "Dharashiv", hi: "धाराशिव" } },
  { id: "1804", name: { en: "Dhule", hi: "धुळे" } },
  { id: "1833", name: { en: "Gadchiroli", hi: "गडचिरोली" } },
  { id: "1831", name: { en: "Gondia", hi: "गोंदिया" } },
  { id: "1818", name: { en: "Hingoli", hi: "हिंगोली" } },
  { id: "1819", name: { en: "Jalgaon", hi: "जळगाव" } },
  { id: "1816", name: { en: "Jalna", hi: "जालना" } },
  { id: "1812", name: { en: "Kolhapur", hi: "कोल्हापूर" } },
  { id: "1815", name: { en: "Latur", hi: "लातूर" } },
  { id: "1829", name: { en: "Nagpur", hi: "नागपूर" } },
  { id: "1820", name: { en: "Nanded", hi: "नांदेड" } },
  { id: "1803", name: { en: "Nandurbar", hi: "नंदुरबार" } },
  { id: "1802", name: { en: "Nashik", hi: "नाशिक" } },
  { id: "1835", name: { en: "Palghar", hi: "पालघर" } },
  { id: "1821", name: { en: "Parbhani", hi: "परभणी" } },
  { id: "1807", name: { en: "Pune", hi: "पुणे" } },
  { id: "1805", name: { en: "Raigad", hi: "रायगड" } },
  { id: "1810", name: { en: "Ratnagiri", hi: "रत्नागिरी" } },
  { id: "1813", name: { en: "Sangli", hi: "सांगली" } },
  { id: "1814", name: { en: "Satara", hi: "सातारा" } },
  { id: "1811", name: { en: "Sindhudurg", hi: "सिंधुदुर्ग" } },
  { id: "1808", name: { en: "Solapur", hi: "सोलापूर" } },
  { id: "1806", name: { en: "Thane", hi: "ठाणे" } },
  { id: "1828", name: { en: "Wardha", hi: "वर्धा" } },
  { id: "1826", name: { en: "Washim", hi: "वाशिम" } },
  { id: "1827", name: { en: "Yavatmal", hi: "यवतमाळ" } },
];

// Generate mock data for districts (fallback when API fails)
export function generateMockDistrictData(districtId: string): DistrictData {
  const district = districts.find(d => d.id === districtId);
  if (!district) {
    throw new Error("District not found");
  }

  const baseMetrics = {
    workCompleted: Math.floor(Math.random() * 500) + 300,
    fundsUtilized: Math.floor(Math.random() * 30) + 65,
    activeWorkers: Math.floor(Math.random() * 5000) + 10000,
    averageWage: Math.floor(Math.random() * 50) + 250,
    workCompletionRate: Math.floor(Math.random() * 20) + 75,
    fundUtilizationRate: Math.floor(Math.random() * 25) + 70,
    workerParticipation: Math.floor(Math.random() * 15) + 80,
  };

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    workCompleted: Math.floor(Math.random() * 50) + 20,
    fundsUtilized: Math.floor(Math.random() * 30) + 60,
    workers: Math.floor(Math.random() * 1000) + 800,
  }));

  const categoryData = [
    { name: "Road Construction", value: 35, color: "hsl(var(--chart-1))" },
    { name: "Water Conservation", value: 25, color: "hsl(var(--chart-2))" },
    { name: "Agriculture", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Infrastructure", value: 15, color: "hsl(var(--chart-4))" },
    { name: "Others", value: 5, color: "hsl(var(--chart-5))" },
  ];

  return {
    id: districtId,
    name: district.name,
    metrics: baseMetrics,
    monthlyData,
    categoryData,
    targetVsAchievement: {
      target: 100,
      achievement: baseMetrics.workCompletionRate,
    },
  };
}