import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0ea5e9", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface SubjectAnalysis {
  subject: string;
  semester: number;
  topicFrequency: Array<{ topic: string; frequency: number; percentage: number }>;
  topicDistribution: Array<{ name: string; value: number }>;
  predictions: {
    ct1: Array<{ topic: string; probability: number }>;
    ct2: Array<{ topic: string; probability: number }>;
    endsem: Array<{ topic: string; probability: number }>;
  };
  studyRecommendation: string;
}

interface SubjectDashboardProps {
  analyses: SubjectAnalysis[];
}

export const SubjectDashboard = ({ analyses }: SubjectDashboardProps) => {
  if (analyses.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No analysis data yet. Upload PYQs and run analysis first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {analyses.map((analysis, idx) => (
        <motion.div
          key={`${analysis.subject}-${analysis.semester}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-4"
        >
          {/* Subject Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold text-foreground">
                {analysis.subject}
              </h3>
              <p className="text-sm text-muted-foreground">Semester {analysis.semester}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Topic Frequency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Topic Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.topicFrequency.slice(0, 6)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        dataKey="topic"
                        type="category"
                        width={80}
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
                      <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Topic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.topicDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {analysis.topicDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Predictions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Top Predicted Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.predictions.endsem.slice(0, 5).map((pred, i) => (
                  <Badge
                    key={pred.topic}
                    variant={i === 0 ? "default" : "secondary"}
                    className="text-sm py-1 px-3"
                  >
                    {pred.topic} ({pred.probability}%)
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Recommendation */}
          {analysis.studyRecommendation && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">
                  📚 <span className="font-medium text-foreground">Recommendation:</span>{" "}
                  {analysis.studyRecommendation}
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      ))}
    </div>
  );
};
