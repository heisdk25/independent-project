import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Target, BookOpen } from "lucide-react";

interface Prediction {
  topic: string;
  probability: number;
}

interface SubjectPrediction {
  subject: string;
  semester: number;
  predictions: {
    ct1: Prediction[];
    ct2: Prediction[];
    endsem: Prediction[];
  };
  studyRecommendation: string;
}

interface PredictionsPanelProps {
  predictions: SubjectPrediction[];
}

type ExamType = "ct1" | "ct2" | "endsem";

export const PredictionsPanel = ({ predictions }: PredictionsPanelProps) => {
  const [selectedExam, setSelectedExam] = useState<ExamType>("endsem");
  const [selectedSubject, setSelectedSubject] = useState<string>(
    predictions[0]?.subject || ""
  );

  if (predictions.length === 0) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No predictions yet. Upload PYQs and run analysis first.
          </p>
        </CardContent>
      </Card>
    );
  }

  const subjects = [...new Set(predictions.map((p) => p.subject))];
  const currentPrediction = predictions.find((p) => p.subject === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-4 py-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Disclaimer</p>
            <p className="text-sm text-muted-foreground">
              These predictions are based on historical trends and pattern analysis.
              They are not guaranteed and should be used as a supplementary study guide.
              Always prepare all syllabus topics comprehensively.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ct1", "ct2", "endsem"] as const).map((exam) => (
            <Button
              key={exam}
              variant={selectedExam === exam ? "hero" : "outline"}
              size="sm"
              onClick={() => setSelectedExam(exam)}
            >
              {exam === "ct1" && "CT-1"}
              {exam === "ct2" && "CT-2"}
              {exam === "endsem" && "End Semester"}
            </Button>
          ))}
        </div>
      </div>

      {/* Predictions */}
      {currentPrediction && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              High-Probability Topics for {selectedSubject}
              <Badge variant="secondary" className="ml-2">
                {selectedExam === "ct1" && "CT-1"}
                {selectedExam === "ct2" && "CT-2"}
                {selectedExam === "endsem" && "End Semester"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Semester {currentPrediction.semester} • Topics most likely to appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentPrediction.predictions[selectedExam].map((prediction, index) => (
                <motion.div
                  key={prediction.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "gradient-primary text-primary-foreground"
                        : index === 1
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{prediction.topic}</span>
                      <span
                        className={`text-sm font-semibold ${
                          prediction.probability >= 85
                            ? "text-primary"
                            : prediction.probability >= 75
                            ? "text-secondary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {prediction.probability}% likely
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prediction.probability}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                        className={`h-full ${
                          prediction.probability >= 85
                            ? "gradient-primary"
                            : prediction.probability >= 75
                            ? "bg-secondary"
                            : "bg-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Recommendation */}
      {currentPrediction?.studyRecommendation && (
        <Card variant="elevated" className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <h4 className="font-display font-semibold text-foreground mb-3">
              📚 Study Recommendation for {selectedSubject}
            </h4>
            <p className="text-muted-foreground">{currentPrediction.studyRecommendation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
