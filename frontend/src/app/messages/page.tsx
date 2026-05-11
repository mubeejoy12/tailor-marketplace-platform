"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountSidebar from "@/components/AccountSidebar";
import Button from "@/components/ui/Button";
import {
  MessageSquare, Send, Loader2, AlertCircle,
  ArrowLeft, Circle,
} from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessage,
  ConversationResponse,
  MessageResponse,
} from "@/services/messageService";
import { getUser } from "@/lib/auth";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvItem({
  conv, userId, active, onClick,
}: {
  conv: ConversationResponse; userId: number; active: boolean; onClick: () => void;
}) {
  const name = conv.customerId === userId ? conv.tailorName : conv.customerName;
  const ini  = name ? name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 transition-colors text-left ${
        active ? "bg-[#0F766E]/5 border-r-2 border-[#0F766E]" : "hover:bg-[#F9FAFB]"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
        {ini}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#111111] truncate">{name}</p>
          {conv.lastMessageAt && (
            <p className="text-[10px] text-[#9CA3AF] flex-shrink-0">{timeAgo(conv.lastMessageAt)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-[#9CA3AF] truncate flex-1">
            {conv.lastMessage ?? "No messages yet"}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] bg-[#0F766E] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────

function Bubble({ msg, isMine }: { msg: MessageResponse; isMine: boolean }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!isMine && (
          <p className="text-[10px] text-[#9CA3AF] px-1">{msg.senderName}</p>
        )}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isMine
            ? "bg-[#0F766E] text-white rounded-br-sm"
            : "bg-white border border-[#E5E7EB] text-[#111111] rounded-bl-sm"
        }`}>
          {msg.content}
        </div>
        <p className="text-[10px] text-[#9CA3AF] px-1">{formatTime(msg.createdAt)}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const user = getUser();

  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeConv,    setActiveConv]    = useState<ConversationResponse | null>(null);
  const [messages,      setMessages]      = useState<MessageResponse[]>([]);
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [input,         setInput]         = useState("");
  const [error,         setError]         = useState("");
  const [mobileView,    setMobileView]    = useState<"list" | "chat">("list");

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load conversations ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) { setError("Please log in to view messages."); setLoadingConvs(false); return; }

    // Check if a conversationId was passed in the URL
    const params = new URLSearchParams(window.location.search);
    const convId = params.get("conversationId");

    getConversations(user.id)
      .then((convs) => {
        setConversations(convs);
        if (convId) {
          const found = convs.find((c) => c.id === Number(convId));
          if (found) openConversation(found, convs);
        }
      })
      .catch(() => setError("Failed to load conversations."))
      .finally(() => setLoadingConvs(false));
  }, []);

  // ─── Poll messages every 5 s when a conversation is open ───────────────────

  useEffect(() => {
    if (!activeConv || !user) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      getMessages(activeConv.id, user.id)
        .then(setMessages)
        .catch(() => {});
    }, 5_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeConv]);

  // ─── Scroll to bottom on new messages ──────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Open conversation ──────────────────────────────────────────────────────

  function openConversation(conv: ConversationResponse, convList?: ConversationResponse[]) {
    if (!user) return;
    setActiveConv(conv);
    setMobileView("chat");
    setLoadingMsgs(true);
    getMessages(conv.id, user.id)
      .then((msgs) => {
        setMessages(msgs);
        // Reset unread count in local state
        const list = convList ?? conversations;
        setConversations(list.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false));
  }

  // ─── Send message ───────────────────────────────────────────────────────────

  async function handleSend() {
    if (!input.trim() || !activeConv || !user || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      const msg = await sendMessage(activeConv.id, user.id, text);
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      setInput(text); // restore if failed
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const otherName = activeConv
    ? (activeConv.customerId === user?.id ? activeConv.tailorName : activeConv.customerName)
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-6">
          <AccountSidebar />

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden" style={{ height: "calc(100vh - 260px)", minHeight: "500px" }}>
              <div className="flex h-full">

                {/* ─ Conversation list ────────────────────────────────────── */}
                <div className={`${mobileView === "chat" ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-72 border-r border-[#E5E7EB] flex-shrink-0`}>
                  <div className="px-4 py-3 border-b border-[#E5E7EB]">
                    <h1 className="text-sm font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
                      Messages
                    </h1>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {loadingConvs ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-5 h-5 text-[#0F766E] animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="p-4">
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700">{error}</p>
                        </div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <MessageSquare className="w-10 h-10 text-[#D1D5DB] mb-3" />
                        <p className="text-sm font-medium text-[#111111] mb-1">No conversations yet</p>
                        <p className="text-xs text-[#9CA3AF]">Start a chat by visiting a tailor&apos;s profile.</p>
                      </div>
                    ) : (
                      <div>
                        {conversations.map((conv) => (
                          <ConvItem
                            key={conv.id}
                            conv={conv}
                            userId={user?.id ?? 0}
                            active={activeConv?.id === conv.id}
                            onClick={() => openConversation(conv)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─ Chat panel ───────────────────────────────────────────── */}
                <div className={`${mobileView === "list" ? "hidden lg:flex" : "flex"} flex-col flex-1`}>
                  {!activeConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
                      <MessageSquare className="w-12 h-12 text-[#D1D5DB]" />
                      <p className="text-sm font-medium text-[#111111]">Select a conversation</p>
                      <p className="text-xs text-[#9CA3AF]">Choose a conversation from the left to start chatting.</p>
                    </div>
                  ) : (
                    <>
                      {/* Chat header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
                        <button
                          className="lg:hidden p-1.5 rounded-lg hover:bg-[#F3F4F6] text-[#6B7280]"
                          onClick={() => setMobileView("list")}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-xs font-bold text-[#0F766E] flex-shrink-0">
                          {otherName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111111]">{otherName}</p>
                          <p className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                            <Circle className="w-2 h-2 fill-green-400 text-green-400" /> Active
                          </p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4">
                        {loadingMsgs ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-[#0F766E] animate-spin" />
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare className="w-8 h-8 text-[#D1D5DB] mb-2" />
                            <p className="text-sm text-[#9CA3AF]">No messages yet. Say hello!</p>
                          </div>
                        ) : (
                          messages.map((msg) => (
                            <Bubble key={msg.id} msg={msg} isMine={msg.senderId === user?.id} />
                          ))
                        )}
                        <div ref={bottomRef} />
                      </div>

                      {/* Input */}
                      <div className="p-3 border-t border-[#E5E7EB]">
                        <div className="flex items-end gap-2">
                          <textarea
                            className="flex-1 text-sm border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] resize-none transition-colors"
                            rows={1}
                            placeholder="Type a message…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          <button
                            onClick={handleSend}
                            disabled={!input.trim() || sending}
                            className="p-2.5 bg-[#0F766E] text-white rounded-xl hover:bg-[#0D6460] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                          >
                            {sending
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Send className="w-4 h-4" />
                            }
                          </button>
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] mt-1.5 text-center">
                          Press Enter to send · Shift+Enter for new line
                        </p>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
