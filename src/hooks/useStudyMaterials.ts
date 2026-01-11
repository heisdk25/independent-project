import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'short';
  options?: string[];
  correctAnswer: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Summary {
  importantTopics: string[];
  keyDefinitions: { term: string; definition: string }[];
  revisionPoints: string[];
}

interface Flowchart {
  mermaidCode: string;
  title: string;
}

export const useStudyMaterials = () => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Generated content state
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [flowchart, setFlowchart] = useState<Flowchart | null>(null);

  const generateMaterials = useCallback(async (type: 'quiz' | 'flashcards' | 'summary' | 'flowchart') => {
    if (!session) {
      toast.error('Please sign in to generate study materials');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-study-materials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ type }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed');
      }

      // Store the generated content
      if (result.success && result.data) {
        switch (type) {
          case 'quiz':
            setQuiz(result.data.questions || []);
            break;
          case 'flashcards':
            setFlashcards(result.data.flashcards || []);
            break;
          case 'summary':
            setSummary(result.data);
            break;
          case 'flowchart':
            setFlowchart(result.data);
            break;
        }
      }

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);
      return result;
    } catch (err) {
      console.error('Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate materials';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const analyzePYQ = useCallback(async () => {
    if (!session) {
      toast.error('Please sign in to analyze PYQs');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-pyq`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }

      toast.success('PYQ analysis complete!');
      return result;
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze PYQ';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const clearMaterials = useCallback(() => {
    setQuiz(null);
    setFlashcards(null);
    setSummary(null);
    setFlowchart(null);
  }, []);

  return {
    isLoading,
    error,
    quiz,
    flashcards,
    summary,
    flowchart,
    generateMaterials,
    analyzePYQ,
    clearMaterials,
  };
};
