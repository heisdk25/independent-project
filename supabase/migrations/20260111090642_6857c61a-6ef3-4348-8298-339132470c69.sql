-- Add subject, semester, and year columns to documents table for PYQ organization
ALTER TABLE public.documents
ADD COLUMN subject TEXT,
ADD COLUMN semester INTEGER CHECK (semester >= 1 AND semester <= 8),
ADD COLUMN academic_year TEXT;

-- Create index for efficient querying by subject/semester/year
CREATE INDEX idx_documents_pyq_metadata ON public.documents (user_id, category, subject, semester, academic_year)
WHERE category = 'pyq';