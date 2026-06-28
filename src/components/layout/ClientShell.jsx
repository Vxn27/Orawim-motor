"use client";

import { usePathname } from "next/navigation";
import FloatingChatbot from "@/components/chatbot/FloatingChatbot";

export default function ClientShell({ children }) {
  const pathname = usePathname() || "";
  const isAdminRoute = pathname.startsWith("/admin") || pathname === "/login";

  return (
    <>
      {children}
      {!isAdminRoute && <FloatingChatbot />}
    </>
  );
}
