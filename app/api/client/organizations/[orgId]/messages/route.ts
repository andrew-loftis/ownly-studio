import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    // Mock messages data
    const mockMessages = [
      {
        id: "msg-1",
        from: "admin",
        author: "Owen Miller",
        content: "Welcome to your project! I'll be your main point of contact. Feel free to reach out with any questions or feedback.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "msg-2",
        from: "client",
        author: "John Smith",
        content: "Thanks Owen! Really excited to get started. When can we expect the first design mockups?",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: "msg-3",
        from: "admin",
        author: "Owen Miller",
        content: "Great question! I'll have the initial homepage designs ready by Friday. I'll also include some style guide options for you to review.",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: "msg-4",
        from: "admin",
        author: "Owen Miller",
        content: "Just uploaded the homepage designs to your files section. Let me know your thoughts!",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        attachments: [
          {
            name: "homepage-mockups.pdf",
            url: "/downloads/homepage-mockups.pdf",
            type: "application/pdf",
          },
        ],
      },
    ];

    return NextResponse.json(mockMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const { content, projectId } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // In a real implementation, save the message to Firestore
    // and send notifications to admin users

    const newMessage = {
      id: `msg-${Date.now()}`,
      from: "client",
      author: "Client User", // Get from auth token
      content: content.trim(),
      timestamp: new Date(),
      projectId,
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}