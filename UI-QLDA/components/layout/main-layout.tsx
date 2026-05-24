"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { ProtectedRoute } from "@/components/auth/protected-route";

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumb?: string;
}

export function MainLayout({ children, title, breadcrumb }: MainLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />

        <div className="ml-60">
          <TopBar title={title} breadcrumb={breadcrumb} />

          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
