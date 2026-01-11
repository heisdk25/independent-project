import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, HelpCircle, CreditCard, GitBranch, ListChecks } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FileUpload } from "@/components/upload/FileUpload";
import { Quiz } from "@/components/quiz/Quiz";
import { Flashcards } from "@/components/quiz/Flashcards";
import { MermaidDiagram } from "@/components/mermaid/MermaidDiagram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";

const sampleQuestions = [
  {
    id: "1",
    question: "What is the primary function of mitochondria in a cell?",
    type: "mcq" as const,
    options: [
      "Protein synthesis",
      "Energy production (ATP)",
      "Cell division",
      "Waste removal",
    ],
    correctAnswer: "Energy production (ATP)",
  },
  {
    id: "2",
    question: "Which process converts glucose to pyruvate?",
    type: "mcq" as const,
    options: ["Glycolysis", "Krebs cycle", "Oxidative phosphorylation", "Fermentation"],
    correctAnswer: "Glycolysis",
  },
  {
    id: "3",
    question: "Name the organelle responsible for photosynthesis.",
    type: "short" as const,
    correctAnswer: "Chloroplast",
  },
];

const sampleFlashcards = [
  {
    id: "1",
    question: "What is Osmosis?",
    answer: "The movement of water molecules from a region of high water concentration to a region of low water concentration through a selectively permeable membrane.",
  },
  {
    id: "2",
    question: "Define Homeostasis",
    answer: "The maintenance of a constant internal environment in living organisms despite changes in external conditions.",
  },
  {
    id: "3",
    question: "What is ATP?",
    answer: "Adenosine Triphosphate - the primary energy currency of the cell, used to power cellular processes.",
  },
];

const conceptFlowchart = `flowchart TD
    A[Cell Biology] --> B[Cell Structure]
    A --> C[Cell Function]
    B --> D[Organelles]
    B --> E[Cell Membrane]
    C --> F[Metabolism]
    C --> G[Cell Division]
    D --> H[Mitochondria]
    D --> I[Nucleus]
    F --> J[Respiration]
    F --> K[Photosynthesis]
`;

const NotesPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isGenerating, setIsGenerating] = useState(false);
  const { documents, uploadDocument, isLoading: isUploading } = useDocuments("notes");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab("quiz");
    }, 1500);
  };

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
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 shadow-card">
              <Brain className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Exam Notes Assistant
            </h1>
            <p className="text-lg text-muted-foreground">
              Transform your study notes into quizzes, flashcards, and concept maps for effective revision.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">Flashcards</span>
                </TabsTrigger>
                <TabsTrigger value="concepts" className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">Concepts</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Upload Your Study Notes</CardTitle>
                      <CardDescription>
                        Upload PDFs, images, or documents of your notes to generate study materials
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FileUpload onUpload={uploadDocument} isUploading={isUploading} />
                      {documents.length > 0 && (
                        <div className="flex flex-wrap gap-4">
                          <Button variant="hero" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Quiz & Flashcards"}
                          </Button>
                          <Button variant="hero-outline" onClick={() => setActiveTab("concepts")}>
                            Create Concept Map
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="quiz">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <Quiz
                    questions={sampleQuestions}
                    title="Cell Biology Quiz"
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="flashcards">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl mx-auto"
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Study Flashcards</CardTitle>
                      <CardDescription>
                        Click to flip • Use arrows to navigate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Flashcards cards={sampleFlashcards} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="concepts">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Concept Map</CardTitle>
                      <CardDescription>
                        Visual representation of key concepts and their relationships
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MermaidDiagram chart={conceptFlowchart} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="summary">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Exam-Oriented Summary</CardTitle>
                      <CardDescription>
                        Key points and important concepts for exam preparation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <h4 className="font-display font-semibold text-foreground mb-2">
                            Important Topics
                          </h4>
                          <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                              Cell structure and organelle functions
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                              ATP synthesis and cellular respiration
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                              Membrane transport mechanisms
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                          <h4 className="font-display font-semibold text-foreground mb-2">
                            Key Definitions
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-foreground">Mitochondria:</span>
                              <span className="text-muted-foreground"> The powerhouse of the cell, responsible for ATP production through cellular respiration.</span>
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Osmosis:</span>
                              <span className="text-muted-foreground"> Passive movement of water across a semi-permeable membrane.</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground italic text-center">
                          Upload your notes to generate a personalized exam summary
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
