import { Metadata } from "next";
import ShareClient from "./ShareClient";

interface Props {
  params: Promise<{ gistId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gistId } = await params;
  return {
    title: `Share ${gistId.slice(0, 8)}... | clawshare.xyz`,
    description: "Receive a P2P file transfer",
  };
}

export default async function SharePage({ params }: Props) {
  const { gistId } = await params;
  return <ShareClient gistId={gistId} />;
}
