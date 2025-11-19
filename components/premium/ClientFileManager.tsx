"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { fetchJsonWithAuth } from "@/lib/utils";

interface FileItem {
  id: string;
  name: string;
  type: "design" | "document" | "code" | "image" | "other";
  size: number;
  uploadedAt: Date;
  downloadUrl: string;
  projectId?: string;
  isPublic: boolean;
  description?: string;
}

interface ClientFileManagerProps {
  organizationId: string;
  projectId?: string;
}

export default function ClientFileManager({ organizationId, projectId }: ClientFileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "design" | "document" | "code" | "image">("all");

  useEffect(() => {
    fetchFiles();
  }, [organizationId, projectId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = projectId 
        ? `/api/client/organizations/${organizationId}/projects/${projectId}/files`
        : `/api/client/organizations/${organizationId}/files`;
      
      const data = await fetchJsonWithAuth<FileItem[]>(url);
      setFiles(data);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "design":
        return "🎨";
      case "document":
        return "📄";
      case "code":
        return "💻";
      case "image":
        return "🖼️";
      default:
        return "📁";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const filteredFiles = files.filter(file => 
    filter === "all" || file.type === filter
  );

  const downloadFile = async (file: FileItem) => {
    try {
      // In a real implementation, this would handle secure file downloads
      window.open(file.downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to download file:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-16 bg-white/10 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all", label: "All Files", count: files.length },
          { id: "design", label: "Design", count: files.filter(f => f.type === "design").length },
          { id: "document", label: "Documents", count: files.filter(f => f.type === "document").length },
          { id: "code", label: "Code", count: files.filter(f => f.type === "code").length },
          { id: "image", label: "Images", count: files.filter(f => f.type === "image").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === tab.id
                ? "bg-white/10 text-[var(--txt-primary)]"
                : "text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-2">
            No Files Found
          </h3>
          <p className="text-[var(--txt-secondary)]">
            {filter === "all" 
              ? "No files have been shared with you yet."
              : `No ${filter} files found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="glass-strong rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--txt-primary)] truncate">
                      {file.name}
                    </h4>
                    {file.description && (
                      <p className="text-sm text-[var(--txt-secondary)] truncate">
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-xs text-[var(--txt-tertiary)]">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        file.type === "design" ? "bg-purple-500/10 text-purple-400" :
                        file.type === "document" ? "bg-blue-500/10 text-blue-400" :
                        file.type === "code" ? "bg-green-500/10 text-green-400" :
                        file.type === "image" ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>
                        {file.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(file)}
                  >
                    Download
                  </Button>
                  {file.type === "image" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.downloadUrl, "_blank")}
                    >
                      Preview
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Request */}
      <div className="glass-strong rounded-xl p-6 text-center">
        <h3 className="font-semibold text-[var(--txt-primary)] mb-2">
          Need to Share Files?
        </h3>
        <p className="text-sm text-[var(--txt-secondary)] mb-4">
          Contact your project manager to request file uploads or share feedback.
        </p>
        <Button variant="ghost" size="sm">
          Contact Support
        </Button>
      </div>
    </div>
  );
}