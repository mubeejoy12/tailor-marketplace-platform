"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import {
  getNotifications,
  markAllRead,
  markRead,
  NotificationItem,
} from "@/services/notificationService";
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

/** Request browser push permission — safe to call multiple times */
function requestBrowserPermission() {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

/** Fire a browser push notification if tab is not focused */
function firePushNotification(title: string, body: string) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    document.hasFocus()
  ) return;

  try {
    new Notification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
    });
  } catch { /* silent — some browsers block programmatic notifications */ }
}

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading,       setLoading]       = useState(false);
  const ref                               = useRef<HTMLDivElement>(null);
  // Track previous unread count to detect new arrivals
  const prevUnreadRef                     = useRef<number>(0);
  const user                              = getUser();

  const unread = notifications.filter((n) => !n.isRead).length;

  // Ask for browser notification permission once on mount
  useEffect(() => {
    requestBrowserPermission();
  }, []);

  // Fetch on open
  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    getNotifications(user.id)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  // Poll every 30 s; fire browser push if new notifications arrive
  useEffect(() => {
    if (!user) return;
    const tick = () => {
      getNotifications(user.id)
        .then((latest) => {
          const latestUnread = latest.filter((n) => !n.isRead).length;
          // New notifications arrived since last poll?
          if (latestUnread > prevUnreadRef.current) {
            const newest = latest.find((n) => !n.isRead);
            if (newest) firePushNotification("TailorHub", newest.message);
          }
          prevUnreadRef.current = latestUnread;
          setNotifications(latest);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleMarkAll() {
    if (!user) return;
    await markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function handleMarkOne(id: number) {
    await markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#0F766E] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 top-[calc(100%+8px)] w-80 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl shadow-black/5 z-50 overflow-hidden
          transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
          <p className="text-sm font-semibold text-[#111111]">
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-xs bg-[#0F766E] text-white px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </p>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs text-[#0F766E] hover:underline font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-[#0F766E] animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-sm text-[#9CA3AF]">No notifications yet</p>
            </div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#F9FAFB] last:border-0 transition-colors ${
                    n.isRead ? "bg-white" : "bg-[#F0FDF4]"
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    {n.isRead ? (
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#374151] leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="flex-shrink-0 p-1 rounded text-[#9CA3AF] hover:text-[#0F766E] transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
