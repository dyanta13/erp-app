"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Footer from "@/components/footer/Footer";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

export default function AdminLayout({
 children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class untuk margin main content
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <ProtectedRoute>
        {/* Sidebar dan Backdrop */}
        <AppSidebar />
        <Backdrop />
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
          {/* Header */}
          <AppHeader />
          {/* Page Content & Footer */}
          <div className="p-4 mx-auto max-w-screen-2xl md:p-6 flex flex-col min-h-[calc(100vh-80px)] justify-between">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
}
