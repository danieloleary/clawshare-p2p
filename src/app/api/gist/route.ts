import { NextRequest, NextResponse } from "next/server";

// GitHub API configuration
const GITHUB_API = "https://api.github.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, public: isPublic, files } = body;

    // Get GitHub token from environment
    const token = process.env.GITHUB_TOKEN;
    
    if (!token) {
      return NextResponse.json(
        { error: "GitHub token not configured" },
        { status: 500 }
      );
    }

    // Create Gist
    const response = await fetch(`${GITHUB_API}/gists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description,
        public: isPublic || false,
        files,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to create gist" },
        { status: response.status }
      );
    }

    const gist = await response.json();

    return NextResponse.json({
      success: true,
      gistId: gist.id,
      url: gist.html_url,
      createdAt: gist.created_at,
    });
  } catch (error: any) {
    console.error("Gist creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gistId = searchParams.get("id");

    if (!gistId) {
      return NextResponse.json(
        { error: "Gist ID required" },
        { status: 400 }
      );
    }

    const token = process.env.GITHUB_TOKEN;

    const response = await fetch(`${GITHUB_API}/gists/${gistId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Gist not found" },
        { status: response.status }
      );
    }

    const gist = await response.json();

    // Parse file metadata from gist description
    const description = gist.description || "";
    const isClawShare = description.startsWith("clawshare:");

    if (!isClawShare) {
      return NextResponse.json(
        { error: "Not a valid ClawShare link" },
        { status: 400 }
      );
    }

    // Get the file content
    const fileName = Object.keys(gist.files)[0];
    const fileData = gist.files[fileName];

    return NextResponse.json({
      success: true,
      gistId: gist.id,
      fileName,
      size: fileData.size,
      content: fileData.content,
      createdAt: gist.created_at,
      url: gist.html_url,
    });
  } catch (error: any) {
    console.error("Gist fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
