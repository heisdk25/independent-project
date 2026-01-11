import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed file types and categories
const ALLOWED_CATEGORIES = ["research", "notes", "pyq", "general"] as const;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const categoryInput = formData.get("category") as string || "general";
    
    // PYQ metadata
    const subject = formData.get("subject") as string | null;
    const semesterStr = formData.get("semester") as string | null;
    const academicYear = formData.get("academic_year") as string | null;
    const semester = semesterStr ? parseInt(semesterStr, 10) : null;

    // Validate file
    if (!file) {
      return new Response(
        JSON.stringify({ error: "File is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 50MB limit" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    const fileType = file.type || "application/octet-stream";
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isAllowedType = ALLOWED_FILE_TYPES.includes(fileType) || 
                          ["pdf", "txt", "doc", "docx", "png", "jpg", "jpeg", "webp", "md"].includes(fileExt || "");
    
    if (!isAllowedType) {
      return new Response(
        JSON.stringify({ error: "File type not allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate category
    const category = ALLOWED_CATEGORIES.includes(categoryInput as any) ? categoryInput : "general";

    // Use service role for storage and database operations
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Generate unique file path using user ID
    const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload file to storage
    const { error: uploadError } = await serviceClient.storage
      .from("documents")
      .upload(filePath, file, {
        contentType: fileType,
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
    
    if (fileType === "text/plain" || fileExt === "txt" || fileExt === "md") {
      extractedText = await file.text();
      // Limit extracted text length
      if (extractedText.length > 100000) {
        extractedText = extractedText.substring(0, 100000) + "\n[Content truncated...]";
      }
    } else if (fileType === "application/pdf" || fileExt === "pdf") {
      extractedText = `[PDF Document: ${file.name}] - Content will be analyzed by AI`;
    } else if (fileType.startsWith("image/")) {
      extractedText = `[Image: ${file.name}] - Visual content will be analyzed by AI`;
    } else if (fileExt === "docx" || fileExt === "doc") {
      extractedText = `[Word Document: ${file.name}] - Content will be analyzed by AI`;
    }

    // Store document metadata in database
    const insertData: Record<string, unknown> = {
      filename: file.name.substring(0, 255), // Limit filename length
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      extracted_text: extractedText,
      category: category,
      session_id: userId, // Keep for backwards compatibility
      user_id: userId,
    };

    // Add PYQ metadata if provided
    if (subject) insertData.subject = subject;
    if (semester) insertData.semester = semester;
    if (academicYear) insertData.academic_year = academicYear;

    const { data: docData, error: dbError } = await serviceClient
      .from("documents")
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Clean up uploaded file
      await serviceClient.storage.from("documents").remove([filePath]);
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
