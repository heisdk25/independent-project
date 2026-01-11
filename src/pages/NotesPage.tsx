import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, HelpCircle, CreditCard, GitBranch, ListChecks, Loader2, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FileUpload } from "@/components/upload/FileUpload";
import { Quiz } from "@/components/quiz/Quiz";
import { Flashcards } from "@/components/quiz/Flashcards";
import { MermaidDiagram } from "@/components/mermaid/MermaidDiagram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";

const NotesPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const { documents, uploadDocument, isLoading: isUploading } = useDocuments("notes");
  const { 
    isLoading: isGenerating, 
    quiz, 
    flashcards, 
    summary, 
    flowchart,
    generateMaterials 
  } = useStudyMaterials();

  const handleGenerateQuiz = async () => {
    try {
      await generateMaterials("quiz");
      setActiveTab("quiz");
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      await generateMaterials("flashcards");
      setActiveTab("flashcards");
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleGenerateConcepts = async () => {
    try {
      await generateMaterials("flowchart");
      setActiveTab("concepts");
    } catch (err) {
      // Error already handled in hook
    }
  };

  const handleGenerateSummary = async () => {
    try {
      await generateMaterials("summary");
      setActiveTab("summary");
    } catch (err) {
      // Error already handled in hook
    }
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
                        Upload PDFs, images, or documents of your notes ({documents.length} uploaded)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FileUpload onUpload={uploadDocument} isUploading={isUploading} />
                      {documents.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          <Button variant="hero" onClick={handleGenerateQuiz} disabled={isGenerating}>
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Generate Quiz"
                            )}
                          </Button>
                          <Button variant="hero-outline" onClick={handleGenerateFlashcards} disabled={isGenerating}>
                            Generate Flashcards
                          </Button>
                          <Button variant="hero-outline" onClick={handleGenerateConcepts} disabled={isGenerating}>
                            Create Concept Map
                          </Button>
                          <Button variant="hero-outline" onClick={handleGenerateSummary} disabled={isGenerating}>
                            Generate Summary
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
                  {quiz && quiz.length > 0 ? (
                    <div className="space-y-4">
                      <Quiz questions={quiz} title="Quiz from Your Notes" />
                      <div className="text-center">
                        <Button 
                          variant="outline" 
                          onClick={handleGenerateQuiz} 
                          disabled={isGenerating}
                          className="gap-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          Generate New Quiz
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Card variant="elevated">
                      <CardContent className="py-12">
                        <div className="text-center space-y-4">
                          <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">No Quiz Generated Yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Upload your notes and generate a quiz to test your knowledge.
                            </p>
                            {documents.length > 0 ? (
                              <Button variant="hero" onClick={handleGenerateQuiz} disabled={isGenerating}>
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  "Generate Quiz"
                                )}
                              </Button>
                            ) : (
                              <Button variant="hero-outline" onClick={() => setActiveTab("upload")}>
                                Upload Notes First
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="flashcards">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl mx-auto"
                >
                  {flashcards && flashcards.length > 0 ? (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Study Flashcards</CardTitle>
                        <CardDescription>
                          Click to flip • Use arrows to navigate
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Flashcards cards={flashcards} />
                        <div className="text-center pt-4">
                          <Button 
                            variant="outline" 
                            onClick={handleGenerateFlashcards} 
                            disabled={isGenerating}
                            className="gap-2"
                          >
                            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            Generate New Flashcards
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="elevated">
                      <CardContent className="py-12">
                        <div className="text-center space-y-4">
                          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">No Flashcards Yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Generate flashcards from your uploaded notes.
                            </p>
                            {documents.length > 0 ? (
                              <Button variant="hero" onClick={handleGenerateFlashcards} disabled={isGenerating}>
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  "Generate Flashcards"
                                )}
                              </Button>
                            ) : (
                              <Button variant="hero-outline" onClick={() => setActiveTab("upload")}>
                                Upload Notes First
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="concepts">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {flowchart ? (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>{flowchart.title || "Concept Map"}</CardTitle>
                        <CardDescription>
                          Visual representation of key concepts and their relationships
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <MermaidDiagram chart={flowchart.mermaidCode} />
                        <div className="text-center pt-4">
                          <Button 
                            variant="outline" 
                            onClick={handleGenerateConcepts} 
                            disabled={isGenerating}
                            className="gap-2"
                          >
                            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                            Generate New Concept Map
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="elevated">
                      <CardContent className="py-12">
                        <div className="text-center space-y-4">
                          <GitBranch className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">No Concept Map Yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Generate a visual concept map from your notes.
                            </p>
                            {documents.length > 0 ? (
                              <Button variant="hero" onClick={handleGenerateConcepts} disabled={isGenerating}>
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  "Create Concept Map"
                                )}
                              </Button>
                            ) : (
                              <Button variant="hero-outline" onClick={() => setActiveTab("upload")}>
                                Upload Notes First
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="summary">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {summary ? (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle>Exam-Oriented Summary</CardTitle>
                        <CardDescription>
                          Key points and important concepts for exam preparation
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {summary.importantTopics && summary.importantTopics.length > 0 && (
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                              <h4 className="font-display font-semibold text-foreground mb-2">
                                Important Topics
                              </h4>
                              <ul className="space-y-2 text-muted-foreground">
                                {summary.importantTopics.map((topic, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                    {topic}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {summary.keyDefinitions && summary.keyDefinitions.length > 0 && (
                            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                              <h4 className="font-display font-semibold text-foreground mb-2">
                                Key Definitions
                              </h4>
                              <div className="space-y-3 text-sm">
                                {summary.keyDefinitions.map((def, i) => (
                                  <div key={i}>
                                    <span className="font-medium text-foreground">{def.term}:</span>
                                    <span className="text-muted-foreground"> {def.definition}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {summary.revisionPoints && summary.revisionPoints.length > 0 && (
                            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                              <h4 className="font-display font-semibold text-foreground mb-2">
                                Quick Revision Points
                              </h4>
                              <ul className="space-y-2 text-muted-foreground text-sm">
                                {summary.revisionPoints.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="font-medium text-accent shrink-0">{i + 1}.</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="text-center pt-4">
                            <Button 
                              variant="outline" 
                              onClick={handleGenerateSummary} 
                              disabled={isGenerating}
                              className="gap-2"
                            >
                              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                              Generate New Summary
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card variant="elevated">
                      <CardContent className="py-12">
                        <div className="text-center space-y-4">
                          <ListChecks className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <h3 className="font-semibold text-foreground mb-2">No Summary Yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Generate an exam-oriented summary from your notes.
                            </p>
                            {documents.length > 0 ? (
                              <Button variant="hero" onClick={handleGenerateSummary} disabled={isGenerating}>
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  "Generate Summary"
                                )}
                              </Button>
                            ) : (
                              <Button variant="hero-outline" onClick={() => setActiveTab("upload")}>
                                Upload Notes First
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
