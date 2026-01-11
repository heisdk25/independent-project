import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, type } = await req.json();
    
    if (!sessionId || !type) {
      return new Response(
        JSON.stringify({ error: "sessionId and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch documents for this session
    const { data: documents, error: dbError } = await supabase
      .from("documents")
      .select("filename, extracted_text, file_type")
      .eq("session_id", sessionId)
      .eq("category", "notes");

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch documents" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No documents found. Please upload study notes first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from documents
    let documentContext = documents.map((doc, i) => 
      `[Document ${i + 1}: ${doc.filename}]\n${doc.extracted_text || ""}`
    ).join("\n\n");

    let prompt = "";
    let toolConfig: any = null;

    if (type === "quiz") {
      prompt = `Based on the following study notes, generate 5 quiz questions. Mix MCQ (multiple choice) and short answer questions. Make them challenging but fair for exam preparation.

STUDY NOTES:
${documentContext}

Generate questions that test understanding of key concepts.`;

      toolConfig = {
        tools: [
          {
            type: "function",
            function: {
              name: "generate_quiz",
              description: "Generate quiz questions from study notes",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        question: { type: "string" },
                        type: { type: "string", enum: ["mcq", "short"] },
                        options: { 
                          type: "array", 
                          items: { type: "string" },
                          description: "Only for MCQ type questions"
                        },
                        correctAnswer: { type: "string" }
                      },
                      required: ["id", "question", "type", "correctAnswer"]
                    }
                  }
                },
                required: ["questions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_quiz" } }
      };
    } else if (type === "flashcards") {
      prompt = `Based on the following study notes, generate 8 flashcards for effective revision. Each flashcard should have a question on one side and a concise answer on the other.

STUDY NOTES:
${documentContext}

Focus on key definitions, concepts, and important facts.`;

      toolConfig = {
        tools: [
          {
            type: "function",
            function: {
              name: "generate_flashcards",
              description: "Generate flashcards from study notes",
              parameters: {
                type: "object",
                properties: {
                  flashcards: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        question: { type: "string" },
                        answer: { type: "string" }
                      },
                      required: ["id", "question", "answer"]
                    }
                  }
                },
                required: ["flashcards"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_flashcards" } }
      };
    } else if (type === "summary") {
      prompt = `Based on the following study notes, create an exam-oriented summary. Include:
1. Important Topics (bullet points)
2. Key Definitions (term: definition format)
3. Quick revision points

STUDY NOTES:
${documentContext}

Focus on what's most likely to appear in exams.`;

      toolConfig = {
        tools: [
          {
            type: "function",
            function: {
              name: "generate_summary",
              description: "Generate exam-oriented summary from study notes",
              parameters: {
                type: "object",
                properties: {
                  importantTopics: {
                    type: "array",
                    items: { type: "string" }
                  },
                  keyDefinitions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term: { type: "string" },
                        definition: { type: "string" }
                      },
                      required: ["term", "definition"]
                    }
                  },
                  revisionPoints: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["importantTopics", "keyDefinitions", "revisionPoints"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_summary" } }
      };
    } else if (type === "flowchart") {
      prompt = `Based on the following study notes, create a concept map in Mermaid.js flowchart syntax. Show relationships between main concepts.

STUDY NOTES:
${documentContext}

Return ONLY valid Mermaid.js flowchart syntax starting with "flowchart TD".`;

      toolConfig = {
        tools: [
          {
            type: "function",
            function: {
              name: "generate_flowchart",
              description: "Generate Mermaid.js concept map from study notes",
              parameters: {
                type: "object",
                properties: {
                  mermaidCode: { 
                    type: "string",
                    description: "Valid Mermaid.js flowchart code" 
                  },
                  title: { type: "string" }
                },
                required: ["mermaidCode", "title"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_flowchart" } }
      };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type. Use: quiz, flashcards, summary, or flowchart" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "You are an expert exam preparation assistant. Generate high-quality study materials based on the provided notes." 
          },
          { role: "user", content: prompt }
        ],
        ...toolConfig
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    
    // Extract the function call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ success: true, type, data: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback to message content if no tool call
    const content = aiResponse.choices?.[0]?.message?.content;
    return new Response(
      JSON.stringify({ success: true, type, content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
