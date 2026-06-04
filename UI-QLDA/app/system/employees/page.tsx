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


import api from "@/services/api";

interface Employee {
  maNV: string;
  username: string;
  tenNV: string;
  chucVu: string;
  tenChiNhanh: string | null; 
  trangThai: number;
}

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

const branchStorageKey = "CHINHANH";

const roleOptions = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "QUANLY", label: "Quản lý" },
  { value: "NHANVIEN_BANHANG", label: "Nhân viên bán hàng" },
  { value: "NHANVIEN_KHO", label: "Nhân viên kho" },
];

const initialBranches: Branch[] = [
  { MaCN: "CN01", TenCN: "Phụng Lộc Coffee - Quận 1", TrangThai: 1 },
  { MaCN: "CN02", TenCN: "Phụng Lộc Coffee - Quận 3", TrangThai: 1 },
];

const getNextEmployeeCode = (employees: Employee[]) => {
  const maxNumber = employees.reduce((max, employee) => {
    if (!employee.maNV.startsWith("NV")) return max;
    const number = Number(employee.maNV.replace("NV", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `NV${String(maxNumber + 1).padStart(3, "0")}`;
};

const getRoleLabel = (role: string) => {
  return roleOptions.find((item) => item.value === role)?.label || role;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/nhanvien");
      setEmployees(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhân viên:", error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get("/api/chinhanh");
      // Map lại dữ liệu từ Backend (maCN, tenCN) sang format Frontend đang dùng (MaCN, TenCN)
      const branchData = response.data.map((item: any) => ({
        MaCN: item.maCN || item.MaCN,
        TenCN: item.tenCN || item.TenCN,
        TrangThai: item.trangThai !== undefined ? item.trangThai : item.TrangThai
      }));
      setBranches(branchData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách chi nhánh:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchBranches(); // Gọi API lấy chi nhánh thật từ Database
  }, []);
  
  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.tenNV.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.maNV.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || employee.chucVu === roleFilter;

      // So khớp tên chi nhánh từ Backend với Filter
      const targetBranch = branches.find((b) => b.MaCN === branchFilter);
      const matchesBranch = branchFilter === "all" || employee.tenChiNhanh === targetBranch?.TenCN;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.trangThai === 1) ||
        (statusFilter === "inactive" && employee.trangThai === 0);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [employees, branches, searchQuery, roleFilter, branchFilter, statusFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = employees.filter((e) => e.trangThai === 1).length;
  const inactiveCount = employees.filter((e) => e.trangThai === 0).length;
  const managerCount = employees.filter((e) => e.chucVu === "QUANLY_CHINHANH" || e.chucVu === "ADMIN").length;

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

  const handleOpenEdit = async (employee: Employee) => {
    setEditingItem(employee);
    // Để có MaCN chuẩn cho việc Edit, ta cần map ngược từ Tên Chi Nhánh
    const branch = branches.find((b) => b.TenCN === employee.tenChiNhanh);
    
    setFormData({
      Username: employee.username,
      PasswordHash: "", // Bỏ trống, Backend xử lý giữ nguyên Pass nếu rỗng
      TenNV: employee.tenNV,
      ChucVu: employee.chucVu,
      MaCN: branch ? branch.MaCN : "ALL",
      TrangThai: employee.trangThai,
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
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

    const isSystemRole = formData.ChucVu === "ADMIN";
    const finalMaCN = isSystemRole ? null : formData.MaCN;

    // Chuẩn bị gói dữ liệu gửi cho Spring Boot
    const payload = {
      maNV: editingItem ? editingItem.maNV : getNextEmployeeCode(employees),
      username: username,
      password: password, 
      tenNV: tenNV,
      chucVu: formData.ChucVu,
      maCN: finalMaCN,
      trangThai: formData.TrangThai,
    };

    try {
      if (editingItem) {
        await api.put(`/api/nhanvien/${editingItem.maNV}`, payload);
      } else {
        await api.post("/api/nhanvien", payload);
      }
      await fetchEmployees(); // Tải lại dữ liệu mới nhất
      closeDrawer();
    } catch (error: any) {
      // Hiển thị lỗi do Backend ném ra (ví dụ trùng Username)
      alert(error.response?.data || "Có lỗi xảy ra khi lưu nhân viên");
    }
  };

  const handleToggleStatus = async (maNV: string, currentStatus: number) => {
    try {
      // 1. Lấy chi tiết để lấy mã chi nhánh cũ
      const empRes = await api.get(`/api/nhanvien/${maNV}`);
      const emp = empRes.data;

      // 2. Gửi lệnh cập nhật đảo trạng thái
      const payload = {
        maNV: emp.maNV,
        username: emp.username,
        tenNV: emp.tenNV,
        chucVu: emp.chucVu,
        maCN: emp.tenChiNhanh, // Service getById đang map MaCN vào trường này
        trangThai: currentStatus === 1 ? 0 : 1,
      };

      await api.put(`/api/nhanvien/${maNV}`, payload);
      await fetchEmployees();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  const handleDelete = async (maNV: string) => {
    if (!confirm("Bạn có chắc muốn cập nhật nhân viên này thành đã nghỉ không?")) return;
    try {
      await api.delete(`/api/nhanvien/${maNV}`);
      await fetchEmployees();
    } catch (error: any) {
      alert("Lỗi: " + error.response?.data);
    }
  };

  return (
    <MainLayout
      title="Quản lý nhân viên"
      breadcrumb="Trang chủ / Hệ thống / Nhân viên"
    >
      <div className="space-y-4">
        {/* THỐNG KÊ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang làm</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">{activeCount}</p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đã nghỉ</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{inactiveCount}</p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Quản lý/Admin</p>
            <p className="mt-1 text-2xl font-bold text-primary">{managerCount}</p>
          </div>
        </div>

        {/* BỘ LỌC TÌM KIẾM */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm mã, username, họ tên..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[190px]"><SelectValue placeholder="Chức vụ" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chức vụ</SelectItem>
              {roleOptions.map((role) => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.MaCN} value={branch.MaCN}>{branch.TenCN}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
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

        {/* BẢNG DỮ LIỆU */}
        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã NV</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chức vụ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chi nhánh</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginatedEmployees.map((employee) => (
                  <tr key={employee.maNV} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{employee.maNV}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{employee.username}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                          {employee.tenNV.split(" ").pop()?.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-foreground">{employee.tenNV}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {getRoleLabel(employee.chucVu)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {employee.tenChiNhanh || "Toàn hệ thống"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={employee.trangThai === 1}
                          onCheckedChange={() => handleToggleStatus(employee.maNV, employee.trangThai)}
                        />
                        <span
                          className={cn(
                            "rounded-md px-2 py-1 text-xs font-medium",
                            employee.trangThai === 1 ? "bg-[#D1E7DD] text-[#198754]" : "bg-[#E2E3E5] text-[#383D41]"
                          )}
                        >
                          {employee.trangThai === 1 ? "Đang làm" : "Đã nghỉ"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenEdit(employee)} className="text-muted-foreground hover:text-primary">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(employee.maNV)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Không có nhân viên phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DRAWER THÊM/SỬA */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <div className="relative z-10 flex h-full w-[430px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">{editingItem ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</h3>
              <button onClick={closeDrawer} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {editingItem && (
                <div>
                  <Label>Mã nhân viên</Label>
                  <Input value={editingItem.maNV} disabled className="mt-1.5" />
                </div>
              )}
              <div>
                <Label>Username *</Label>
                <Input
                  value={formData.Username}
                  onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                  placeholder="Nhập username"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{editingItem ? "Mật khẩu mới, bỏ trống nếu không đổi" : "Mật khẩu *"}</Label>
                <Input
                  type="password"
                  value={formData.PasswordHash}
                  onChange={(e) => setFormData({ ...formData, PasswordHash: e.target.value })}
                  placeholder={editingItem ? "Không nhập nếu giữ mật khẩu cũ" : "Nhập mật khẩu"}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Họ tên *</Label>
                <Input
                  value={formData.TenNV}
                  onChange={(e) => setFormData({ ...formData, TenNV: e.target.value })}
                  placeholder="Nhập họ tên"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Chức vụ *</Label>
                <Select
                  value={formData.ChucVu}
                  onValueChange={(value) => {
                    const isSystemRole = value === "ADMIN";
                    setFormData({
                      ...formData,
                      ChucVu: value,
                      MaCN: isSystemRole ? "ALL" : formData.MaCN === "ALL" ? "CN01" : formData.MaCN,
                    });
                  }}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chi nhánh</Label>
                <Select
                  value={formData.MaCN}
                  onValueChange={(value) => setFormData({ ...formData, MaCN: value })}
                  disabled={formData.ChucVu === "ADMIN"}
                >
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                  <SelectContent>
                    {(formData.ChucVu === "ADMIN") && (
                      <SelectItem value="ALL">Toàn hệ thống</SelectItem>
                    )}
                    {activeBranches.map((branch) => (
                      <SelectItem key={branch.MaCN} value={branch.MaCN}>{branch.TenCN}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.TrangThai === 1}
                  onCheckedChange={(checked) => setFormData({ ...formData, TrangThai: checked ? 1 : 0 })}
                />
                <Label>Đang làm</Label>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border p-4">
              <Button variant="outline" className="flex-1" onClick={closeDrawer}>Hủy</Button>
              <Button className="flex-1" onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}