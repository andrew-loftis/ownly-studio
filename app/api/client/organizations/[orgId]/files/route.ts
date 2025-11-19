import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    // Mock files data
    const mockFiles = [
      {
        id: "file-1",
        name: "Homepage Design Mockups.pdf",
        type: "design",
        size: 2456789,
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        downloadUrl: "/downloads/homepage-mockups.pdf",
        isPublic: true,
        description: "Initial homepage design concepts and layout options",
      },
      {
        id: "file-2",
        name: "Brand Guidelines.pdf",
        type: "document",
        size: 1234567,
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        downloadUrl: "/downloads/brand-guidelines.pdf",
        isPublic: true,
        description: "Complete brand identity and style guide",
      },
      {
        id: "file-3",
        name: "Logo Variations.zip",
        type: "design",
        size: 3456789,
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        downloadUrl: "/downloads/logo-variations.zip",
        isPublic: true,
        description: "Logo files in various formats (PNG, SVG, EPS)",
      },
      {
        id: "file-4",
        name: "Product Photography.zip",
        type: "image",
        size: 15678901,
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        downloadUrl: "/downloads/product-photos.zip",
        isPublic: true,
        description: "Professional product photos for website",
      },
      {
        id: "file-5",
        name: "Website Wireframes.pdf",
        type: "design",
        size: 987654,
        uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        downloadUrl: "/downloads/wireframes.pdf",
        isPublic: true,
        description: "Complete site structure and page layouts",
      },
      {
        id: "file-6",
        name: "SEO Audit Report.pdf",
        type: "document",
        size: 567890,
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        downloadUrl: "/downloads/seo-audit.pdf",
        isPublic: true,
        description: "Comprehensive SEO analysis and recommendations",
      },
    ];

    return NextResponse.json(mockFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}