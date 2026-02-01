"use client";

import { useState, useCallback } from "react";

interface FileInfo {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export default function Home() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      txt: "article",
      md: "description",
      csv: "table_chart",
    };
    return icons[ext] || "insert_drive_file";
  };

  const createFilePreview = async (selectedFile: File): Promise<string | undefined> => {
    if (selectedFile.type.startsWith("image/")) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(selectedFile);
      });
    }
    return undefined;
  };

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError("File too large. Free tier max: 100MB");
      return;
    }
    
    const preview = await createFilePreview(selectedFile);
    
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      preview,
    });
    setUploadProgress(0);
    setCopySuccess(false);
    setError(null);
    setShareUrl(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    await handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const fileToUpload = fileInput?.files?.[0];
      
      if (!fileToUpload) {
        throw new Error("No file selected");
      }
      
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];
        
        setUploadProgress(15);
        
        const gistData = {
          description: `clawshare:${file.name}`,
          public: false,
          files: {
            [file.name]: {
              content: base64Content
            }
          }
        };
        
        setUploadProgress(30);
        
        const response = await fetch('/api/gist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gistData)
        });
        
        setUploadProgress(70);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to upload");
        }
        
        setUploadProgress(90);
        
        const url = `${window.location.origin}/s/${data.gistId}`;
        setShareUrl(url);
        setUploadProgress(100);
        setUploading(false);
      };
      
      reader.onerror = () => {
        setError("Failed to read file");
        setUploading(false);
        setUploadProgress(0);
      };
      
      reader.readAsDataURL(fileToUpload);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setShareUrl(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-claw-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl animate-bounce-gentle">🦞</span>
            <span className="text-xl font-bold text-claw-dark font-['Fredoka']">clawshare</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="chip-free">
              <span className="material-symbols-rounded text-sm">bolt</span>
              10 transfers left
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-hero mb-3">
            Share files <span className="text-claw-primary">P2P</span>
          </h1>
          <p className="text-body text-claw-muted text-lg">
            Direct. Encrypted. Free. No server in between.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          <div className="trust-badge">
            <span className="material-symbols-rounded text-sm">lock</span>
            End-to-end encrypted
          </div>
          <div className="trust-badge">
            <span className="material-symbols-rounded text-sm">wifi_find</span>
            Direct P2P transfer
          </div>
          <div className="trust-badge">
            <span className="material-symbols-rounded text-sm">code</span>
            Open source
          </div>
        </div>

        {/* Upload/Share Zone */}
        {!shareUrl ? (
          <>
            {/* Drop Zone */}
            <div
              className={`drop-zone mb-6 ${dragOver ? 'drag-over' : ''} ${file ? 'py-6' : 'py-16'}`}
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
                /* Selected File Preview */
                <div className="animate-scale-in">
                  {file.preview ? (
                    <div className="mb-4">
                      <img 
                        src={file.preview} 
                        alt={file.name}
                        className="w-24 h-24 object-cover rounded-xl mx-auto shadow-md"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-claw-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-rounded text-4xl text-claw-primary">
                        {getFileIcon(file.name)}
                      </span>
                    </div>
                  )}
                  <p className="text-title text-claw-dark mb-1">{file.name}</p>
                  <p className="text-label text-claw-muted mb-4">{formatFileSize(file.size)}</p>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                    className="btn-text text-sm"
                  >
                    <span className="material-symbols-rounded">close</span>
                    Remove
                  </button>
                </div>
              ) : (
                /* Empty State */
                <div className="animate-scale-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-claw-light to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4 drop-zone-pulse">
                    <span className="material-symbols-rounded text-5xl text-claw-primary">
                      cloud_upload
                    </span>
                  </div>
                  <p className="text-title text-claw-dark mb-2">
                    Drop files here
                  </p>
                  <p className="text-body text-claw-muted mb-3">
                    or tap to browse
                  </p>
                  <p className="text-label text-claw-muted">
                    Up to 100 MB • Images, PDFs, Documents, Videos
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 animate-slide-up">
                <span className="material-symbols-rounded">error</span>
                {error}
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="mb-4 animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-medium">Uploading...</span>
                  <span className="text-label text-claw-muted">{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {file && !uploading && (
              <button
                onClick={handleUpload}
                className="btn-filled w-full animate-slide-up"
              >
                <span className="material-symbols-rounded">send</span>
                Create Share Link
              </button>
            )}
          </>
        ) : (
          /* Share Link Result */
          <div className="card animate-scale-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-rounded text-green-600">check_circle</span>
              </div>
              <span className="text-title">Link Ready!</span>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-4 mb-4 break-all text-body font-mono">
              {shareUrl}
            </div>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={copyToClipboard}
                className="btn-filled flex-1"
              >
                <span className="material-symbols-rounded">
                  {copySuccess ? "check" : "content_copy"}
                </span>
                {copySuccess ? "Copied!" : "Copy Link"}
              </button>
              
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={() => {
                    navigator.share({
                      title: `Share ${file?.name || 'file'}`,
                      text: 'Check out this file I shared via ClawShare P2P!',
                      url: shareUrl,
                    });
                  }}
                  className="btn-tonal"
                >
                  <span className="material-symbols-rounded">share</span>
                </button>
              )}
            </div>
            
            <button
              onClick={resetUpload}
              className="btn-text w-full"
            >
              <span className="material-symbols-rounded">add</span>
              Share Another File
            </button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-12">
          <div className="grid grid-cols-3 gap-4">
            <div className="feature-card">
              <span className="material-symbols-rounded text-4xl text-claw-primary mb-2">
                speed
              </span>
              <p className="text-label font-semibold text-claw-dark mb-1">Blazing Fast</p>
              <p className="text-xs text-claw-muted">Direct P2P transfer, no server bottleneck</p>
            </div>
            
            <div className="feature-card">
              <span className="material-symbols-rounded text-4xl text-claw-primary mb-2">
                lock
              </span>
              <p className="text-label font-semibold text-claw-dark mb-1">Encrypted</p>
              <p className="text-xs text-claw-muted">End-to-end security, your files stay yours</p>
            </div>
            
            <div className="feature-card">
              <span className="material-symbols-rounded text-4xl text-claw-primary mb-2">
                code
              </span>
              <p className="text-label font-semibold text-claw-dark mb-1">Open Source</p>
              <p className="text-xs text-claw-muted">Transparent, auditable, community-driven</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-label text-claw-muted">
            Built with ❤️ by <a href="https://github.com/danieloleary" className="text-claw-primary hover:underline">@danieloleary</a>
          </p>
          <p className="text-label text-claw-muted mt-1">
            <a href="https://github.com/danieloleary/clawshare-p2p" className="hover:text-claw-primary">View source</a> • <a href="#" className="hover:text-claw-primary">How it works</a>
          </p>
        </footer>
      </main>

      {/* Bottom Navigation Spacer */}
      <div className="h-4" />
    </div>
  );
}
