// ClawShare TypeScript Types

export interface FileMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  mimeType: string;
  senderId: string;
  createdAt: string;
  expiresAt: string;
  isDownload: boolean; // true = view only, false = download
  password?: string;
}

export interface GistFile {
  filename: string;
  type: string;
  language: string;
  raw_url: string;
  size: number;
  truncated: boolean;
  content: string;
}

export interface Gist {
  id: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface P2PConnection {
  peerId: string;
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  status: "connecting" | "connected" | "disconnected" | "failed";
}

export interface TransferProgress {
  fileId: string;
  bytesTransferred: number;
  totalBytes: number;
  status: "pending" | "transferring" | "completed" | "failed";
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export interface WebRTCSignal {
  type: "offer" | "answer" | "ice-candidate";
  from: string;
  to: string;
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface User {
  id: string;
  login: string;
  avatarUrl: string;
  transfersToday: number;
  isPro: boolean;
}

export interface ShareLink {
  url: string;
  id: string;
  expiresAt: string;
  fileName: string;
  fileSize: number;
}

export interface EnvConfig {
  GITHUB_TOKEN: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  CLAWSHARE_URL: string;
  STRIPE_SECRET_KEY?: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: string;
}

export interface ErrorResponse {
  error: string;
  code: number;
  details?: Record<string, unknown>;
}
