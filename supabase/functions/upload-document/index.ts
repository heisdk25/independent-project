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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "general";
    const sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return new Response(
        JSON.stringify({ error: "File and sessionId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate unique file path
    const fileExt = file.name.split(".").pop();
    const filePath = `${sessionId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ error: "Failed to upload file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text based on file type
    let extractedText = "";
    
    // For text-based files, extract content
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      extractedText = await file.text();
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // For PDF files, we'll use AI to extract content later
      extractedText = `[PDF Document: ${file.name}] - Content will be analyzed by AI`;
    } else if (file.type.startsWith("image/")) {
      // For images, mark for OCR processing
      extractedText = `[Image: ${file.name}] - Visual content will be analyzed by AI`;
    } else if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
      extractedText = `[Word Document: ${file.name}] - Content will be analyzed by AI`;
    }

    // Store document metadata in database
    const { data: docData, error: dbError } = await supabase
      .from("documents")
      .insert({
        filename: file.name,
        file_path: filePath,
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        extracted_text: extractedText,
        category: category,
        session_id: sessionId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save document metadata" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: docData,
        message: "Document uploaded successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
