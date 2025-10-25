"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/MetricCard";
import { ExportButtons } from "@/components/ExportButtons";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { MonthlyTrendChart } from "@/components/charts/MonthlyTrendChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { TargetAchievementChart } from "@/components/charts/TargetAchievementChart";
import { useLanguage } from "@/hooks/useLanguage";
import { DistrictData, districts } from "@/lib/mgnrega-data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Briefcase, 
  IndianRupee, 
  Users, 
  TrendingUp,
  Languages,
  AlertCircle,
  CheckCircle,
  Activity,
  UserCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function DistrictDashboard() {
  const params = useParams();
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [data, setData] = useState<DistrictData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const districtId = params.district as string;
  const district = districts.find(d => d.id === districtId);
  const districtName = district?.name[language] || districtId;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/mgnrega?district=${districtId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [districtId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-6 w-64 bg-muted animate-pulse rounded" />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t.error}: {error}
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {language === "en" ? "Back to Home" : "होम पर वापस जाएं"}
            </Button>
            <Button onClick={() => window.location.reload()}>
              {t.retry}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - New Design */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient with diagonal flow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-chart-1/5 via-background to-chart-3/10" />
        
        {/* Mesh pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--color-chart-2) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, var(--color-chart-4) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
        
        {/* Animated gradient orbs - different positions and colors */}
        <div className="absolute inset-0 opacity-40">
          <motion.div
            className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-gradient-radial from-chart-4/30 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-radial from-chart-2/25 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, -40, 0],
              y: [0, 60, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-gradient-radial from-chart-5/20 to-transparent rounded-full blur-3xl"
            animate={{
              x: [0, 70, 0],
              y: [0, -50, 0],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-radial from-chart-1/15 to-transparent rounded-full blur-3xl"
            animate={{
              x: [-50, 50, -50],
              y: [-30, 30, -30],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        {/* Subtle scan line effect */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: 'linear-gradient(to bottom, transparent 50%, var(--color-foreground) 50%)',
            backgroundSize: '100% 4px',
          }}
          animate={{
            y: [0, 8],
          }}
          transition={{
            duration: 0.15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push("/")}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {language === "en" ? "Back" : "वापस"}
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{districtName}</h1>
                <p className="text-sm text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ExportButtons
                data={data}
                districtName={districtName}
                downloadPDF={t.downloadPDF}
                downloadCSV={t.downloadCSV}
              />
              <Button
                onClick={toggleLanguage}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Languages className="h-4 w-4" />
                {language === "en" ? "हिन्दी" : "English"}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative">
        {/* Primary Metrics Cards */}
        <section className="mb-8">
          <motion.h2 
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {t.overview}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title={t.workCompleted}
              value={data.metrics.workCompleted.toLocaleString()}
              icon={<Briefcase />}
              color="border-l-chart-1"
              tooltip={t.tooltip.workCompleted}
              delay={0}
            />
            <MetricCard
              title={t.fundsUtilized}
              value={`${data.metrics.fundsUtilized}%`}
              icon={<IndianRupee />}
              color="border-l-chart-2"
              tooltip={t.tooltip.fundsUtilized}
              delay={0.1}
            />
            <MetricCard
              title={t.activeWorkers}
              value={data.metrics.activeWorkers.toLocaleString()}
              icon={<Users />}
              color="border-l-chart-3"
              tooltip={t.tooltip.activeWorkers}
              delay={0.2}
            />
            <MetricCard
              title={t.averageWage}
              value={`₹${data.metrics.averageWage}`}
              icon={<TrendingUp />}
              color="border-l-chart-4"
              tooltip={t.tooltip.averageWage}
              delay={0.3}
            />
          </div>
        </section>

        {/* Additional Performance Metrics */}
        <section className="mb-8">
          <motion.h2 
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {language === "en" ? "Performance Indicators" : "प्रदर्शन संकेतक"}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title={language === "en" ? "Work Completion Rate" : "कार्य पूर्णता दर"}
              value={`${data.metrics.workCompletionRate}%`}
              icon={<CheckCircle />}
              color="border-l-chart-5"
              tooltip={language === "en" ? "Percentage of planned works completed" : "नियोजित कार्यों का पूर्ण प्रतिशत"}
              delay={0.4}
            />
            <MetricCard
              title={language === "en" ? "Fund Utilization Rate" : "निधि उपयोग दर"}
              value={`${data.metrics.fundUtilizationRate}%`}
              icon={<Activity />}
              color="border-l-chart-1"
              tooltip={language === "en" ? "Efficiency of fund deployment" : "निधि तैनाती की दक्षता"}
              delay={0.5}
            />
            <MetricCard
              title={language === "en" ? "Worker Participation" : "कार्यकर्ता भागीदारी"}
              value={`${data.metrics.workerParticipation}%`}
              icon={<UserCheck />}
              color="border-l-chart-3"
              tooltip={language === "en" ? "Active worker engagement rate" : "सक्रिय कार्यकर्ता सहभागिता दर"}
              delay={0.6}
            />
          </div>
        </section>

        {/* Charts Row 1 */}
        <section className="mb-8">
          <motion.h2 
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t.performance}
          </motion.h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TargetAchievementChart
              target={data.targetVsAchievement.target}
              achievement={data.targetVsAchievement.achievement}
              title={t.targetVsAchievement}
            />
            <CategoryPieChart
              data={data.categoryData}
              title={t.categoryWiseBreakdown}
            />
          </div>
        </section>

        {/* Charts Row 2 */}
        <section>
          <motion.h2 
            className="text-xl font-semibold mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t.trends}
          </motion.h2>
          <MonthlyTrendChart
            data={data.monthlyData}
            title={t.monthlyTrend}
            months={t.months}
          />
        </section>
      </main>
    </div>
  );
}