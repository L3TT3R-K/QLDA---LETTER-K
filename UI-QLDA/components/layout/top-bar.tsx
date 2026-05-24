"use client";
import { clearCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  breadcrumb?: string;
}

interface AuthUser {
  token?: string;
  maNV?: string;
  tenNV?: string;
  chucVu?: string;
  maCN?: string | null;
}

const authStorageKey = "AUTH_USER";
const tokenStorageKey = "ACCESS_TOKEN";
const selectedBranchStorageKey = "SELECTED_BRANCH";

const getCurrentUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(authStorageKey);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const getRoleLabel = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return "Admin";

    case "QUANLY":
      return "Quản lý";

    case "NHANVIEN_KHO":
      return "Nhân viên kho";

    case "NHANVIEN_BANHANG":
      return "Nhân viên bán hàng";

    default:
      return role || "Admin";
  }
};

const getInitials = (name?: string) => {
  if (!name) return "NV";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const last = parts[parts.length - 1]?.[0] || "";
  const beforeLast = parts[parts.length - 2]?.[0] || "";

  return `${beforeLast}${last}`.toUpperCase();
};

export function TopBar({ title, breadcrumb }: TopBarProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const logout = () => {
    clearCurrentUser();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">{title}</h1>

        {breadcrumb && (
          <p className="text-xs text-muted-foreground">{breadcrumb}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={logout}>
          Đăng xuất
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {getInitials(user?.tenNV || "Nguyễn Văn A")}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-medium">
              {user?.tenNV || "Nguyễn Văn A"}
            </p>

            <p className="text-xs text-muted-foreground">
              {getRoleLabel(user?.chucVu || "ADMIN")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
