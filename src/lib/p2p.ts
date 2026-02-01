// ClawShare P2P - Robust WebRTC Implementation
// crabs first, humans second

import type { TransferProgress, WebRTCSignal } from "./types";

type MessageHandler = (data: Uint8Array, offset: number) => void;
type StatusHandler = (status: TransferProgress) => void;
type ConnectionHandler = (connected: boolean) => void;

export class P2PManager {
  private peerId: string;
  private connection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private messageHandler: MessageHandler | null = null;
  private statusHandler: StatusHandler | null = null;
  private connectionHandler: ConnectionHandler | null = null;
  private fileBuffer: Uint8Array[] = [];
  private bytesReceived = 0;
  private totalBytes = 0;
  private startTime = 0;
  private transferInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isResumeMode = false;
  private lastAcknowledgedOffset = 0;
  private signalGistId: string | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  // Configuration
  private readonly CHUNK_SIZE = 16 * 1024; // 16KB chunks
  private readonly ICE_SERVERS: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    // Add TURN servers for production
  ];

  constructor(peerId: string) {
    this.peerId = peerId;
  }

  // Set up handlers
  onMessage(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  onStatus(handler: StatusHandler): void {
    this.statusHandler = handler;
  }

  onConnection(handler: ConnectionHandler): void {
    this.connectionHandler = handler;
  }

  // Initialize peer connection
  private createPeerConnection(): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: this.ICE_SERVERS,
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    };

    const pc = new RTCPeerConnection(config);

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.queueIceCandidate(event.candidate);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log("[Crab] Connection state:", pc.connectionState);
      this.handleConnectionStateChange(pc.connectionState);
    };

    // ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log("[Crab] ICE state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        this.handleIceFailure();
      }
    };

    return pc;
  }

  // Handle connection state changes
  private handleConnectionStateChange(state: RTCPeerConnectionState): void {
    switch (state) {
      case "connected":
        console.log("[Crab] 🔗 Claw grip established!");
        this.reconnectAttempts = 0;
        if (this.connectionHandler) this.connectionHandler(true);
        this.stopPolling();
        break;
      case "disconnected":
        console.log("[Crab] ⚠️ Claw grip lost - attempting reconnect...");
        if (this.connectionHandler) this.connectionHandler(false);
        this.attemptReconnect();
        break;
      case "failed":
        console.log("[Crab] ❌ Claw grip failed");
        if (this.connectionHandler) this.connectionHandler(false);
        this.attemptReconnect();
        break;
      case "closed":
        console.log("[Crab] 🔒 Claw grip closed");
        if (this.connectionHandler) this.connectionHandler(false);
        break;
    }
  }

  // Handle ICE failure - auto retry
  private handleIceFailure(): void {
    console.log("[Crab] ICE failure detected, attempting recovery...");
    
    // Try ICE restart
    if (this.connection) {
      this.connection.createOffer({ iceRestart: true })
        .then((offer) => this.connection!.setLocalDescription(offer))
        .catch((err) => console.error("[Crab] ICE restart failed:", err));
    }
  }

  // Attempt reconnection with backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[Crab] ❌ Max reconnect attempts reached");
      this.notifyFailure("Claw grip lost. Max retries reached.");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    console.log(`[Crab] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.notifyStatus("reconnecting", delay);

    setTimeout(() => {
      this.pollForSignal();
    }, delay);
  }

  // Poll GitHub Gist for signals (reconnection fallback)
  private pollForSignal(): void {
    if (!this.signalGistId) return;

    // Check for new signals in Gist
    fetch(`/api/gist?signals=${this.signalGistId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.signals && data.signals.length > 0) {
          // Process incoming signals
          this.processSignals(data.signals);
        }
      })
      .catch(() => {
        // Silent fail, will retry
      });
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Queue ICE candidate for signaling
  private async queueIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.signalGistId) return;
    
    // Send to GitHub Gist (or signaling server in production)
    console.log("[Crab] Queuing ICE candidate for signaling");
  }

  // Process incoming signals
  private async processSignals(signals: any[]): Promise<void> {
    for (const signal of signals) {
      if (signal.type === "offer" && !this.connection) {
        await this.handleOffer(new RTCSessionDescription(signal.payload));
      } else if (signal.type === "answer") {
        await this.handleAnswer(new RTCSessionDescription(signal.payload));
      } else if (signal.type === "ice-candidate") {
        await this.addIceCandidate(signal.payload);
      }
    }
  }

  // Create offer as sender
  async createOffer(gistId?: string): Promise<RTCSessionDescriptionInit> {
    this.signalGistId = gistId || null;
    this.connection = this.createPeerConnection();

    // Create data channel for file transfer
    this.dataChannel = this.connection.createDataChannel("file-transfer", {
      ordered: true,
    });

    this.setupDataChannel();

    const offer = await this.connection!.createOffer();
    await this.connection!.setLocalDescription(offer);

    return offer;
  }

  // Create answer as receiver
  async createAnswer(
    offer: RTCSessionDescriptionInit,
    gistId?: string
  ): Promise<RTCSessionDescriptionInit> {
    this.signalGistId = gistId || null;
    this.connection = this.createPeerConnection();

    // Handle incoming data channel
    this.connection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    await this.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);

    return answer;
  }

  // Handle answer from remote peer
  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.connection) {
      throw new Error("No peer connection");
    }
    await this.connection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // Add ICE candidate
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.connection) {
      throw new Error("No peer connection");
    }
    try {
      await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn("[Crab] Failed to add ICE candidate:", e);
    }
  }

  // Set up data channel handlers
  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log("[Crab] 📡 Data channel opened");
      if (this.connectionHandler) this.connectionHandler(true);
    };

    this.dataChannel.onclose = () => {
      console.log("[Crab] 📡 Data channel closed");
      if (this.connectionHandler) this.connectionHandler(false);
    };

    this.dataChannel.onmessage = (event) => {
      // Handle incoming file chunk
      const chunk = new Uint8Array(event.data);
      this.receiveChunk(chunk);
    };

    this.dataChannel.onerror = (error) => {
      console.error("[Crab] Data channel error:", error);
    };
  }

  // Receive and process chunk (with resume support)
  private receiveChunk(chunk: Uint8Array): void {
    const offset = this.bytesReceived;
    this.bytesReceived += chunk.length;
    this.fileBuffer.push(chunk);

    // Notify handler of new chunk
    if (this.messageHandler) {
      this.messageHandler(chunk, offset);
    }

    // Check if complete
    if (this.bytesReceived >= this.totalBytes) {
      this.completeTransfer();
    }
  }

  // Send file in chunks (with resume support)
  async sendFile(fileData: Uint8Array, startOffset = 0): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      throw new Error("Data channel not open");
    }

    // Skip to resume offset
    let offset = startOffset;
    
    while (offset < fileData.length) {
      const chunk = fileData.slice(offset, offset + this.CHUNK_SIZE);
      
      // Check if channel is still open
      if (this.dataChannel.readyState !== "open") {
        console.log("[Crab] Channel closed, stopping send");
        return;
      }

      try {
        this.dataChannel.send(chunk);
        offset += chunk.length;

        // Update progress
        this.notifyProgress(offset, fileData.length);
        
        // Small delay to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 1));
      } catch (error) {
        console.error("[Crab] Send error:", error);
        // Return current offset for resume
        throw new Error(`Send failed at offset ${offset}`);
      }
    }
  }

  // Prepare to receive file
  startReceiving(totalBytes: number, resumeOffset = 0): void {
    this.fileBuffer = [];
    this.bytesReceived = resumeOffset; // Resume from last known position
    this.totalBytes = totalBytes;
    this.startTime = Date.now();
    this.isResumeMode = resumeOffset > 0;

    // Start progress updates
    this.transferInterval = setInterval(() => {
      this.notifyProgress(this.bytesReceived, this.totalBytes);
    }, 100);
  }

  // Get received file
  getReceivedFile(): Uint8Array {
    const totalLength = this.fileBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of this.fileBuffer) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  // Get current offset for resume
  getCurrentOffset(): number {
    return this.bytesReceived;
  }

  // Close connection gracefully
  close(): void {
    console.log("[Crab] 🔒 Closing claw grip");
    
    if (this.transferInterval) {
      clearInterval(this.transferInterval);
      this.transferInterval = null;
    }

    this.stopPolling();

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    if (this.connectionHandler) {
      this.connectionHandler(false);
    }
  }

  // Notify status update
  private notifyStatus(status: "idle" | "connecting" | "transferring" | "reconnecting" | "complete" | "failed", extra?: number): void {
    if (this.statusHandler) {
      this.statusHandler({
        fileId: this.peerId,
        bytesTransferred: this.bytesReceived,
        totalBytes: this.totalBytes,
        status: status as any,
        speed: 0,
        estimatedTimeRemaining: extra || 0,
      });
    }
  }

  // Notify progress update
  private notifyProgress(bytesTransferred: number, totalBytes: number): void {
    if (!this.statusHandler) return;

    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = bytesTransferred / elapsed;
    const remaining = totalBytes - bytesTransferred;
    const eta = speed > 0 ? remaining / speed : 0;

    this.statusHandler({
      fileId: this.peerId,
      bytesTransferred,
      totalBytes,
      status: bytesTransferred >= totalBytes ? "completed" : "transferring",
      speed,
      estimatedTimeRemaining: eta,
    });
  }

  // Notify failure
  private notifyFailure(message: string): void {
    if (this.statusHandler) {
      this.statusHandler({
        fileId: this.peerId,
        bytesTransferred: this.bytesReceived,
        totalBytes: this.totalBytes,
        status: "failed",
        speed: 0,
        estimatedTimeRemaining: 0,
      });
    }
  }

  // Complete transfer
  private completeTransfer(): void {
    if (this.transferInterval) {
      clearInterval(this.transferInterval);
    }

    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = this.totalBytes / elapsed;

    console.log(`[Crab] ✅ Transfer complete! ${(this.totalBytes / 1024 / 1024).toFixed(2)} MB in ${elapsed.toFixed(1)}s`);

    if (this.statusHandler) {
      this.statusHandler({
        fileId: this.peerId,
        bytesTransferred: this.totalBytes,
        totalBytes: this.totalBytes,
        status: "completed",
        speed,
        estimatedTimeRemaining: 0,
      });
    }
  }

  // Check if connection is active
  isConnected(): boolean {
    return (
      this.connection !== null &&
      this.connection.connectionState === "connected"
    );
  }

  // Get connection state
  getState(): RTCPeerConnectionState | "none" {
    return this.connection?.connectionState || "none";
  }

  // Get transfer stats
  getStats(): { bytesReceived: number; totalBytes: number; speed: number } {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const speed = this.bytesReceived / elapsed;
    return {
      bytesReceived: this.bytesReceived,
      totalBytes: this.totalBytes,
      speed,
    };
  }
}

// Helper functions
export function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

export function uint8ArrayToBlob(data: Uint8Array, mimeType: string): Blob {
  return new Blob([data], { type: mimeType });
}

export function generatePeerId(): string {
  return `crab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Chunk a file for transfer
export function chunkFile(file: Uint8Array, chunkSize = 16 * 1024): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let offset = 0; offset < file.length; offset += chunkSize) {
    chunks.push(file.slice(offset, offset + chunkSize));
  }
  return chunks;
}
