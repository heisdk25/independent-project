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
    // Validate authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Validate JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID not found in token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use service role for database operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch PYQ documents for this user with metadata
    const { data: documents, error: dbError } = await serviceClient
      .from("documents")
      .select("filename, extracted_text, file_type, subject, semester, academic_year")
      .eq("user_id", userId)
      .eq("category", "pyq");

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch documents" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ error: "No PYQ documents found. Please upload previous year question papers first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group documents by subject and semester
    const groupedDocs = documents.reduce((acc, doc) => {
      const key = `${doc.subject || 'Unknown'}_${doc.semester || 0}`;
      if (!acc[key]) {
        acc[key] = {
          subject: doc.subject || 'Unknown Subject',
          semester: doc.semester || 1,
          documents: [],
          years: new Set<string>()
        };
      }
      acc[key].documents.push(doc);
      if (doc.academic_year) {
        acc[key].years.add(doc.academic_year);
      }
      return acc;
    }, {} as Record<string, { subject: string; semester: number; documents: typeof documents; years: Set<string> }>);

    // Build context with subject/semester/year info
    let documentContext = "";
    for (const [, group] of Object.entries(groupedDocs)) {
      documentContext += `\n\n=== SUBJECT: ${group.subject} | SEMESTER: ${group.semester} ===\n`;
      for (const doc of group.documents) {
        documentContext += `\n[Year: ${doc.academic_year || 'Unknown'} | File: ${doc.filename}]\n`;
        documentContext += (doc.extracted_text || "").substring(0, 15000);
      }
    }

    if (documentContext.length > 60000) {
      documentContext = documentContext.substring(0, 60000) + "\n[Content truncated...]";
    }

    const subjectList = Object.values(groupedDocs).map(g => `${g.subject} (Sem ${g.semester})`).join(", ");

    const prompt = `Analyze the following Previous Year Question papers organized by subject, semester, and year.

SUBJECTS FOUND: ${subjectList}

For EACH subject-semester combination, provide:
1. Topic Frequency Analysis - List each topic and how many times it appeared
2. Topic Distribution - Calculate percentage weightage of topic areas
3. Year-over-year comparison - How topics changed across years
4. Predictions for upcoming exams:
   - CT-1: top 3 predicted topics with probability
   - CT-2: top 3 predicted topics with probability  
   - End Semester: top 5 predicted topics with probability
5. Personalized study recommendation for each subject

PREVIOUS YEAR QUESTIONS:
${documentContext}

IMPORTANT: 
- Analyze EACH subject separately
- Include year-by-year data for comparative analysis
- Base predictions on historical patterns within each subject
- Provide specific, actionable study recommendations`;

    // Call Lovable AI with structured output
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
            content: `You are an expert exam analyst helping university students prepare for exams by analyzing Previous Year Questions (PYQs).

You understand Indian university exam patterns including CT-1, CT-2, and End Semester exams. Provide practical, actionable insights.

DISCLAIMER: All predictions are based on historical trends. Always prepare all syllabus topics comprehensively.` 
          },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_pyq_comprehensive",
              description: "Comprehensive PYQ analysis with subject-wise breakdown",
              parameters: {
                type: "object",
                properties: {
                  subjectAnalyses: {
                    type: "array",
                    description: "Analysis for each subject-semester combination",
                    items: {
                      type: "object",
                      properties: {
                        subject: { type: "string" },
                        semester: { type: "number" },
                        topicFrequency: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              topic: { type: "string" },
                              frequency: { type: "number" },
                              percentage: { type: "number" }
                            },
                            required: ["topic", "frequency", "percentage"]
                          }
                        },
                        topicDistribution: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              value: { type: "number" }
                            },
                            required: ["name", "value"]
                          }
                        },
                        predictions: {
                          type: "object",
                          properties: {
                            ct1: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  topic: { type: "string" },
                                  probability: { type: "number" }
                                },
                                required: ["topic", "probability"]
                              }
                            },
                            ct2: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  topic: { type: "string" },
                                  probability: { type: "number" }
                                },
                                required: ["topic", "probability"]
                              }
                            },
                            endsem: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  topic: { type: "string" },
                                  probability: { type: "number" }
                                },
                                required: ["topic", "probability"]
                              }
                            }
                          },
                          required: ["ct1", "ct2", "endsem"]
                        },
                        studyRecommendation: { type: "string" }
                      },
                      required: ["subject", "semester", "topicFrequency", "topicDistribution", "predictions", "studyRecommendation"]
                    }
                  },
                  comparisons: {
                    type: "array",
                    description: "Year-over-year comparison for each subject",
                    items: {
                      type: "object",
                      properties: {
                        subject: { type: "string" },
                        semester: { type: "number" },
                        yearData: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              year: { type: "string" },
                              topics: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    topic: { type: "string" },
                                    frequency: { type: "number" },
                                    percentage: { type: "number" }
                                  },
                                  required: ["topic", "frequency", "percentage"]
                                }
                              }
                            },
                            required: ["year", "topics"]
                          }
                        }
                      },
                      required: ["subject", "semester", "yearData"]
                    }
                  },
                  timelines: {
                    type: "array",
                    description: "Timeline data for trend visualization",
                    items: {
                      type: "object",
                      properties: {
                        subject: { type: "string" },
                        semester: { type: "number" },
                        yearData: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              year: { type: "string" },
                              topics: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    topic: { type: "string" },
                                    frequency: { type: "number" },
                                    percentage: { type: "number" }
                                  },
                                  required: ["topic", "frequency", "percentage"]
                                }
                              }
                            },
                            required: ["year", "topics"]
                          }
                        }
                      },
                      required: ["subject", "semester", "yearData"]
                    }
                  }
                },
                required: ["subjectAnalyses", "comparisons", "timelines"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_pyq_comprehensive" } }
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
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({ error: "Failed to generate analysis" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("analyze error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
