"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DistrictData } from "@/lib/mgnrega-data";

interface ExportButtonsProps {
  data: DistrictData;
  districtName: string;
  downloadPDF: string;
  downloadCSV: string;
}

export function ExportButtons({ data, districtName, downloadPDF, downloadCSV }: ExportButtonsProps) {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`MGNREGA Report - ${districtName}`, 14, 20);
    
    // Metrics
    doc.setFontSize(12);
    doc.text("Performance Metrics", 14, 35);
    
    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: [
        ["Work Completed", data.metrics.workCompleted.toString()],
        ["Funds Utilized", `${data.metrics.fundsUtilized}%`],
        ["Active Workers", data.metrics.activeWorkers.toLocaleString()],
        ["Average Wage/Day", `₹${data.metrics.averageWage}`],
        ["Work Completion Rate", `${data.metrics.workCompletionRate}%`],
        ["Fund Utilization Rate", `${data.metrics.fundUtilizationRate}%`],
        ["Worker Participation", `${data.metrics.workerParticipation}%`],
      ],
    });
    
    // Monthly Data
    const afterMetrics = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Monthly Performance", 14, afterMetrics);
    
    autoTable(doc, {
      startY: afterMetrics + 5,
      head: [["Month", "Work Completed", "Funds Utilized (%)", "Workers"]],
      body: data.monthlyData.map((m) => [
        m.month,
        m.workCompleted.toString(),
        m.fundsUtilized.toString(),
        m.workers.toLocaleString(),
      ]),
    });
    
    // Category Data
    const afterMonthly = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Category-wise Breakdown", 14, afterMonthly);
    
    autoTable(doc, {
      startY: afterMonthly + 5,
      head: [["Category", "Percentage"]],
      body: data.categoryData.map((cat) => [
        cat.name,
        `${cat.value}%`,
      ]),
    });
    
    // Target vs Achievement
    const afterCategory = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Target vs Achievement", 14, afterCategory);
    
    autoTable(doc, {
      startY: afterCategory + 5,
      head: [["Metric", "Value"]],
      body: [
        ["Target", data.targetVsAchievement.target.toString()],
        ["Achievement", data.targetVsAchievement.achievement.toString()],
        ["Achievement Rate", `${Math.round((data.targetVsAchievement.achievement / data.targetVsAchievement.target) * 100)}%`],
      ],
    });
    
    doc.save(`MGNREGA-${districtName}-Report.pdf`);
  };

  const handleDownloadCSV = () => {
    const rows: (string | number)[][] = [
      ["MGNREGA Report - " + districtName],
      [],
      ["Performance Metrics"],
      ["Metric", "Value"],
      ["District", districtName],
      ["Work Completed", data.metrics.workCompleted],
      ["Funds Utilized (%)", data.metrics.fundsUtilized],
      ["Active Workers", data.metrics.activeWorkers],
      ["Average Wage/Day (₹)", data.metrics.averageWage],
      ["Work Completion Rate (%)", data.metrics.workCompletionRate],
      ["Fund Utilization Rate (%)", data.metrics.fundUtilizationRate],
      ["Worker Participation (%)", data.metrics.workerParticipation],
      [],
      ["Monthly Performance"],
      ["Month", "Work Completed", "Funds Utilized (%)", "Workers"],
      ...data.monthlyData.map((m) => [
        m.month,
        m.workCompleted,
        m.fundsUtilized,
        m.workers,
      ]),
      [],
      ["Category-wise Breakdown"],
      ["Category", "Percentage"],
      ...data.categoryData.map((cat) => [
        cat.name,
        cat.value,
      ]),
      [],
      ["Target vs Achievement"],
      ["Metric", "Value"],
      ["Target", data.targetVsAchievement.target],
      ["Achievement", data.targetVsAchievement.achievement],
      ["Achievement Rate (%)", Math.round((data.targetVsAchievement.achievement / data.targetVsAchievement.target) * 100)],
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MGNREGA-${districtName}-Data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3 flex-wrap">
      <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
        <FileText className="h-4 w-4" />
        {downloadPDF}
      </Button>
      <Button onClick={handleDownloadCSV} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        {downloadCSV}
      </Button>
    </div>
  );
}