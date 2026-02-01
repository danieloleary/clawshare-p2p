"use client";

import { useState } from "react";
import type { TransferProgress } from "@/lib/types";

interface TransferCardProps {
  fileName: string;
  fileSize: number;
  senderName?: string;
  onAccept: () => void;
  onDecline?: () => void;
  status: "idle" | "connecting" | "transferring" | "completed" | "failed";
  progress?: TransferProgress;
  error?: string;
}

export function TransferCard({
  fileName,
  fileSize,
  senderName,
  onAccept,
  onDecline,
  status,
  progress,
  error,
}: TransferCardProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
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
    };
    return icons[ext || ""] || "insert_drive_file";
  };

  // Idle state - show file info and accept button
  if (status === "idle") {
    return (
      <div className="card animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-rounded text-3xl text-red-500">
              {getFileIcon(fileName)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-title text-on-surface mb-1 truncate">
              {fileName}
            </h2>
            <p className="text-label text-on-surface-variant mb-1">
              {formatSize(fileSize)}
            </p>
            {senderName && (
              <p className="text-label text-on-surface-variant">
                From: {senderName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button onClick={onAccept} className="btn btn-filled w-full">
            <span className="material-symbols-rounded">download</span>
            Accept & Download
          </button>

          {onDecline && (
            <button onClick={onDecline} className="btn btn-text w-full">
              <span className="material-symbols-rounded">close</span>
              Decline
            </button>
          )}
        </div>

        <p className="text-center text-label text-on-surface-variant mt-4">
          🔒 End-to-end encrypted
        </p>
      </div>
    );
  }

  // Connecting state
  if (status === "connecting") {
    return (
      <div className="card text-center animate-slide-up">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-rounded text-4xl text-red-500 animate-pulse">
            wifi
          </span>
        </div>

        <h2 className="text-title text-on-surface mb-2">Connecting P2P...</h2>
        <p className="text-body text-on-surface-variant mb-4">
          Establishing secure connection with sender
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-rounded text-red-500 animate-spin">
            sync
          </span>
          <span className="text-label text-on-surface-variant">Please wait</span>
        </div>
      </div>
    );
  }

  // Transferring state
  if (status === "transferring" && progress) {
    const percentage = (progress.bytesTransferred / progress.totalBytes) * 100;
    const speed =
      progress.speed < 1024
        ? `${progress.speed.toFixed(0)} B/s`
        : progress.speed < 1024 * 1024
        ? `${(progress.speed / 1024).toFixed(1)} KB/s`
        : `${(progress.speed / (1024 * 1024)).toFixed(1)} MB/s`;

    return (
      <div className="card animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <span className="material-symbols-rounded text-2xl text-red-500 animate-pulse">
              {getFileIcon(fileName)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-body font-medium text-on-surface truncate">
              {fileName}
            </p>
            <p className="text-label text-on-surface-variant">
              {formatSize(progress.bytesTransferred)} / {formatSize(progress.totalBytes)}
            </p>
          </div>
        </div>

        <div className="mb-2">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-label text-on-surface-variant">
          <span>{percentage.toFixed(0)}%</span>
          <span>{speed}</span>
          {progress.estimatedTimeRemaining > 0 && (
            <span>~{Math.ceil(progress.estimatedTimeRemaining)}s left</span>
          )}
        </div>
      </div>
    );
  }

  // Completed state
  if (status === "completed") {
    return (
      <div className="card text-center animate-slide-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-rounded text-4xl text-green-500">
            check_circle
          </span>
        </div>

        <h2 className="text-title text-on-surface mb-2">Transfer Complete!</h2>
        <p className="text-body text-on-surface-variant mb-6">
          {formatSize(fileSize)} received successfully
        </p>

        <button className="btn btn-filled w-full mb-3">
          <span className="material-symbols-rounded">download</span>
          Save to Device
        </button>

        <a href="/" className="btn btn-text w-full">
          <span className="material-symbols-rounded">send</span>
          Send Something
        </a>
      </div>
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <div className="card text-center animate-slide-up">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-rounded text-4xl text-error">
            error
          </span>
        </div>

        <h2 className="text-title text-on-surface mb-2">Transfer Failed</h2>
        <p className="text-body text-on-surface-variant mb-4">
          {error || "Connection was interrupted"}
        </p>

        <div className="space-y-3">
          <button onClick={onAccept} className="btn btn-filled w-full">
            <span className="material-symbols-rounded">refresh</span>
            Try Again
          </button>

          {onDecline && (
            <button onClick={onDecline} className="btn btn-text w-full">
              <span className="material-symbols-rounded">close</span>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

interface ConnectionStatusProps {
  status: "connecting" | "connected" | "disconnected" | "failed";
  peerId?: string;
}

export function ConnectionStatus({ status, peerId }: ConnectionStatusProps) {
  const config: Record<
    string,
    { icon: string; color: string; text: string }
  > = {
    connecting: {
      icon: "wifi",
      color: "text-yellow-500",
      text: "Connecting...",
    },
    connected: {
      icon: "wifi_find",
      color: "text-green-500",
      text: "P2P Connected",
    },
    disconnected: {
      icon: "wifi_off",
      color: "text-gray-500",
      text: "Disconnected",
    },
    failed: {
      icon: "wifi_off",
      color: "text-red-500",
      text: "Connection Failed",
    },
  };

  const current = config[status];

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant rounded-full">
      <span className={`material-symbols-rounded ${current.color}`}>
        {current.icon}
      </span>
      <span className="text-label text-on-surface-variant">
        {current.text}
      </span>
      {peerId && (
        <span className="text-label text-on-surface-variant opacity-60">
          ({peerId.slice(0, 8)}...)
        </span>
      )}
    </div>
  );
}
