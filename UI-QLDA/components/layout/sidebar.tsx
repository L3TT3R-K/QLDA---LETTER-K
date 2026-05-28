"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Package,
  FolderOpen,
  Building2,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import {
  getRoutesByRole,
  type AppRoute,
  type AuthUser,
} from "@/lib/permissions";

interface NavChild {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  group: AppRoute["group"];
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    group: "dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "POS Bán hàng",
    href: "/pos",
    group: "pos",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Kho nguyên liệu",
    href: "/inventory",
    group: "inventory",
    icon: <Package className="h-5 w-5" />,
    children: [
      { title: "Tồn kho", href: "/inventory/stock" },
      { title: "Nhập kho", href: "/inventory/import" },
      { title: "Xuất/Hủy", href: "/inventory/export" },
      { title: "Điều chuyển", href: "/inventory/transfer" },
      { title: "Kiểm kho", href: "/inventory/audit" },
      
    ],
  },
  {
    title: "Danh mục",
    href: "/catalog",
    group: "catalog",
    icon: <FolderOpen className="h-5 w-5" />,
    children: [
      { title: "Sản phẩm", href: "/catalog/products" },
      { title: "Nguyên liệu", href: "/catalog/ingredients" },
      { title: "Công thức", href: "/catalog/recipes" },
      
      
    ],
  },
  {
    title: "Hệ thống",
    href: "/system",
    group: "system",
    icon: <Building2 className="h-5 w-5" />,
    children: [
      { title: "Chi nhánh", href: "/system/branches" },
      { title: "Nhân viên", href: "/system/employees" },
      
    ],
  },
  {
    title: "Báo cáo",
    href: "/reports",
    group: "report",
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  QUANLY: "Quản lý",
  NHANVIEN_KHO: "Nhân viên kho",
  NHANVIEN_BANHANG: "Nhân viên bán hàng",
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

export function Sidebar() {
  const pathname = usePathname();

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [allowedRoutes, setAllowedRoutes] = useState<AppRoute[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();

    setUser(currentUser);
    setAllowedRoutes(getRoutesByRole(currentUser?.chucVu));
  }, []);

  useEffect(() => {
    const activeGroups = navItems
      .filter((item) => item.children?.some((child) => pathname === child.href))
      .map((item) => item.title);

    setExpandedItems((prev) => Array.from(new Set([...prev, ...activeGroups])));
  }, [pathname]);

  const allowedHrefSet = useMemo(() => {
    return new Set(allowedRoutes.map((route) => route.href));
  }, [allowedRoutes]);

  const canShow = (href: string) => {
    return allowedHrefSet.has(href);
  };

  const getVisibleChildren = (children?: NavChild[]) => {
    if (!children) return [];

    return children.filter((child) => canShow(child.href));
  };

  const filteredNavItems = navItems
    .map((item) => {
      if (item.children) {
        const visibleChildren = getVisibleChildren(item.children);

        return {
          ...item,
          children: visibleChildren,
        };
      }

      return item;
    })
    .filter((item) => {
      if (item.children) {
        return item.children.length > 0;
      }

      return canShow(item.href);
    });

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isChildActive = (children?: NavChild[]) => {
    if (!children) return false;
    return children.some((child) => pathname === child.href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#1A1A2E] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Coffee className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold leading-tight">Phụng Lộc</h1>
          <p className="text-xs text-white/60">Coffee Management</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.title}>
              {item.children && item.children.length > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive(item.href) || isChildActive(item.children)
                        ? "bg-primary text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.title}
                    </span>

                    {expandedItems.includes(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {expandedItems.includes(item.title) && (
                    <ul className="ml-6 mt-1 space-y-1 border-l border-white/20 pl-3">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm transition-colors",
                              pathname === child.href
                                ? "bg-primary/20 font-medium text-white"
                                : "text-white/60 hover:bg-white/10 hover:text-white",
                            )}
                          >
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold">
            {getInitials(user?.tenNV)}
          </div>

          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">
              {user?.tenNV || "Chưa đăng nhập"}
            </p>

            <p className="truncate text-xs text-white/60">
              {user?.chucVu ? roleLabels[user.chucVu] : "Không có quyền"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
