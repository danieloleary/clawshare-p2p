// WebRTC P2P Logic for ClawShare
import type { TransferProgress, WebRTCSignal } from "./types";

type MessageHandler = (data: Uint8Array) => void;
type StatusHandler = (status: TransferProgress) => void;

export class P2PManager {
  private peerId: string;
  private connection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private messageHandler: MessageHandler | null = null;
  private statusHandler: StatusHandler | null = null;
  private fileBuffer: Uint8Array[] = [];
  private bytesReceived = 0;
  private totalBytes = 0;
  private startTime = 0;
  private transferInterval: ReturnType<typeof setInterval> | null = null;

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

  // Create offer as sender
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    this.connection = this.createPeerConnection();

    // Create data channel for file transfer
    this.dataChannel = this.connection.createDataChannel("file-transfer", {
      ordered: true,
    });

    this.dataChannel.onopen = () => {
      console.log("Data channel opened");
    };

    this.dataChannel.onmessage = (event) => {
      if (this.messageHandler) {
        this.messageHandler(new Uint8Array(event.data));
      }
    };

    this.dataChannel.onclose = () => {
      console.log("Data channel closed");
    };

    const offer = await this.connection!.createOffer();
    await this.connection!.setLocalDescription(offer);

    return offer;
  }

  // Create answer as receiver
  async createAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    this.connection = this.createPeerConnection();

    // Handle incoming data channel
    this.connection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.dataChannel.onmessage = (msgEvent) => {
        if (this.messageHandler) {
          this.messageHandler(new Uint8Array(msgEvent.data));
        }
      };
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
    await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // Get local ICE candidates to send to remote
  async getLocalCandidates(): Promise<RTCIceCandidateInit[]> {
    if (!this.connection) {
      throw new Error("No peer connection");
    }

    const candidates: RTCIceCandidateInit[] = [];
    const transceiver = this.connection.getTransceivers()[0];

    if (transceiver) {
      const iceGatheringState =
        this.connection.iceGatheringState === "complete"
          ? "complete"
          : "gathering";
      if (iceGatheringState !== "complete") {
        await new Promise<void>((resolve) => {
          const checkState = () => {
            if (this.connection?.iceGatheringState === "complete") {
              this.connection.removeEventListener(
                "icegatheringstatechange",
                checkState
              );
              resolve();
            }
          };
          this.connection?.addEventListener(
            "icegatheringstatechange",
            checkState
          );
        });
      }
    }

    return candidates;
  }

  // Send file data through data channel
  async sendFile(fileData: Uint8Array): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      throw new Error("Data channel not open");
    }

    const chunkSize = 16 * 1024; // 16KB chunks
    let offset = 0;

    while (offset < fileData.length) {
      const chunk = fileData.slice(offset, offset + chunkSize);
      this.dataChannel.send(chunk);
      offset += chunkSize;

      // Small delay to prevent overwhelming
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  // Prepare to receive file
  startReceiving(totalBytes: number): void {
    this.fileBuffer = [];
    this.bytesReceived = 0;
    this.totalBytes = totalBytes;
    this.startTime = Date.now();

    // Start progress updates
    this.transferInterval = setInterval(() => {
      if (this.statusHandler) {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const speed = this.bytesReceived / elapsed;
        const remaining = this.totalBytes - this.bytesReceived;
        const eta = speed > 0 ? remaining / speed : 0;

        this.statusHandler({
          fileId: this.peerId,
          bytesTransferred: this.bytesReceived,
          totalBytes: this.totalBytes,
          status: "transferring",
          speed,
          estimatedTimeRemaining: eta,
        });
      }
    }, 100);
  }

  // Add received chunk
  addReceivedChunk(chunk: Uint8Array): Uint8Array {
    this.fileBuffer.push(chunk);
    this.bytesReceived += chunk.length;

    // Check if complete
    if (this.bytesReceived >= this.totalBytes) {
      this.completeTransfer();
    }

    return chunk;
  }

  // Complete transfer
  private completeTransfer(): void {
    if (this.transferInterval) {
      clearInterval(this.transferInterval);
    }

    if (this.statusHandler) {
      this.statusHandler({
        fileId: this.peerId,
        bytesTransferred: this.totalBytes,
        totalBytes: this.totalBytes,
        status: "completed",
        speed: this.totalBytes / ((Date.now() - this.startTime) / 1000),
        estimatedTimeRemaining: 0,
      });
    }
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

  // Close connection
  close(): void {
    if (this.transferInterval) {
      clearInterval(this.transferInterval);
    }

    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  }

  // Create peer connection with STUN servers
  private createPeerConnection(): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        // Add TURN servers for production
        // {
        //   urls: "turn:your-turn-server.com:3478",
        //   username: "user",
        //   credential: "pass"
        // }
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to signaling server (GitHub Gist)
        console.log("ICE candidate:", event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);

      if (pc.connectionState === "connected") {
        // P2P connection established!
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        // Connection lost
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
    };

    return pc;
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
}

// Helper to convert ArrayBuffer to Uint8Array
export function arrayBufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer);
}

// Helper to convert Blob to Uint8Array
export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Helper to convert Uint8Array to Blob
export function uint8ArrayToBlob(data: Uint8Array, mimeType: string): Blob {
  return new Blob([data], { type: mimeType });
}

// Generate random peer ID
export function generatePeerId(): string {
  return `peer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
