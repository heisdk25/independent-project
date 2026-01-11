import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, FileText, Image, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
}

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  onUpload?: (file: File) => Promise<any>;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  isUploading?: boolean;
}

export const FileUpload = ({
  onFilesChange,
  onUpload,
  accept = ".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt,.md",
  multiple = true,
  maxFiles = 10,
  className,
  isUploading = false,
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const filesToProcess = Array.from(files).slice(0, maxFiles - uploadedFiles.length);
      
      for (const file of filesToProcess) {
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          progress: 0,
          status: "uploading",
        };

        setUploadedFiles((prev) => [...prev, uploadedFile]);

        try {
          if (onUpload) {
            // Real upload with backend
            await onUpload(file);
            setUploadedFiles((prev) =>
              prev.map((f) =>
                f.id === uploadedFile.id
                  ? { ...f, progress: 100, status: "complete" }
                  : f
              )
            );
            toast.success(`${file.name} uploaded successfully`);
          } else {
            // Simulate upload for demo
            let progress = 0;
            const interval = setInterval(() => {
              progress += Math.random() * 30;
              if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploadedFiles((prev) =>
                  prev.map((f) =>
                    f.id === uploadedFile.id
                      ? { ...f, progress: 100, status: "complete" }
                      : f
                  )
                );
              } else {
                setUploadedFiles((prev) =>
                  prev.map((f) =>
                    f.id === uploadedFile.id ? { ...f, progress } : f
                  )
                );
              }
            }, 200);
          }
        } catch (error) {
          console.error("Upload error:", error);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: "error" }
                : f
            )
          );
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      onFilesChange?.(filesToProcess);
    },
    [maxFiles, uploadedFiles.length, onFilesChange, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      e.target.value = ''; // Reset input
    },
    [processFiles]
  );

  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    return FileText;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <motion.div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-70"
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <motion.div
            animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-card"
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary-foreground" />
            )}
          </motion.div>
          <div>
            <p className="text-lg font-semibold font-display text-foreground">
              {isUploading ? "Uploading..." : "Drop your documents here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (PDF, DOCX, TXT, Images)
            </p>
          </div>
          <Button variant="hero-outline" size="sm" disabled={isUploading}>
            Choose Files
          </Button>
        </div>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploadedFiles.map((uploadedFile) => {
              const Icon = getFileIcon(uploadedFile.file);
              return (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg bg-card border shadow-soft",
                    uploadedFile.status === "error" && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    uploadedFile.status === "error" ? "bg-destructive/10" : "bg-primary/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      uploadedFile.status === "error" ? "text-destructive" : "text-primary"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {uploadedFile.file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {uploadedFile.status === "complete" ? (
                        <div className="flex items-center gap-1 text-xs text-secondary">
                          <CheckCircle className="w-3 h-3" />
                          Complete
                        </div>
                      ) : uploadedFile.status === "error" ? (
                        <div className="flex items-center gap-1 text-xs text-destructive">
                          <X className="w-3 h-3" />
                          Failed
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full gradient-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadedFile.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(uploadedFile.progress)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeFile(uploadedFile.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
