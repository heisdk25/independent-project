import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface YearData {
  year: string;
  topics: Array<{ topic: string; frequency: number; percentage: number }>;
}

interface SubjectComparison {
  subject: string;
  semester: number;
  yearData: YearData[];
}

interface ComparativeViewProps {
  comparisons: SubjectComparison[];
}

const YEAR_COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

export const ComparativeView = ({ comparisons }: ComparativeViewProps) => {
  if (comparisons.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Upload PYQs from multiple years to see comparative analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {comparisons.map((comparison, idx) => {
        // Build chart data
        const allTopics = new Set<string>();
        comparison.yearData.forEach((yd) => {
          yd.topics.forEach((t) => allTopics.add(t.topic));
        });

        const chartData = Array.from(allTopics).slice(0, 8).map((topic) => {
          const row: Record<string, string | number> = { topic };
          comparison.yearData.forEach((yd) => {
            const found = yd.topics.find((t) => t.topic === topic);
            row[yd.year] = found?.frequency || 0;
          });
          return row;
        });

        // Calculate trends (comparing first and last year)
        const trends = Array.from(allTopics).map((topic) => {
          const firstYear = comparison.yearData[0];
          const lastYear = comparison.yearData[comparison.yearData.length - 1];
          const firstFreq = firstYear?.topics.find((t) => t.topic === topic)?.frequency || 0;
          const lastFreq = lastYear?.topics.find((t) => t.topic === topic)?.frequency || 0;
          const change = lastFreq - firstFreq;
          return { topic, change, lastFreq };
        }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

        return (
          <motion.div
            key={`${comparison.subject}-${comparison.semester}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-display font-semibold text-foreground">
                  {comparison.subject}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Semester {comparison.semester} • {comparison.yearData.length} years compared
                </p>
              </div>
              <div className="flex gap-2">
                {comparison.yearData.map((yd, i) => (
                  <Badge
                    key={yd.year}
                    style={{ backgroundColor: YEAR_COLORS[i % YEAR_COLORS.length] }}
                    className="text-white"
                  >
                    {yd.year}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Grouped Bar Chart */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base">Topic Frequency Across Years</CardTitle>
                <CardDescription>
                  Compare how often topics appeared in different years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        dataKey="topic"
                        type="category"
                        width={100}
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      {comparison.yearData.map((yd, i) => (
                        <Bar
                          key={yd.year}
                          dataKey={yd.year}
                          fill={YEAR_COLORS[i % YEAR_COLORS.length]}
                          radius={[0, 4, 4, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Trend Indicators */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base">Topic Trends</CardTitle>
                <CardDescription>
                  Topics with significant changes over the years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trends.slice(0, 6).map((trend) => (
                    <div
                      key={trend.topic}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                    >
                      <span className="font-medium text-foreground text-sm">{trend.topic}</span>
                      <div className="flex items-center gap-1">
                        {trend.change > 0 ? (
                          <ArrowUp className="w-4 h-4 text-green-500" />
                        ) : trend.change < 0 ? (
                          <ArrowDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm font-semibold ${
                            trend.change > 0
                              ? "text-green-500"
                              : trend.change < 0
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {trend.change > 0 ? "+" : ""}
                          {trend.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
