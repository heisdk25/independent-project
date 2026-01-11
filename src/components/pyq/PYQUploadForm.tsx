import { useState } from "react";
import { FileUpload } from "@/components/upload/FileUpload";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, BookOpen } from "lucide-react";

interface PYQMetadata {
  subject: string;
  semester: number;
  academicYear: string;
}

interface PYQUploadFormProps {
  onUpload: (file: File, metadata: PYQMetadata) => Promise<void>;
  isUploading: boolean;
  uploadedDocs: Array<{
    id: string;
    filename: string;
    subject?: string | null;
    semester?: number | null;
    academic_year?: string | null;
  }>;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => `${currentYear - i}-${currentYear - i + 1}`);
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export const PYQUploadForm = ({ onUpload, isUploading, uploadedDocs }: PYQUploadFormProps) => {
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState("");

  const handleUpload = async (file: File) => {
    if (!subject || !semester || !academicYear) {
      return;
    }
    await onUpload(file, { subject, semester, academicYear });
  };

  const isFormValid = subject && semester && academicYear;

  // Group documents by subject
  const groupedDocs = uploadedDocs.reduce((acc, doc) => {
    const key = doc.subject || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, typeof uploadedDocs>);

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Upload Previous Year Questions
          </CardTitle>
          <CardDescription>
            Add subject details before uploading for better analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metadata Form */}
          <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50 border">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Name *</Label>
              <Input
                id="subject"
                placeholder="e.g., Physics, Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select
                value={semester?.toString() || ""}
                onValueChange={(val) => setSemester(parseInt(val))}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year *</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload Area */}
          <div className={!isFormValid ? "opacity-50 pointer-events-none" : ""}>
            {!isFormValid && (
              <p className="text-sm text-muted-foreground mb-2">
                ↑ Fill in subject details above to enable upload
              </p>
            )}
            <FileUpload onUpload={handleUpload} isUploading={isUploading} />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {Object.keys(groupedDocs).length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Uploaded Question Papers</CardTitle>
            <CardDescription>
              {uploadedDocs.length} document{uploadedDocs.length !== 1 ? "s" : ""} ready for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(groupedDocs).map(([subjectName, docs]) => (
                <div key={subjectName} className="space-y-2">
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {subjectName}
                    <Badge variant="secondary">{docs.length}</Badge>
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2 pl-6">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <span className="truncate flex-1">{doc.filename}</span>
                        <div className="flex items-center gap-2 ml-2">
                          {doc.semester && (
                            <Badge variant="outline" className="text-xs">
                              Sem {doc.semester}
                            </Badge>
                          )}
                          {doc.academic_year && (
                            <Badge variant="outline" className="text-xs">
                              {doc.academic_year}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
