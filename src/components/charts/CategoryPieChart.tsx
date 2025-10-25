"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CategoryPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title: string;
}

// Vibrant color palette using all chart colors
const COLORS = [
  "hsl(var(--chart-1))", // Orange
  "hsl(var(--chart-2))", // Teal/Cyan
  "hsl(var(--chart-3))", // Blue
  "hsl(var(--chart-4))", // Lime/Yellow
  "hsl(var(--chart-5))", // Coral/Pink
];

export function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <radialGradient key={`gradient-${index}`} id={`colorGradient${index}`}>
                    <stop offset="0%" stopColor={color} stopOpacity={1} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                  </radialGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                innerRadius={30}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#colorGradient${index % COLORS.length})`}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}