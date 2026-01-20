"use client";

import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: ReactNode;
  sidebarChildren?: ReactNode;
  headerTitle?: string;
  headerActions?: ReactNode;
  showFooter?: boolean;
}

export default function MainLayout({
  children,
  sidebarChildren,
  headerTitle,
  headerActions,
  showFooter = false,
}: MainLayoutProps) {
  return (
    <div
      className="min-h-screen bg-legal-bg grid gap-0"
      style={{
        gridTemplateAreas: showFooter
          ? `"header header" "sidebar main-content" "footer footer"`
          : `"header header" "sidebar main-content"`,
        gridTemplateColumns: "256px 1fr",
        gridTemplateRows: showFooter ? "auto 1fr auto" : "auto 1fr",
      }}
    >
      {/* Sidebar */}
      <div style={{ gridArea: "sidebar" }}>
        <Sidebar>{sidebarChildren}</Sidebar>
      </div>

      {/* Main Content */}
      <main className="p-2 overflow-auto rounded-l" style={{ gridArea: "main-content" }}>
        <Header title={headerTitle} actions={headerActions} />

        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer (optional) */}
      {showFooter && (
        <footer
          className="bg-gray-100 border-t border-gray-200 p-4"
          style={{ gridArea: "footer" }}
        >
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
            © 2026 Legal Case Management System
          </div>
        </footer>
      )}
    </div>
  );
}
