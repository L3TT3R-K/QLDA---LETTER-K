export type UserRole = "ADMIN" | "QUANLY" | "QUANLY_CHINHANH" | "NHANVIEN_KHO" | "NHANVIEN_BANHANG";

export interface AuthUser {
  token?: string;
  maNV: string;
  tenNV: string;
  chucVu: UserRole;
  maCN: string | null;
}

export interface AppRoute {
  title: string;
  href: string;
  group:
    | "dashboard"
    | "pos"
    | "catalog"
    | "inventory"
    | "system"
    | "report"
    | "shift";
  roles: UserRole[];
}

export const appRoutes: AppRoute[] = [
  {
    title: "Dashboard",
    href: "/",
    group: "dashboard",
    roles: ["ADMIN", "QUANLY"],
  },
  {
    title: "Dashboard",
    href: "/manager",
    group: "dashboard",
    roles: ["QUANLY_CHINHANH"],
  },
  {
    title: "POS Bán hàng",
    href: "/pos",
    group: "pos",
    roles: ["QUANLY", "NHANVIEN_BANHANG"],
  },

  {
    title: "Sản phẩm",
    href: "/catalog/products",
    group: "catalog",
    roles: ["ADMIN", "QUANLY"],
  },
  {
    title: "Nguyên liệu",
    href: "/catalog/ingredients",
    group: "catalog",
    roles: ["ADMIN", "QUANLY"],
  },
  {
    title: "Đơn vị",
    href: "/catalog/donvi",
    group: "catalog",
    roles: ["ADMIN"],
  },
  {
    title: "Quy đổi đơn vị",
    href: "/catalog/quydoidonvi",
    group: "catalog",
    roles: ["ADMIN"],
  },
  {
    title: "Công thức",
    href: "/catalog/recipes",
    group: "catalog",
    roles: ["ADMIN", "QUANLY", "NHANVIEN_BANHANG"],
  },

  {
    title: "Tồn kho",
    href: "/inventory/stock",
    group: "inventory",
    roles: ["ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO"],
  },
  {
    title: "Nhập kho",
    href: "/inventory/import",
    group: "inventory",
    roles: ["ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO"],
  },
  {
    title: "Xuất kho",
    href: "/inventory/export",
    group: "inventory",
    roles: ["ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO"],
  },
  {
    title: "Điều chuyển kho",
    href: "/inventory/transfer",
    group: "inventory",
    roles: ["ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO"],
  },
  {
    title: "Kiểm kho",
    href: "/inventory/audit",
    group: "inventory",
    roles: ["ADMIN", "QUANLY", "QUANLY_CHINHANH", "NHANVIEN_KHO"],
  },

  {
    title: "Chi nhánh",
    href: "/system/branches",
    group: "system",
    roles: ["ADMIN"],
  },
  {
    title: "Nhân viên",
    href: "/system/employees",
    group: "system",
    roles: ["ADMIN", "QUANLY_CHINHANH"],
  },

  {
    title: "Báo cáo",
    href: "/reports",
    group: "report",
    roles: ["ADMIN", "QUANLY"],
  },
];

export const getRoutesByRole = (role?: UserRole) => {
  if (!role) return [];

  return appRoutes.filter((route) => route.roles.includes(role));
};

export const canAccessRoute = (
  role: UserRole | undefined,
  pathname: string,
) => {
  if (!role) return false;

  if (pathname === "/login") return true;

  const route = appRoutes.find((item) => item.href === pathname);

  if (!route) return true;

  return route.roles.includes(role);
};

export const getDefaultRouteByRole = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "/";

    case "QUANLY":
      return "/";

    case "NHANVIEN_KHO":
      return "/inventory/stock";

    case "QUANLY_CHINHANH":
      return "/manager";

    case "NHANVIEN_BANHANG":
      return "/pos";

    default:
      return "/login";
  }
};
