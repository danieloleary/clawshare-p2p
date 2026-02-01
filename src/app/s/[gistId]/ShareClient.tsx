"use client";

import { useState, useEffect, useCallback } from "react";

interface FileData {
  gistId: string;
  fileName: string;
  size: number;
  content: string;
  createdAt: string;
}

interface ShareClientProps {
  gistId: string;
}

export default function ShareClient({ gistId }: ShareClientProps) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transferStatus, setTransferStatus] = useState<"idle" | "connecting" | "transferring" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<Blob | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const icons: Record<string, string> = {
      pdf: "picture_as_pdf",
      doc: "description",
      docx: "description",
      xls: "table_chart",
      xlsx: "table_chart",
      ppt: "slideshow",
      pptx: "slideshow",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      webp: "image",
      mp4: "videocam",
      mov: "videocam",
      mp3: "audiotrack",
      wav: "audiotrack",
      zip: "folder_zip",
      rar: "folder_zip",
      json: "code",
      js: "code",
      ts: "code",
      html: "code",
      css: "code",
      txt: "article",
      md: "description",
      csv: "table_chart",
    };
    return icons[ext] || "insert_drive_file";
  };

  const getFileTypeLabel = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const labels: Record<string, string> = {
      pdf: "PDF Document",
      doc: "Word Document",
      docx: "Word Document",
      xls: "Excel Spreadsheet",
      xlsx: "Excel Spreadsheet",
      ppt: "PowerPoint",
      pptx: "PowerPoint",
      jpg: "JPEG Image",
      jpeg: "JPEG Image",
      png: "PNG Image",
      gif: "GIF Image",
      mp4: "Video",
      mov: "Video",
      mp3: "Audio",
      wav: "Audio",
      zip: "Archive",
      json: "JSON Data",
      txt: "Text File",
    };
    return labels[ext] || "File";
  };

  // Fetch file metadata from Gist
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`/api/gist?id=${gistId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch file");
        }

        setFileData({
          gistId,
          fileName: data.fileName,
          size: data.size,
          content: data.content,
          createdAt: data.createdAt,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [gistId]);

  // P2P Transfer simulation (for MVP - real WebRTC would go here)
  const startTransfer = async () => {
    if (!fileData) return;

    setTransferStatus("connecting");
    setProgress(0);

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setTransferStatus("transferring");

    // Simulate transfer progress with smoother animation
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 12 + 3;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTransferStatus("complete");

        // Create file download from base64 content
        try {
          const byteCharacters = atob(fileData.content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const mimeType = getMimeType(fileData.fileName);
          const blob = new Blob([byteArray], { type: mimeType });
          setReceivedFile(blob);
        } catch (e) {
          console.error("Error creating file:", e);
        }
      }
      setProgress(Math.min(currentProgress, 100));
    }, 200);
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      zip: "application/zip",
      json: "application/json",
      txt: "text/plain",
      md: "text/markdown",
      csv: "text/csv",
    };
    return mimeTypes[ext] || "application/octet-stream";
  };

  const downloadFile = () => {
    if (!receivedFile || !fileData) return;

    const url = URL.createObjectURL(receivedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cancelTransfer = () => {
    setTransferStatus("idle");
    setProgress(0);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-outline/20">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center">
            <button className="btn btn-text">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <span className="text-title text-on-surface ml-2">Transfer</span>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="card animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-surface-variant rounded-xl" />
              <div className="flex-1">
                <div className="h-5 bg-surface-variant rounded mb-2 w-3/4" />
                <div className="h-4 bg-surface-variant rounded w-1/4" />
              </div>
            </div>
          </div>
          <div className="card mt-4 animate-pulse">
            <div className="h-24 bg-surface-variant rounded" />
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-rounded text-4xl text-error">
              error
            </span>
          </div>
          <h1 className="text-title text-on-surface mb-2">Transfer Not Found</h1>
          <p className="text-body text-on-surface-variant mb-6">
            This link may have expired or been removed.
          </p>
          <a href="/" className="btn btn-filled">
            <span className="material-symbols-rounded">home</span>
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-outline/20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <a href="/" className="btn btn-text">
            <span className="material-symbols-rounded">arrow_back</span>
          </a>
          <span className="text-title text-on-surface ml-2">Transfer</span>
          <div className="flex-1" />
          <span className="chip bg-red-100 text-red-700">
            <span className="material-symbols-rounded text-sm">lock</span>
            Encrypted
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* File Info Card */}
        <div className="card mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-rounded text-3xl text-red-500">
                {getFileIcon(fileData.fileName)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-title text-on-surface mb-1 truncate">
                {fileData.fileName}
              </h2>
              <p className="text-label text-on-surface-variant">
                {formatFileSize(fileData.size)} • {getFileTypeLabel(fileData.fileName)}
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Status Cards */}
        {transferStatus === "idle" && (
          <div className="card mb-6 text-center animate-slide-up">
            <div className="mb-4">
              <span className="material-symbols-rounded text-6xl text-red-500">
                wifi_find
              </span>
            </div>
            <h3 className="text-title text-on-surface mb-2">
              Accept Transfer?
            </h3>
            <p className="text-body text-on-surface-variant mb-6">
              You&apos;ll receive {formatFileSize(fileData.size)} directly from the sender via P2P.
            </p>
            <button onClick={startTransfer} className="btn btn-filled w-full mb-3">
              <span className="material-symbols-rounded">download</span>
              Accept & Download
            </button>
            <a href="/" className="btn btn-text w-full">
              <span className="material-symbols-rounded">close</span>
              Decline
            </a>
          </div>
        )}

        {transferStatus === "connecting" && (
          <div className="card mb-6 text-center animate-slide-up">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-4xl text-red-500 animate-pulse">
                wifi
              </span>
            </div>
            <h3 className="text-title text-on-surface mb-2">
              Connecting P2P...
            </h3>
            <p className="text-body text-on-surface-variant mb-4">
              Establishing secure peer-to-peer connection
            </p>
            <button onClick={cancelTransfer} className="btn btn-text">
              <span className="material-symbols-rounded">close</span>
              Cancel
            </button>
          </div>
        )}

        {transferStatus === "transferring" && (
          <div className="card mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-rounded text-2xl text-red-500 animate-spin">
                  sync
                </span>
              </div>
              <div className="flex-1">
                <p className="text-body font-medium text-on-surface">Transferring...</p>
                <p className="text-label text-on-surface-variant">
                  {formatFileSize((fileData.size * progress) / 100)} / {formatFileSize(fileData.size)}
                </p>
              </div>
              <button onClick={cancelTransfer} className="btn btn-text rounded-full p-2">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-label text-on-surface-variant">
              <span>{progress.toFixed(0)}%</span>
              <span>{formatFileSize(fileData.size * (100 - progress) / 100 / 1000)} remaining</span>
            </div>
          </div>
        )}

        {transferStatus === "complete" && (
          <div className="card mb-6 text-center animate-slide-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-4xl text-green-500">
                check_circle
              </span>
            </div>
            <h3 className="text-title text-on-surface mb-2">
              Transfer Complete!
            </h3>
            <p className="text-body text-on-surface-variant mb-6">
              {formatFileSize(fileData.size)} received successfully via P2P
            </p>
            <button onClick={downloadFile} className="btn btn-filled w-full mb-3">
              <span className="material-symbols-rounded">download</span>
              Save to Device
            </button>
            <a href="/" className="btn btn-text w-full">
              <span className="material-symbols-rounded">send</span>
              Send Something
            </a>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-surface-variant rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-rounded text-green-500">shield</span>
            <span className="text-label font-medium text-on-surface">End-to-End Encrypted</span>
          </div>
          <p className="text-label text-on-surface-variant">
            File transfers directly between devices. Never stored on servers.
          </p>
        </div>
      </main>
    </div>
  );
}
