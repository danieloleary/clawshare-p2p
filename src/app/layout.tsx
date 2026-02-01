import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "clawshare.xyz | P2P File Sharing",
  description: "Peer-to-peer file sharing via GitHub + WebRTC. Fast, free, encrypted.",
  keywords: ["file sharing", "p2p", "webrtc", "transfer", "share files"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
