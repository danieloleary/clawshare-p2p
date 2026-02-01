// GitHub API Wrapper for ClawShare
import type { Gist, GistFile, FileMetadata } from "./types";

const GITHUB_API = "https://api.github.com";

export class GitHubClient {
  private token: string;
  private owner: string;

  constructor(token: string) {
    this.token = token;
    this.owner = "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${GITHUB_API}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  // Get authenticated user
  async getUser(): Promise<{ login: string; avatar_url: string; id: number }> {
    const user = await this.request<{ login: string; avatar_url: string; id: number }>(
      "/user"
    );
    this.owner = user.login;
    return user;
  }

  // Create a Gist for file sharing
  async createShareGist(
    fileName: string,
    fileContent: string,
    fileHash: string,
    senderId: string,
    options: {
      isDownload?: boolean;
      password?: string;
      expiresInDays?: number;
    } = {}
  ): Promise<{ gistId: string; url: string }> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 7));

    const metadata: FileMetadata = {
      id: crypto.randomUUID(),
      fileName,
      fileSize: new Blob([fileContent]).size,
      fileHash,
      mimeType: this.getMimeType(fileName),
      senderId,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      isDownload: options.isDownload || false,
      password: options.password,
    };

    const description = `clawshare:${fileName}:${fileHash}`;

    const gist = await this.request<{ id: string; html_url: string }>("/gists", {
      method: "POST",
      body: JSON.stringify({
        description,
        public: false,
        files: {
          [fileName]: {
            content: Buffer.from(fileContent).toString("base64"),
          },
          "clawshare-metadata.json": {
            content: JSON.stringify(metadata, null, 2),
          },
        },
      }),
    });

    return {
      gistId: gist.id,
      url: gist.html_url,
    };
  }

  // Get Gist for file sharing
  async getShareGist(
    gistId: string
  ): Promise<{ fileName: string; content: string; metadata: FileMetadata } | null> {
    try {
      const gist = await this.request<Gist>(`/gists/${gistId}`);

      // Verify this is a ClawShare gist
      const description = gist.description || "";
      if (!description.startsWith("clawshare:")) {
        return null;
      }

      // Get the main file content
      const fileName = Object.keys(gist.files).find(
        (f) => f !== "clawshare-metadata.json"
      );
      if (!fileName) return null;

      const file = gist.files[fileName];
      if (!file) return null;

      // Parse metadata
      const metadataFile = gist.files["clawshare-metadata.json"];
      let metadata: FileMetadata | null = null;
      if (metadataFile?.content) {
        try {
          metadata = JSON.parse(metadataFile.content);
        } catch {
          metadata = null;
        }
      }

      // Decode base64 content
      const content = Buffer.from(file.content || "", "base64").toString("utf-8");

      return {
        fileName,
        content,
        metadata: metadata!,
      };
    } catch {
      return null;
    }
  }

  // Update Gist with WebRTC signaling data
  async updateGistWithSignal(
    gistId: string,
    signal: {
      type: "offer" | "answer" | "ice-candidate";
      from: string;
      to: string;
      payload: string;
    }
  ): Promise<void> {
    const gist = await this.request<Gist>(`/gists/${gistId}`);

    // Get or create signals file
    let signalsContent = "";
    if (gist.files["signals.json"]?.content) {
      try {
        signalsContent = Buffer.from(
          gist.files["signals.json"].content,
          "base64"
        ).toString("utf-8");
      } catch {
        signalsContent = "";
      }
    }

    const signals = JSON.parse(signalsContent || "[]");
    signals.push({
      ...signal,
      timestamp: Date.now(),
    });

    await this.request(`/gists/${gistId}`, {
      method: "PATCH",
      body: JSON.stringify({
        files: {
          "signals.json": {
            content: JSON.stringify(signals, null, 2),
          },
        },
      }),
    });
  }

  // Get pending signals for a user
  async getPendingSignals(
    gistId: string,
    userId: string
  ): Promise<
    Array<{
      type: "offer" | "answer" | "ice-candidate";
      from: string;
      payload: string;
      timestamp: number;
    }>
  > {
    try {
      const gist = await this.request<Gist>(`/gists/${gistId}`);

      const signalsFile = gist.files["signals.json"];
      if (!signalsFile?.content) return [];

      const signals = JSON.parse(
        Buffer.from(signalsFile.content, "base64").toString("utf-8")
      );

      // Filter signals addressed to this user
      return signals
        .filter((s: any) => s.to === userId && s.from !== userId)
        .map((s: any) => ({
          type: s.type,
          from: s.from,
          payload: s.payload,
          timestamp: s.timestamp,
        }));
    } catch {
      return [];
    }
  }

  // Delete a Gist
  async deleteGist(gistId: string): Promise<void> {
    await this.request(`/gists/${gistId}`, {
      method: "DELETE",
    });
  }

  // Get rate limit status
  async getRateLimit(): Promise<{ remaining: number; limit: number }> {
    const rate = await this.request<{
      rate: { remaining: number; limit: number };
    }>("/rate_limit");
    return rate.rate;
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.split(".").pop()?.toLowerCase();
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
      txt: "text/plain",
      csv: "text/csv",
      json: "application/json",
      md: "text/markdown",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      ts: "application/typescript",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }
}

// Helper to create GitHub client from env
export function createGitHubClient(token: string): GitHubClient {
  return new GitHubClient(token);
}
