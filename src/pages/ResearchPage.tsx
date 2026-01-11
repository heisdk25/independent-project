import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, MessageSquare, GitBranch, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { FileUpload } from "@/components/upload/FileUpload";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { MermaidDiagram } from "@/components/mermaid/MermaidDiagram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocuments } from "@/hooks/useDocuments";
import { useStudyChat } from "@/hooks/useStudyChat";

const sampleFlowchart = `flowchart TD
    A[Research Question] --> B[Literature Review]
    B --> C[Hypothesis Formation]
    C --> D[Research Design]
    D --> E{Methodology}
    E --> F[Quantitative]
    E --> G[Qualitative]
    F --> H[Data Collection]
    G --> H
    H --> I[Data Analysis]
    I --> J[Results]
    J --> K[Conclusion]
`;

const ResearchPage = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const { documents, uploadDocument, isLoading: isUploading, sessionId } = useDocuments("research");
  const { messages, isLoading: isChatLoading, sendMessage, clearMessages } = useStudyChat({ sessionId, category: "research" });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-card">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Research Paper Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload your research papers and get AI-powered insights, summaries, and methodology flowcharts.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Summary</span>
                </TabsTrigger>
                <TabsTrigger value="flowchart" className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">Flowchart</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Upload Research Papers</CardTitle>
                    <CardDescription>
                      Upload PDF, DOCX, or text files of your research papers ({documents.length} uploaded)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload onUpload={uploadDocument} isUploading={isUploading} />
                    {documents.length > 0 && (
                      <div className="mt-6">
                        <Button variant="hero" onClick={() => setActiveTab("chat")}>
                          Analyze {documents.length} Document{documents.length > 1 ? "s" : ""}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chat">
                <Card variant="elevated" className="h-[600px] overflow-hidden">
                  <ChatInterface
                    messages={messages}
                    isLoading={isChatLoading}
                    onSendMessage={sendMessage}
                    onClear={clearMessages}
                    placeholder="Ask about your research papers..."
                    emptyStateTitle="Research Assistant"
                    emptyStateDescription="Upload research papers first, then ask questions. I'll only answer based on your uploaded content."
                    className="h-full"
                  />
                </Card>
              </TabsContent>

              <TabsContent value="summary">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Research Summary</CardTitle>
                    <CardDescription>Ask the AI to summarize your papers in the chat</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 rounded-xl bg-muted/50 border border-dashed text-center">
                      <p className="text-muted-foreground">
                        Use the Chat tab to ask for summaries, key findings, or methodology breakdowns.
                      </p>
                      <Button variant="hero-outline" className="mt-4" onClick={() => setActiveTab("chat")}>
                        Go to Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="flowchart">
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Methodology Flowchart</CardTitle>
                    <CardDescription>Sample research methodology visualization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MermaidDiagram chart={sampleFlowchart} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResearchPage;
