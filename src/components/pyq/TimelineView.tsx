import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
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

interface SubjectTimeline {
  subject: string;
  semester: number;
  yearData: YearData[];
}

interface TimelineViewProps {
  timelines: SubjectTimeline[];
}

const LINE_COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export const TimelineView = ({ timelines }: TimelineViewProps) => {
  if (timelines.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Upload PYQs from multiple years to see timeline analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {timelines.map((timeline, idx) => {
        // Get top topics across all years
        const topicTotals = new Map<string, number>();
        timeline.yearData.forEach((yd) => {
          yd.topics.forEach((t) => {
            topicTotals.set(t.topic, (topicTotals.get(t.topic) || 0) + t.frequency);
          });
        });

        const topTopics = Array.from(topicTotals.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([topic]) => topic);

        // Build line chart data
        const chartData = timeline.yearData.map((yd) => {
          const row: Record<string, string | number> = { year: yd.year };
          topTopics.forEach((topic) => {
            const found = yd.topics.find((t) => t.topic === topic);
            row[topic] = found?.percentage || 0;
          });
          return row;
        });

        // Find rising and falling topics
        const topicChanges = topTopics.map((topic) => {
          const values = timeline.yearData.map(
            (yd) => yd.topics.find((t) => t.topic === topic)?.percentage || 0
          );
          const first = values[0] || 0;
          const last = values[values.length - 1] || 0;
          return { topic, change: last - first, trend: last > first ? "up" : last < first ? "down" : "stable" };
        });

        const rising = topicChanges.filter((t) => t.trend === "up").slice(0, 3);
        const falling = topicChanges.filter((t) => t.trend === "down").slice(0, 3);

        return (
          <motion.div
            key={`${timeline.subject}-${timeline.semester}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold text-foreground">
                  {timeline.subject}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Semester {timeline.semester} • Topic weightage over time
                </p>
              </div>
            </div>

            {/* Timeline Chart */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base">Topic Weightage Timeline</CardTitle>
                <CardDescription>
                  How topic importance changed year by year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, ""]}
                      />
                      <Legend />
                      {topTopics.map((topic, i) => (
                        <Line
                          key={topic}
                          type="monotone"
                          dataKey={topic}
                          stroke={LINE_COLORS[i % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={{ fill: LINE_COLORS[i % LINE_COLORS.length], r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Rising & Falling Topics */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    Rising Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rising.length > 0 ? (
                    <div className="space-y-2">
                      {rising.map((t) => (
                        <div
                          key={t.topic}
                          className="flex items-center justify-between p-2 rounded-lg bg-background"
                        >
                          <span className="text-sm font-medium">{t.topic}</span>
                          <Badge variant="outline" className="text-green-600 border-green-500/30">
                            +{t.change.toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rising topics detected</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-600">
                    <TrendingDown className="w-4 h-4" />
                    Declining Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {falling.length > 0 ? (
                    <div className="space-y-2">
                      {falling.map((t) => (
                        <div
                          key={t.topic}
                          className="flex items-center justify-between p-2 rounded-lg bg-background"
                        >
                          <span className="text-sm font-medium">{t.topic}</span>
                          <Badge variant="outline" className="text-red-600 border-red-500/30">
                            {t.change.toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No declining topics detected</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
