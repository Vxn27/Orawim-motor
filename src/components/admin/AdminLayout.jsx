"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#120b0b] text-stone-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto bg-[#120b0b] p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
