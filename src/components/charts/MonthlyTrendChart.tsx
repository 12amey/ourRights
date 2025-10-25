"use client";

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MonthlyTrendChartProps {
  data: Array<{
    month: string;
    workCompleted: number;
    fundsUtilized: number;
    workers: number;
  }>;
  title: string;
  months: string[];
}

export function MonthlyTrendChart({ data, title, months }: MonthlyTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((item, index) => ({
    month: months[index] || item.month,
    workCompleted: item.workCompleted,
    fundsUtilized: item.fundsUtilized,
    workers: Math.round(item.workers / 100), // Scale down for better visualization
  }));

  if (!mounted) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2">
        <h3 className="text-lg font-semibold mb-6">{title}</h3>
        <div className="w-full" style={{ height: "400px", minHeight: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorWork" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorFunds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorWorkers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                height={60}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                width={60}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="workCompleted" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={4}
                name="Work Completed"
                dot={{ r: 6, fill: "hsl(var(--chart-1))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 8, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="fundsUtilized" 
                stroke="hsl(var(--chart-4))" 
                strokeWidth={4}
                name="Funds Utilized %"
                dot={{ r: 6, fill: "hsl(var(--chart-4))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 8, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="workers" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={4}
                name="Workers (x100)"
                dot={{ r: 6, fill: "hsl(var(--chart-3))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 8, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}