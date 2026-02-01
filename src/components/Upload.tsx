"use client";

import { useState, useCallback } from "react";

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface UploadProps {
  onFileSelected: (file: File) => void;
  maxSizeMB?: number;
}

export function UploadDropzone({ onFileSelected, maxSizeMB = 100 }: UploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndProcess(file);
      }
    },
    [maxSizeMB]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndProcess(file);
      }
    },
    [maxSizeMB]
  );

  const validateAndProcess = (file: File) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      setError(`File too large. Max size: ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    onFileSelected(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className={`drop-zone ${dragOver ? "drag-over" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        onChange={handleFileInput}
      />

      <div className="flex flex-col items-center">
        <span className="material-symbols-rounded text-5xl text-on-surface-variant mb-3">
          cloud_upload
        </span>
        <p className="text-body text-on-surface mb-1">
          Drop your file here
        </p>
        <p className="text-label text-on-surface-variant">
          or tap to browse
        </p>
        <p className="text-label text-on-surface-variant mt-2 opacity-60">
          Max {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-body">
          {error}
        </div>
      )}
    </div>
  );
}

interface FileCardProps {
  file: FileInfo;
  onRemove: () => void;
}

export function FileCard({ file, onRemove }: FileCardProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "videocam";
    if (mimeType.startsWith("audio/")) return "audiotrack";
    if (mimeType.includes("pdf")) return "picture_as_pdf";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "description";
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
      return "table_chart";
    return "insert_drive_file";
  };

  return (
    <div className="card flex items-center gap-3 animate-slide-up">
      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-rounded text-2xl text-red-500">
          {getIcon(file.type)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-on-surface truncate">
          {file.name}
        </p>
        <p className="text-label text-on-surface-variant">
          {formatSize(file.size)}
        </p>
      </div>

      <button
        onClick={onRemove}
        className="btn btn-text rounded-full p-2"
        aria-label="Remove file"
      >
        <span className="material-symbols-rounded">close</span>
      </button>
    </div>
  );
}

interface UploadButtonProps {
  onUpload: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function UploadButton({
  onUpload,
  loading = false,
  disabled = false,
}: UploadButtonProps) {
  return (
    <button
      onClick={onUpload}
      disabled={disabled || loading}
      className="btn btn-filled w-full"
    >
      {loading ? (
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
  );
}

interface ProgressBarProps {
  progress: number;
  speed?: number;
  eta?: number;
}

export function ProgressBar({ progress, speed, eta }: ProgressBarProps) {
  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatETA = (seconds: number): string => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    if (seconds < 3600) return `${Math.ceil(seconds / 60)}m`;
    return `${Math.ceil(seconds / 3600)}h`;
  };

  return (
    <div className="w-full">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {(speed !== undefined || eta !== undefined) && (
        <div className="flex justify-between mt-2 text-label text-on-surface-variant">
          <span>{progress.toFixed(0)}%</span>
          {speed !== undefined && <span>{formatSpeed(speed)}</span>}
          {eta !== undefined && eta > 0 && (
            <span>~{formatETA(eta)} remaining</span>
          )}
        </div>
      )}
    </div>
  );
}
