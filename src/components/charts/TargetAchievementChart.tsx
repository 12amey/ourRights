"use client";

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TargetAchievementChartProps {
  target: number;
  achievement: number;
  title: string;
}

export function TargetAchievementChart({ target, achievement, title }: TargetAchievementChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = [
    {
      name: "Performance",
      target: target,
      achievement: achievement,
    },
  ];

  if (!mounted) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={80}>
              <defs>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="achievementGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="name" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
              />
              <Legend />
              <Bar 
                dataKey="target" 
                fill="url(#targetGradient)"
                name="Target"
                radius={[12, 12, 0, 0]}
              />
              <Bar 
                dataKey="achievement" 
                fill="url(#achievementGradient)"
                name="Achievement"
                radius={[12, 12, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-8">
          <div className="text-center px-6 py-3 bg-chart-2/10 rounded-lg border-2 border-chart-2/30">
            <p className="text-2xl font-bold text-chart-2">{target}%</p>
            <p className="text-sm text-muted-foreground">Target</p>
          </div>
          <div className="text-center px-6 py-3 bg-chart-5/10 rounded-lg border-2 border-chart-5/30">
            <p className="text-2xl font-bold text-chart-5">{achievement}%</p>
            <p className="text-sm text-muted-foreground">Achievement</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}