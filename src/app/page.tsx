"use client";

import { useState, useCallback } from "react";

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export default function Home() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return;
    
    // Check file size (100MB limit for free tier)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File too large. Free tier max: 100MB");
      return;
    }
    
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
    });
    setError(null);
    setShareUrl(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Get file data
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const fileToUpload = fileInput?.files?.[0];
      
      if (!fileToUpload) {
        throw new Error("No file selected");
      }
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1]; // Remove data URL prefix
        
        // Upload to GitHub Gist
        const gistData = {
          description: `clawshare:${file.name}`,
          public: false,
          files: {
            [file.name]: {
              content: base64Content
            }
          }
        };
        
        const response = await fetch('/api/gist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gistData)
        });
        
        if (!response.ok) {
          throw new Error("Failed to upload");
        }
        
        const { gistId } = await response.json();
        const url = `${window.location.origin}/s/${gistId}`;
        setShareUrl(url);
      };
      
      reader.readAsDataURL(fileToUpload);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-outline/20">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦞</span>
            <span className="text-headline font-bold text-on-surface">clawshare</span>
            <span className="text-label px-2 py-0.5 rounded-full bg-red-100 text-red-700">XYZ</span>
          </div>
          <button className="btn-text">
            <span className="material-symbols-rounded">settings</span>
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h1 className="text-headline text-on-surface mb-2">
            Share files <span className="text-red-500">P2P</span>
          </h1>
          <p className="text-body text-on-surface-variant">
            Direct transfer. Encrypted. Free.
          </p>
        </div>

        {/* Free Tier Badge */}
        <div className="flex justify-center mb-6">
          <span className="chip">
            <span className="material-symbols-rounded text-red-500">bolt</span>
            Free: 10 transfers today
          </span>
        </div>

        {/* Drop Zone */}
        <div
          className={`drop-zone mb-4 ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          />
          
          {file ? (
            <div className="animate-slide-up">
              <span className="material-symbols-rounded text-4xl text-red-500 mb-2">
                description
              </span>
              <p className="text-title text-on-surface mb-1">{file.name}</p>
              <p className="text-label text-on-surface-variant">{formatFileSize(file.size)}</p>
            </div>
          ) : (
            <div>
              <span className="material-symbols-rounded text-5xl text-on-surface-variant mb-3">
                cloud_upload
              </span>
              <p className="text-body text-on-surface mb-1">
                Drop your file here
              </p>
              <p className="text-label text-on-surface-variant">
                or tap to browse
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-card text-red-700 text-body">
            <span className="material-symbols-rounded mr-2">error</span>
            {error}
          </div>
        )}

        {/* Selected File Action */}
        {file && !shareUrl && (
          <div className="animate-slide-up">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-filled w-full mb-3"
            >
              {uploading ? (
                <>
                  <span className="material-symbols-rounded animate-spin">sync</span>
                  Uploading...
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded">send</span>
                  Create Share Link
                </>
              )}
            </button>
            <button
              onClick={() => setFile(null)}
              className="btn btn-text w-full"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Share URL Result */}
        {shareUrl && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-rounded text-green-500">check_circle</span>
              <span className="text-title text-on-surface">Link Ready!</span>
            </div>
            
            <div className="bg-surface-variant rounded-lg p-3 mb-3 break-all text-body font-mono">
              {shareUrl}
            </div>
            
            <button
              onClick={copyToClipboard}
              className="btn btn-filled w-full mb-3"
            >
              <span className="material-symbols-rounded">content_copy</span>
              Copy Link
            </button>
            
            <button
              onClick={() => { setFile(null); setShareUrl(null); }}
              className="btn btn-text w-full"
            >
              Share Another File
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <span className="material-symbols-rounded text-3xl text-red-500 mb-1">
              speed
            </span>
            <p className="text-label text-on-surface-variant">P2P Fast</p>
          </div>
          <div className="text-center">
            <span className="material-symbols-rounded text-3xl text-red-500 mb-1">
              lock
            </span>
            <p className="text-label text-on-surface-variant">Encrypted</p>
          </div>
          <div className="text-center">
            <span className="material-symbols-rounded text-3xl text-red-500 mb-1">
              code
            </span>
            <p className="text-label text-on-surface-variant">Open Source</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline/20">
        <div className="max-w-md mx-auto flex justify-around py-2">
          <button className="btn btn-filled rounded-full">
            <span className="material-symbols-rounded">home</span>
          </button>
          <button className="btn btn-text rounded-full">
            <span className="material-symbols-rounded">send</span>
          </button>
          <button className="btn btn-text rounded-full">
            <span className="material-symbols-rounded">settings</span>
          </button>
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-20" />
    </div>
  );
}
