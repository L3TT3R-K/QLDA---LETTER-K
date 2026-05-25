"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Pencil, X, Trash2, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Employee {
  MaNV: string;
  Username: string;
  PasswordHash: string;
  TenNV: string;
  ChucVu: string;
  MaCN: string | null;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

const employeeStorageKey = "NHANVIEN";
const branchStorageKey = "CHINHANH";

const roleOptions = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "QUANLY_CHINHANH", label: "Quản lý chi nhánh" },
  { value: "NHANVIEN_BANHANG", label: "Nhân viên bán hàng" },
  { value: "PHA_CHE", label: "Pha chế" },
  { value: "NHANVIEN_KHO", label: "Nhân viên kho" },
  { value: "KETOAN", label: "Kế toán" },
];

const initialBranches: Branch[] = [
  {
    MaCN: "CN01",
    TenCN: "Phụng Lộc Coffee - Quận 1",
    DiaChi: "12 Nguyễn Huệ, Quận 1, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN02",
    TenCN: "Phụng Lộc Coffee - Quận 3",
    DiaChi: "25 Võ Văn Tần, Quận 3, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN03",
    TenCN: "Phụng Lộc Coffee - Bình Thạnh",
    DiaChi: "88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN04",
    TenCN: "Phụng Lộc Coffee - Thủ Đức",
    DiaChi: "45 Võ Văn Ngân, Thủ Đức, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN05",
    TenCN: "Phụng Lộc Coffee - Gò Vấp",
    DiaChi: "102 Phan Văn Trị, Gò Vấp, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN06",
    TenCN: "Phụng Lộc Coffee - Tân Bình",
    DiaChi: "70 Cộng Hòa, Tân Bình, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN07",
    TenCN: "Phụng Lộc Coffee - Quận 7",
    DiaChi: "15 Nguyễn Thị Thập, Quận 7, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN08",
    TenCN: "Phụng Lộc Coffee - Phú Nhuận",
    DiaChi: "33 Phan Đăng Lưu, Phú Nhuận, TP.HCM",
    TrangThai: 0,
  },
];

