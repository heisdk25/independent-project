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
    const { messages, sessionId, category } = await req.json();
    
    if (!messages || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Messages and sessionId are required" }),
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
    let query = supabase
      .from("documents")
      .select("filename, extracted_text, file_type, category")
      .eq("session_id", sessionId);

    if (category && category !== "general") {
      query = query.eq("category", category);
    }

    const { data: documents, error: dbError } = await query;

    if (dbError) {
      console.error("Database error:", dbError);
    }

    // Build context from uploaded documents
    let documentContext = "";
    if (documents && documents.length > 0) {
      documentContext = "\n\n---UPLOADED DOCUMENTS---\n";
      documents.forEach((doc, index) => {
        documentContext += `\n[Document ${index + 1}: ${doc.filename}]\n`;
        documentContext += doc.extracted_text || "[No text extracted yet]";
        documentContext += "\n";
      });
      documentContext += "\n---END OF DOCUMENTS---\n";
    }

    // Build system prompt based on category
    let systemPrompt = "";
    
    if (category === "research") {
      systemPrompt = `You are an expert research paper analyst. Your role is to help students understand, summarize, and analyze academic research papers.

When analyzing research papers:
1. Identify the research question, hypothesis, and objectives
2. Summarize the methodology clearly
3. Extract key findings and conclusions
4. Explain complex concepts in simple terms
5. Generate Mermaid.js flowcharts for methodology when asked

IMPORTANT: You must ONLY answer questions based on the uploaded documents. If the user asks something not covered in the documents, politely explain that you can only answer based on the uploaded content.

${documentContext}

If no documents are uploaded, ask the user to upload their research papers first.`;

    } else if (category === "notes") {
      systemPrompt = `You are an expert exam preparation assistant. Your role is to help students study effectively from their notes.

When helping with exam preparation:
1. Generate quiz questions (MCQ and short answer) from the content
2. Create concise flashcards with questions and answers
3. Summarize key concepts for quick revision
4. Generate concept maps using Mermaid.js syntax
5. Highlight important topics likely to appear in exams

IMPORTANT: You must ONLY use information from the uploaded notes. Do not add external information.

${documentContext}

If no documents are uploaded, ask the user to upload their study notes first.`;

    } else if (category === "pyq") {
      systemPrompt = `You are an expert exam analyst specializing in predicting exam topics from Previous Year Questions (PYQs).

When analyzing PYQs:
1. Identify recurring topics and their frequency
2. Calculate topic weightage percentages
3. Predict high-probability topics for upcoming exams
4. Categorize topics by exam type (CT-1, CT-2, End Semester)
5. Provide study recommendations based on trends

IMPORTANT DISCLAIMER: Your predictions are based on historical trends and pattern analysis. They are not guaranteed and should be used as a supplementary study guide.

IMPORTANT: You must ONLY analyze the uploaded question papers. Do not make predictions without actual PYQ data.

${documentContext}

If no documents are uploaded, ask the user to upload their previous year question papers first.`;

    } else {
      systemPrompt = `You are StudyAI, an intelligent study assistant for students. You help with research paper analysis, exam preparation, and question paper analysis.

IMPORTANT: You can only answer questions based on uploaded documents. If no documents are provided or the question is not related to the uploaded content, politely ask the user to upload relevant documents.

${documentContext}

If no documents are uploaded, explain your capabilities and ask the user to upload their study materials.`;
    }

    // Call Lovable AI with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
