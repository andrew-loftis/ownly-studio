"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { fetchJsonWithAuth } from "@/lib/utils";

interface Message {
  id: string;
  from: "client" | "admin";
  author: string;
  content: string;
  timestamp: Date;
  projectId?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
}

interface ClientMessagingProps {
  organizationId: string;
  projectId?: string;
}

export default function ClientMessaging({ organizationId, projectId }: ClientMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [organizationId, projectId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const url = projectId 
        ? `/api/client/organizations/${organizationId}/projects/${projectId}/messages`
        : `/api/client/organizations/${organizationId}/messages`;
      
      const data = await fetchJsonWithAuth<Message[]>(url);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const url = projectId 
        ? `/api/client/organizations/${organizationId}/projects/${projectId}/messages`
        : `/api/client/organizations/${organizationId}/messages`;

      const response = await fetchJsonWithAuth(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          projectId,
        }),
      } as any);
      setNewMessage("");
      fetchMessages(); // Refresh messages
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
              <div className="h-16 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white/5 rounded-t-xl">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--txt-secondary)]">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.from === "client" ? "flex-row-reverse" : ""
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                message.from === "client" 
                  ? "bg-blue-500 text-white" 
                  : "bg-green-500 text-white"
              }`}>
                {message.author.charAt(0).toUpperCase()}
              </div>
              
              <div className={`flex-1 max-w-xs ${
                message.from === "client" ? "text-right" : ""
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[var(--txt-primary)]">
                    {message.author}
                  </span>
                  <span className="text-xs text-[var(--txt-tertiary)]">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className={`p-3 rounded-xl ${
                  message.from === "client"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-white/10 text-[var(--txt-primary)]"
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          className="block text-xs underline opacity-75 hover:opacity-100"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          📎 {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/5 rounded-b-xl border-t border-white/10">
        <div className="flex gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-[var(--txt-primary)] placeholder-[var(--txt-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              {sending ? "Sending..." : "Send"}
            </Button>
            <button
              type="button"
              className="text-xs text-[var(--txt-tertiary)] hover:text-[var(--txt-secondary)]"
              title="Attach file"
            >
              📎
            </button>
          </div>
        </div>
        <p className="text-xs text-[var(--txt-tertiary)] mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}