const initialEmployees: Employee[] = [
  {
    MaNV: "NV001",
    Username: "admin",
    PasswordHash: "123456",
    TenNV: "Nguyễn Văn An",
    ChucVu: "ADMIN",
    MaCN: null,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV002",
    Username: "binhtt",
    PasswordHash: "123456",
    TenNV: "Trần Thị Bình",
    ChucVu: "QUANLY_CHINHANH",
    MaCN: "CN01",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV003",
    Username: "cuonglv",
    PasswordHash: "123456",
    TenNV: "Lê Văn Cường",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN01",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV004",
    Username: "dungpt",
    PasswordHash: "123456",
    TenNV: "Phạm Thị Dung",
    ChucVu: "PHA_CHE",
    MaCN: "CN01",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV005",
    Username: "emhv",
    PasswordHash: "123456",
    TenNV: "Hoàng Văn Em",
    ChucVu: "NHANVIEN_KHO",
    MaCN: "CN01",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV006",
    Username: "hoadt",
    PasswordHash: "123456",
    TenNV: "Đỗ Thị Hoa",
    ChucVu: "QUANLY_CHINHANH",
    MaCN: "CN02",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV007",
    Username: "khangvv",
    PasswordHash: "123456",
    TenNV: "Võ Văn Khang",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN02",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNV: "NV008",
    Username: "lannt",
    PasswordHash: "123456",
    TenNV: "Ngô Thị Lan",
    ChucVu: "KETOAN",
    MaCN: null,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
];

const getFromStorage = <T,>(key: string, fallback: T[]): T[] => {
  if (typeof window === "undefined") return fallback;

  const data = localStorage.getItem(key);

  if (!data) return fallback;

  try {
    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const normalizeEmployee = (employee: Partial<Employee>): Employee | null => {
  const MaNV = employee.MaNV;
  const Username = employee.Username;
  const TenNV = employee.TenNV;
  const ChucVu = employee.ChucVu;

  if (!MaNV || !Username || !TenNV || !ChucVu) return null;

  return {
    MaNV,
    Username,
    PasswordHash: employee.PasswordHash || "",
    TenNV,
    ChucVu,
    MaCN: employee.MaCN ?? null,
    TrangThai: Number(employee.TrangThai ?? 1),
    CreatedAt: employee.CreatedAt,
    UpdatedAt: employee.UpdatedAt,
  };
};

const normalizeBranch = (branch: Partial<Branch>): Branch | null => {
  const MaCN = branch.MaCN;
  const TenCN = branch.TenCN;

  if (!MaCN || !TenCN) return null;

  return {
    MaCN,
    TenCN,
    DiaChi: branch.DiaChi,
    TrangThai: Number(branch.TrangThai ?? 1),
  };
};

const getNextEmployeeCode = (employees: Employee[]) => {
  const maxNumber = employees.reduce((max, employee) => {
    if (!employee.MaNV.startsWith("NV")) return max;

    const number = Number(employee.MaNV.replace("NV", ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `NV${String(maxNumber + 1).padStart(3, "0")}`;
};

const getRoleLabel = (role: string) => {
  return roleOptions.find((item) => item.value === role)?.label || role;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    Username: "",
    PasswordHash: "",
    TenNV: "",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN01",
    TrangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const storedEmployees = getFromStorage<Partial<Employee>>(
      employeeStorageKey,
      [],
    );

    if (storedEmployees.length > 0) {
      const normalizedEmployees = storedEmployees
        .map(normalizeEmployee)
        .filter((item): item is Employee => item !== null);

      if (normalizedEmployees.length > 0) {
        setEmployees(normalizedEmployees);
      } else {
        saveToStorage(employeeStorageKey, initialEmployees);
      }
    } else {
      saveToStorage(employeeStorageKey, initialEmployees);
    }

    const storedBranches = getFromStorage<Partial<Branch>>(
      branchStorageKey,
      [],
    );

    if (storedBranches.length > 0) {
      const normalizedBranches = storedBranches
        .map(normalizeBranch)
        .filter((item): item is Branch => item !== null);

      if (normalizedBranches.length > 0) {
        setBranches(normalizedBranches);
      } else {
        saveToStorage(branchStorageKey, initialBranches);
      }
    } else {
      saveToStorage(branchStorageKey, initialBranches);
    }
  }, []);

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const branchName =
        branches.find((branch) => branch.MaCN === employee.MaCN)?.TenCN || "";

      const matchesSearch =
        employee.TenNV.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.MaNV.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.Username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branchName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || employee.ChucVu === roleFilter;

      const matchesBranch =
        branchFilter === "all" || employee.MaCN === branchFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.TrangThai === 1) ||
        (statusFilter === "inactive" && employee.TrangThai === 0);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [
    employees,
    branches,
    searchQuery,
    roleFilter,
    branchFilter,
    statusFilter,
  ]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = employees.filter(
    (employee) => employee.TrangThai === 1,
  ).length;
  const inactiveCount = employees.filter(
    (employee) => employee.TrangThai === 0,
  ).length;
  const managerCount = employees.filter(
    (employee) =>
      employee.ChucVu === "QUANLY_CHINHANH" || employee.ChucVu === "ADMIN",
  ).length;

  const getBranchName = (MaCN: string | null) => {
    if (!MaCN) return "Toàn hệ thống";

    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const resetForm = () => {
    setFormData({
      Username: "",
      PasswordHash: "",
      TenNV: "",
      ChucVu: "NHANVIEN_BANHANG",
      MaCN: "CN01",
      TrangThai: 1,
    });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setEditingItem(employee);
    setFormData({
      Username: employee.Username,
      PasswordHash: employee.PasswordHash,
      TenNV: employee.TenNV,
      ChucVu: employee.ChucVu,
      MaCN: employee.MaCN || "ALL",
      TrangThai: employee.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const persistEmployees = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    saveToStorage(employeeStorageKey, updatedEmployees);
  };

  const handleSave = () => {
    const username = formData.Username.trim();
    const password = formData.PasswordHash.trim();
    const tenNV = formData.TenNV.trim();

    if (!username || !tenNV || !formData.ChucVu) {
      alert("Vui lòng nhập đầy đủ username, họ tên và chức vụ");
      return;
    }

    if (!editingItem && !password) {
      alert("Vui lòng nhập mật khẩu khi thêm nhân viên mới");
      return;
    }

    const isSystemRole =
      formData.ChucVu === "ADMIN" || formData.ChucVu === "KETOAN";

    if (!isSystemRole && (!formData.MaCN || formData.MaCN === "ALL")) {
      alert("Vui lòng chọn chi nhánh cho nhân viên");
      return;
    }

    const duplicatedUsername = employees.some((employee) => {
      const isSameUsername =
        employee.Username.trim().toLowerCase() === username.toLowerCase();

      const isDifferentEmployee =
        !editingItem || employee.MaNV !== editingItem.MaNV;

      return isSameUsername && isDifferentEmployee;
    });

    if (duplicatedUsername) {
      alert("Username đã tồn tại");
      return;
    }

    const now = new Date().toISOString();
    const finalMaCN = isSystemRole ? null : formData.MaCN;

    if (editingItem) {
      const updatedEmployees = employees.map((employee) =>
        employee.MaNV === editingItem.MaNV
          ? {
              ...employee,
              Username: username,
              PasswordHash: password || employee.PasswordHash,
              TenNV: tenNV,
              ChucVu: formData.ChucVu,
              MaCN: finalMaCN,
              TrangThai: formData.TrangThai,
              UpdatedAt: now,
            }
          : employee,
      );

      persistEmployees(updatedEmployees);
    } else {
      const newEmployee: Employee = {
        MaNV: getNextEmployeeCode(employees),
        Username: username,
        PasswordHash: password,
        TenNV: tenNV,
        ChucVu: formData.ChucVu,
        MaCN: finalMaCN,
        TrangThai: formData.TrangThai,
        CreatedAt: now,
        UpdatedAt: now,
      };

      persistEmployees([...employees, newEmployee]);
      setCurrentPage(1);
    }

    closeDrawer();
  };

  const handleToggleStatus = (MaNV: string) => {
    const updatedEmployees = employees.map((employee) =>
      employee.MaNV === MaNV
        ? {
            ...employee,
            TrangThai: employee.TrangThai === 1 ? 0 : 1,
            UpdatedAt: new Date().toISOString(),
          }
        : employee,
    );

    persistEmployees(updatedEmployees);
  };

  const handleDelete = (MaNV: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn cập nhật nhân viên này thành đã nghỉ không?",
    );

    if (!isConfirmed) return;

    const updatedEmployees = employees.map((employee) =>
      employee.MaNV === MaNV
        ? {
            ...employee,
            TrangThai: 0,
            UpdatedAt: new Date().toISOString(),
          }
        : employee,
    );

    persistEmployees(updatedEmployees);
  };

  return (
    <MainLayout
      title="Quản lý nhân viên"
      breadcrumb="Trang chủ / Hệ thống / Nhân viên"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-foreground">
                  {employees.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang làm</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đã nghỉ</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {inactiveCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Quản lý/Admin</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {managerCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm mã, username, họ tên, chi nhánh..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={roleFilter}
            onValueChange={(value) => {
              setRoleFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Chức vụ" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả chức vụ</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={branchFilter}
            onValueChange={(value) => {
              setBranchFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Chi nhánh" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.MaCN} value={branch.MaCN}>
                  {branch.TenCN}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang làm</SelectItem>
              <SelectItem value="inactive">Đã nghỉ</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã NV
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Username
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Họ tên
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chức vụ
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi nhánh
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginatedEmployees.map((employee) => (
                  <tr key={employee.MaNV} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {employee.MaNV}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {employee.Username}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {employee.TenNV.split(" ").pop()?.charAt(0)}
                        </div>

                        <span className="text-sm font-medium text-foreground">
                          {employee.TenNV}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {getRoleLabel(employee.ChucVu)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getBranchName(employee.MaCN)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={employee.TrangThai === 1}
                          onCheckedChange={() =>
                            handleToggleStatus(employee.MaNV)
                          }
                        />

                        <span
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium",
                            employee.TrangThai === 1
                              ? "bg-[#D1E7DD] text-[#198754]"
                              : "bg-[#E2E3E5] text-[#383D41]",
                          )}
                        >
                          {employee.TrangThai === 1 ? "Đang làm" : "Đã nghỉ"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(employee)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(employee.MaNV)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có nhân viên phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredEmployees.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredEmployees.length)}{" "}
              trong {filteredEmployees.length} nhân viên
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Trước
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page ? "bg-primary text-white" : ""
                    }
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />

          <div className="relative z-10 flex h-full w-[430px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </h3>

              <button
                onClick={closeDrawer}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {editingItem && (
                <div>
                  <Label>Mã nhân viên</Label>

                  <Input value={editingItem.MaNV} disabled className="mt-1.5" />
                </div>
              )}

              <div>
                <Label>Username *</Label>

                <Input
                  value={formData.Username}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      Username: event.target.value,
                    })
                  }
                  placeholder="Nhập username"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>
                  {editingItem
                    ? "Mật khẩu mới, bỏ trống nếu không đổi"
                    : "Mật khẩu *"}
                </Label>

                <Input
                  type="password"
                  value={formData.PasswordHash}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      PasswordHash: event.target.value,
                    })
                  }
                  placeholder={
                    editingItem
                      ? "Không nhập nếu giữ mật khẩu cũ"
                      : "Nhập mật khẩu"
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Họ tên *</Label>

                <Input
                  value={formData.TenNV}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TenNV: event.target.value,
                    })
                  }
                  placeholder="Nhập họ tên"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Chức vụ *</Label>

                <Select
                  value={formData.ChucVu}
                  onValueChange={(value) => {
                    const isSystemRole =
                      value === "ADMIN" || value === "KETOAN";

                    setFormData({
                      ...formData,
                      ChucVu: value,
                      MaCN: isSystemRole
                        ? "ALL"
                        : formData.MaCN === "ALL"
                          ? "CN01"
                          : formData.MaCN,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>

                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Chi nhánh</Label>

                <Select
                  value={formData.MaCN}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      MaCN: value,
                    })
                  }
                  disabled={
                    formData.ChucVu === "ADMIN" || formData.ChucVu === "KETOAN"
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn chi nhánh" />
                  </SelectTrigger>

                  <SelectContent>
                    {(formData.ChucVu === "ADMIN" ||
                      formData.ChucVu === "KETOAN") && (
                      <SelectItem value="ALL">Toàn hệ thống</SelectItem>
                    )}

                    {activeBranches.map((branch) => (
                      <SelectItem key={branch.MaCN} value={branch.MaCN}>
                        {branch.TenCN}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.TrangThai === 1}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      TrangThai: checked ? 1 : 0,
                    })
                  }
                />

                <Label>Đang làm</Label>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Khi thêm mới, hệ thống sẽ tự tạo mã nhân viên dạng{" "}
                <span className="font-medium text-foreground">
                  NV001, NV002, NV003...
                </span>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDrawer}
              >
                Hủy
              </Button>

              <Button className="flex-1" onClick={handleSave}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
