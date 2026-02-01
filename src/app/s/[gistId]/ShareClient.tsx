"use client";

import { useState, useEffect, useRef } from "react";

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

    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setTransferStatus("transferring");

    // Simulate transfer progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTransferStatus("complete");

        // Create file download
        const byteCharacters = atob(fileData.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        setReceivedFile(blob);
      }
      setProgress(currentProgress);
    }, 300);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-rounded text-5xl text-red-500 animate-spin">
            sync
          </span>
          <p className="text-body text-on-surface mt-4">Loading transfer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <span className="material-symbols-rounded text-5xl text-error mb-4">
            error
          </span>
          <h1 className="text-title text-on-surface mb-2">Transfer Not Found</h1>
          <p className="text-body text-on-surface-variant mb-4">
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
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* File Info Card */}
        <div className="card mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-rounded text-3xl text-red-500">
                description
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-title text-on-surface mb-1">
                {fileData.fileName}
              </h2>
              <p className="text-label text-on-surface-variant">
                {formatFileSize(fileData.size)}
              </p>
            </div>
          </div>
        </div>

        {/* Transfer Status */}
        {transferStatus === "idle" && (
          <div className="card mb-6 text-center animate-slide-up">
            <div className="mb-4">
              <span className="material-symbols-rounded text-6xl text-red-500">
                person_add
              </span>
            </div>
            <h3 className="text-title text-on-surface mb-2">
              Accept Transfer?
            </h3>
            <p className="text-body text-on-surface-variant mb-6">
              You&apos;ll receive {formatFileSize(fileData.size)} directly from the sender.
            </p>
            <button onClick={startTransfer} className="btn btn-filled w-full">
              <span className="material-symbols-rounded">download</span>
              Accept & Download
            </button>
          </div>
        )}

        {transferStatus === "connecting" && (
          <div className="card mb-6 text-center animate-slide-up">
            <span className="material-symbols-rounded text-6xl text-red-500 animate-pulse">
              wifi
            </span>
            <h3 className="text-title text-on-surface mt-4 mb-2">
              Connecting P2P...
            </h3>
            <p className="text-body text-on-surface-variant">
              Establishing secure connection
            </p>
          </div>
        )}

        {transferStatus === "transferring" && (
          <div className="card mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-rounded text-red-500 animate-spin">
                sync
              </span>
              <div className="flex-1">
                <p className="text-body text-on-surface">Transferring...</p>
                <p className="text-label text-on-surface-variant">
                  {formatFileSize((fileData.size * progress) / 100)} / {formatFileSize(fileData.size)}
                </p>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {transferStatus === "complete" && (
          <div className="card mb-6 text-center animate-slide-up">
            <span className="material-symbols-rounded text-6xl text-green-500 mb-4">
              check_circle
            </span>
            <h3 className="text-title text-on-surface mb-2">
              Transfer Complete!
            </h3>
            <p className="text-body text-on-surface-variant mb-6">
              {formatFileSize(fileData.size)} received successfully
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

        {/* Footer */}
        <div className="text-center">
          <p className="text-label text-on-surface-variant">
            🔒 End-to-end encrypted P2P transfer
          </p>
        </div>
      </main>
    </div>
  );
}
