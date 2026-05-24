"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";

export default function AdminPage() {
  const router = useRouter();

  const logout = () => {
    try {
      localStorage.removeItem("role");
    } catch (e) {
      /* ignore */
    }
    router.push("/login");
  };

  return (
    <MainLayout title="Admin">
      <div className="max-w-3xl rounded-xl border border-border/70 bg-white/5 p-8">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Chào mừng quản trị viên.
        </p>
        <div className="flex gap-3">
          <Button onClick={logout} variant="ghost">
            Đăng xuất
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
