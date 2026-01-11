import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Upload, BarChart3, Target, Loader2, GitCompare, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { usePYQAnalysis } from "@/hooks/usePYQAnalysis";
import { PYQUploadForm } from "@/components/pyq/PYQUploadForm";
import { SubjectDashboard } from "@/components/pyq/SubjectDashboard";
import { ComparativeView } from "@/components/pyq/ComparativeView";
import { TimelineView } from "@/components/pyq/TimelineView";
import { PredictionsPanel } from "@/components/pyq/PredictionsPanel";

const PYQPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const { documents, uploadDocument, isLoading: isUploading } = useDocuments("pyq");
  const { analysis, isAnalyzing, analyzeDocuments } = usePYQAnalysis();

  const handleUpload = async (file: File, metadata: { subject: string; semester: number; academicYear: string }) => {
    await uploadDocument(file, metadata);
  };

  const handleAnalyze = async () => {
    await analyzeDocuments();
    setActiveTab("dashboard");
  };

  const subjectAnalyses = analysis?.subjectAnalyses || [];
  const comparisons = analysis?.comparisons || [];
  const timelines = analysis?.timelines || [];
  const predictions = subjectAnalyses.map((a) => ({
    subject: a.subject,
    semester: a.semester,
    predictions: a.predictions,
    studyRecommendation: a.studyRecommendation,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6 shadow-card">
              <TrendingUp className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              PYQ Analysis & Prediction
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload previous year question papers by subject, semester & year for comprehensive exam preparation insights.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="flex items-center gap-2" disabled={!analysis}>
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex items-center gap-2" disabled={!analysis}>
                  <GitCompare className="w-4 h-4" />
                  <span className="hidden sm:inline">Compare</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2" disabled={!analysis}>
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
                <TabsTrigger value="predictions" className="flex items-center gap-2" disabled={!analysis}>
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Predict</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <PYQUploadForm
                    onUpload={handleUpload}
                    isUploading={isUploading}
                    uploadedDocs={documents}
                  />

                  {documents.length > 0 && (
                    <div className="flex justify-center">
                      <Button
                        variant="hero"
                        size="lg"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing {documents.length} Document{documents.length > 1 ? "s" : ""}...
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Analyze {documents.length} Document{documents.length > 1 ? "s" : ""}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="dashboard">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <SubjectDashboard analyses={subjectAnalyses} />
                </motion.div>
              </TabsContent>

              <TabsContent value="compare">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ComparativeView comparisons={comparisons} />
                </motion.div>
              </TabsContent>

              <TabsContent value="timeline">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TimelineView timelines={timelines} />
                </motion.div>
              </TabsContent>

              <TabsContent value="predictions">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <PredictionsPanel predictions={predictions} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PYQPage;
