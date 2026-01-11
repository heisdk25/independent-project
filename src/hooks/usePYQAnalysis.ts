import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TopicFrequency {
  topic: string;
  frequency: number;
  percentage: number;
}

interface TopicDistribution {
  name: string;
  value: number;
}

interface Prediction {
  topic: string;
  probability: number;
}

interface SubjectAnalysis {
  subject: string;
  semester: number;
  topicFrequency: TopicFrequency[];
  topicDistribution: TopicDistribution[];
  predictions: {
    ct1: Prediction[];
    ct2: Prediction[];
    endsem: Prediction[];
  };
  studyRecommendation: string;
}

interface YearData {
  year: string;
  topics: TopicFrequency[];
}

interface SubjectComparison {
  subject: string;
  semester: number;
  yearData: YearData[];
}

export interface PYQAnalysisResult {
  subjectAnalyses: SubjectAnalysis[];
  comparisons: SubjectComparison[];
  timelines: SubjectComparison[];
}

export const usePYQAnalysis = () => {
  const { session } = useAuth();
  const [analysis, setAnalysis] = useState<PYQAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDocuments = useCallback(async () => {
    if (!session?.access_token) {
      toast.error("Please sign in to analyze documents");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-pyq", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.success && data.data) {
        setAnalysis(data.data);
        toast.success("Analysis complete!");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze documents. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [session]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    analyzeDocuments,
    clearAnalysis,
  };
};
