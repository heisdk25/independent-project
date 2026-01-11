import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: string;
  extracted_text: string | null;
  created_at: string;
  subject?: string | null;
  semester?: number | null;
  academic_year?: string | null;
}

interface PYQMetadata {
  subject: string;
  semester: number;
  academicYear: string;
}

export const useDocuments = (category: string = 'general') => {
  const { user, session } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  }, [user, category]);

  const uploadDocument = useCallback(async (file: File, metadata?: PYQMetadata) => {
    if (!user || !session) {
      toast.error('Please sign in to upload documents');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      // Add PYQ metadata if provided
      if (metadata) {
        formData.append('subject', metadata.subject);
        formData.append('semester', metadata.semester.toString());
        formData.append('academic_year', metadata.academicYear);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-document`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      toast.success(`${file.name} uploaded successfully`);
      await fetchDocuments();
      return result.document;
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, session, category, fetchDocuments]);

  const deleteDocument = useCallback(async (documentId: string, filePath?: string) => {
    if (!user) return;

    try {
      // Delete from storage if path provided
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Document deleted');
      await fetchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    }
  }, [user, fetchDocuments]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
};
