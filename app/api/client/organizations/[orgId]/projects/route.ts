import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    // Mock project data
    const mockProjects = [
      {
        id: "proj-1",
        name: "E-commerce Website",
        description: "Complete online store with payment integration and inventory management",
        status: "development",
        progress: 65,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        deliverables: [
          {
            id: "del-1",
            name: "Homepage Design",
            status: "completed",
            fileUrl: "/downloads/homepage-design.pdf",
          },
          {
            id: "del-2",
            name: "Product Catalog",
            status: "completed",
            fileUrl: "/downloads/product-catalog.pdf",
          },
          {
            id: "del-3",
            name: "Payment Integration",
            status: "pending",
          },
          {
            id: "del-4",
            name: "Admin Dashboard",
            status: "pending",
          },
        ],
        lastUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "proj-2",
        name: "Mobile App",
        description: "iOS and Android mobile application with real-time notifications",
        status: "planning",
        progress: 15,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        deliverables: [
          {
            id: "del-5",
            name: "Wireframes",
            status: "completed",
            fileUrl: "/downloads/mobile-wireframes.pdf",
          },
          {
            id: "del-6",
            name: "UI Design",
            status: "pending",
          },
        ],
        lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "proj-3",
        name: "SEO Optimization",
        description: "Complete website optimization for search engines and performance",
        status: "completed",
        progress: 100,
        deliverables: [
          {
            id: "del-7",
            name: "SEO Audit Report",
            status: "approved",
            fileUrl: "/downloads/seo-audit.pdf",
          },
          {
            id: "del-8",
            name: "Performance Report",
            status: "approved",
            fileUrl: "/downloads/performance-report.pdf",
          },
        ],
        lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    return NextResponse.json(mockProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}