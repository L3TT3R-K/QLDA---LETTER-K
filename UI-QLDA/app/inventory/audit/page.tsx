"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Download, X, RefreshCw, ClipboardCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import api from "@/services/api";

// --- INTERFACES (Đã đồng bộ theo DTO Backend) ---
interface AuditRow {
  maKK: string;
  ngayKiem: string;
  maNL: string;
  tenNL: string;
  donVi: string;
  soLuongHeThong: number;
  soLuongThucTe: number;
  chenhLech: number;
  phanTramSaiLech: number;
  maCN?: string;
  tenChiNhanh: string;
  tenNhanVien: string;
  isSynced: boolean;
}

interface AuditFormItem {
  maNL: string;
  soLuongHeThong: number;
  soLuongThucTe: number;
  ghiChu: string;
}

interface Branch { MaCN: string; TenCN: string; TrangThai: number; }
interface Employee { MaNV: string; TenNV: string; MaCN: string | null; TrangThai: number; }
interface Ingredient { MaNL: string; TenNL: string; DonViCoBan: string; }
interface ApiBranch { maCN: string; tenCN: string; trangThai?: number | boolean; }
interface ApiEmployee { maNV: string; tenNV: string; maCN?: string | null; trangThai?: number | boolean; }
interface ApiIngredient { maNL: string; tenNL: string; donViCoBan?: string; tenDonVi?: string; }

const statusConfig = {
  COMPLETED: { label: "Hoàn tất", className: "bg-[#D1E7DD] text-[#198754]" },
};

const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

const formatDateTime = (value: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};

const toInputDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isActiveStatus = (value: number | boolean | undefined) =>
  value === undefined || value === true || value === 1;

const mapApiBranch = (branch: ApiBranch): Branch => ({
  MaCN: branch.maCN,
  TenCN: branch.tenCN,
  TrangThai: isActiveStatus(branch.trangThai) ? 1 : 0,
});

const mapApiEmployee = (employee: ApiEmployee): Employee => ({
  MaNV: employee.maNV,
  TenNV: employee.tenNV,
  MaCN: employee.maCN ?? null,
  TrangThai: isActiveStatus(employee.trangThai) ? 1 : 0,
});

const mapApiIngredient = (ingredient: ApiIngredient): Ingredient => ({
  MaNL: ingredient.maNL,
  TenNL: ingredient.tenNL,
  DonViCoBan: ingredient.donViCoBan || ingredient.tenDonVi || "",
});

export default function InventoryAuditPage() {
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [auditDate, setAuditDate] = useState(toInputDateTime(new Date()));
  const [auditItems, setAuditItems] = useState<AuditFormItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const pageSize = 10;

  // ----------------------------------------------------------------
  // DERIVED: phân quyền
  // ----------------------------------------------------------------
  const isBranchRestricted =
    currentUser?.chucVu === "NHANVIEN_KHO" ||
    currentUser?.chucVu === "QUANLY_CHINHANH";

  // Danh sách chi nhánh active — manager/NV kho chỉ thấy chi nhánh của mình
  const activeBranches = branches.filter(
    (b) =>
      b.TrangThai === 1 &&
      (!isBranchRestricted || !currentUser?.maCN || b.MaCN === currentUser.maCN),
  );

  // Nhân viên thuộc chi nhánh đang chọn (hoặc không gắn chi nhánh)
  const activeEmployees = employees.filter(
    (e) => e.TrangThai === 1 && (e.MaCN === selectedBranch || e.MaCN === null),
  );

  // ----------------------------------------------------------------
  // API: lịch sử kiểm kho
  // ----------------------------------------------------------------
  const fetchAuditHistory = async () => {
    try {
      const user = getCurrentUser();
      // Nếu bị giới hạn chi nhánh → ép luôn maCN của user, bỏ qua branchFilter
      const effectiveMaCN =
        isBranchRestricted && user?.maCN ? user.maCN : branchFilter;
      const res = await api.get("/api/kiemkho", {
        params: effectiveMaCN !== "all" ? { maCN: effectiveMaCN } : undefined,
      });
      setAuditRows(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử kiểm kho:", error);
    }
  };

  // ----------------------------------------------------------------
  // API: danh mục cơ bản
  // ----------------------------------------------------------------
  const loadMasterData = async () => {
    const [branchesResult, employeesResult, ingredientsResult] =
      await Promise.allSettled([
        api.get<ApiBranch[]>("/api/chinhanh"),
        api.get<ApiEmployee[]>("/api/nhanvien"),
        api.get<ApiIngredient[]>("/api/nguyenlieu"),
      ]);

    if (branchesResult.status === "fulfilled" && Array.isArray(branchesResult.value.data)) {
      setBranches(branchesResult.value.data.map(mapApiBranch));
    }
    if (employeesResult.status === "fulfilled" && Array.isArray(employeesResult.value.data)) {
      setEmployees(employeesResult.value.data.map(mapApiEmployee));
    }
    if (ingredientsResult.status === "fulfilled" && Array.isArray(ingredientsResult.value.data)) {
      setIngredients(ingredientsResult.value.data.map(mapApiIngredient));
    }
  };

  // ----------------------------------------------------------------
  // EFFECTS
  // ----------------------------------------------------------------
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadMasterData();
    fetchAuditHistory();
  }, [branchFilter]);

  // Khi currentUser load xong: khóa cứng chi nhánh nếu bị restrict
  useEffect(() => {
    if (
      (currentUser?.chucVu !== "NHANVIEN_KHO" &&
        currentUser?.chucVu !== "QUANLY_CHINHANH") ||
      !currentUser.maCN
    ) return;

    setBranchFilter(currentUser.maCN);
    setSelectedBranch(currentUser.maCN);
  }, [currentUser]);

  // ----------------------------------------------------------------
  // API: tồn kho theo chi nhánh (dùng khi mở form)
  // ----------------------------------------------------------------
  const fetchInventoryForBranch = async (maCN: string) => {
    try {
      const res = await api.get(`/api/tonkho/${maCN}`);
      const items = res.data.map((tk: any) => ({
        maNL: tk.maNL,
        soLuongHeThong: tk.soLuongTon,
        soLuongThucTe: tk.soLuongTon, // Mặc định thực tế = hệ thống
        ghiChu: "",
      }));
      setAuditItems(items);
    } catch (error) {
      console.error("Lỗi tải tồn kho:", error);
      setAuditItems([]);
    }
  };

  // ----------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------
  const handleOpenCreate = () => {
    // Manager: luôn dùng chi nhánh của mình; admin: dùng chi nhánh đầu tiên trong list
    const defaultBranch =
      isBranchRestricted && currentUser?.maCN
        ? currentUser.maCN
        : activeBranches[0]?.MaCN || "";

    const defaultEmployee =
      currentUser?.maNV ||
      employees.find(
        (item) =>
          item.TrangThai === 1 &&
          (item.MaCN === defaultBranch || item.MaCN === null),
      )?.MaNV || "";

    setSelectedBranch(defaultBranch);
    setSelectedEmployee(defaultEmployee);
    setAuditDate(toInputDateTime(new Date()));
    if (defaultBranch) fetchInventoryForBranch(defaultBranch);
    setIsDrawerOpen(true);
  };

  const handleChangeBranch = (maCN: string) => {
    setSelectedBranch(maCN);
    const firstEmployee = employees.find(
      (item) => item.TrangThai === 1 && (item.MaCN === maCN || item.MaCN === null),
    );
    setSelectedEmployee(firstEmployee?.MaNV || "");
    fetchInventoryForBranch(maCN);
  };

  const updateActualStock = (maNL: string, value: number) => {
    setAuditItems(
      auditItems.map((item) =>
        item.maNL === maNL ? { ...item, soLuongThucTe: value } : item,
      ),
    );
  };

  const handleConfirmAudit = async () => {
    if (!selectedBranch || !selectedEmployee || !auditDate)
      return alert("Vui lòng chọn chi nhánh và nhân viên");
    if (auditItems.length === 0)
      return alert("Chi nhánh này chưa có dữ liệu tồn kho để kiểm");
    if (auditItems.some((item) => item.soLuongThucTe < 0 || Number.isNaN(item.soLuongThucTe)))
      return alert("Tồn thực tế phải là số >= 0");
    if (!confirm("Hệ thống sẽ cập nhật tồn kho theo số lượng thực tế bạn vừa đếm. Bạn chắc chắn chứ?"))
      return;

    const payload = {
      maCN: selectedBranch,
      maNV: selectedEmployee,
      isSynced: true,
      chiTiet: auditItems.map((item) => ({
        maNL: item.maNL,
        soLuongHeThong: item.soLuongHeThong,
        soLuongThucTe: item.soLuongThucTe,
        chenhLech: item.soLuongThucTe - item.soLuongHeThong,
      })),
    };

    try {
      await api.post("/api/kiemkho", payload);
      alert("Đã hoàn tất kiểm kho và cập nhật tồn kho!");
      setIsDrawerOpen(false);
      fetchAuditHistory();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu phiếu kiểm kho.");
      console.error(error);
    }
  };

  // ----------------------------------------------------------------
  // FILTER + PAGINATION
  // ----------------------------------------------------------------
  const filteredData = useMemo(() => {
    return auditRows.filter((item) => {
      const matchSearch =
        item.maKK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tenNL.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBranch =
        branchFilter === "all" ||
        item.maCN === branchFilter ||
        item.tenChiNhanh.includes(
          activeBranches.find((b) => b.MaCN === branchFilter)?.TenCN || "xxx",
        );
      return matchSearch && matchBranch;
    });
  }, [auditRows, searchQuery, branchFilter, activeBranches]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const getDifferenceColor = (diff: number, percent: number) =>
    diff === 0 ? "text-[#198754]" : Math.abs(percent) <= 5 ? "text-[#F4A261]" : "text-[#DC3545]";

  // Thống kê cards
  const totalReceiptsCount = new Set(auditRows.map((r) => r.maKK)).size;
  const totalDetailsCount = auditRows.length;
  const totalDiffCount = auditRows.filter((r) => r.chenhLech !== 0).length;

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  return (
    <MainLayout title="Kiểm kho" breadcrumb="Trang chủ / Kho nguyên liệu / Kiểm kho">
      <div className="space-y-4">

        {/* CARDS THỐNG KÊ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng phiếu kiểm</p>
                <p className="text-2xl font-bold">{totalReceiptsCount}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tổng dòng chi tiết</p>
            <p className="mt-1 text-2xl font-bold">{totalDetailsCount}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Dòng có chênh lệch</p>
            <p className="mt-1 text-2xl font-bold text-[#DC3545]">{totalDiffCount}</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          {/* Bộ lọc chi nhánh: ẩn với manager vì họ chỉ có 1 chi nhánh */}
          {!isBranchRestricted && (
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                {activeBranches.map((b) => (
                  <SelectItem key={b.MaCN} value={b.MaCN}>{b.TenCN}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm mã phiếu, nguyên liệu..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button variant="outline" className="gap-2" onClick={fetchAuditHistory}>
            <RefreshCw className="h-4 w-4" /> Làm mới
          </Button>
          <Button className="gap-2" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> Tạo phiếu kiểm
          </Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {[
                    "Mã phiếu", "Ngày kiểm", "Nguyên liệu", "Đơn vị",
                    "Tồn hệ thống", "Tồn thực tế", "Chênh lệch", "% Sai lệch",
                    "Chi nhánh", "Người kiểm", "Trạng thái",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedData.map((item, index) => (
                  <tr
                    key={`${item.maKK}-${item.maNL}-${index}`}
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{item.maKK}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDateTime(item.ngayKiem)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{item.tenNL}</p>
                      <p className="text-xs text-muted-foreground">{item.maNL}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.donVi}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatNumber(item.soLuongHeThong)}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatNumber(item.soLuongThucTe)}</td>
                    <td className={cn("px-4 py-3 text-right text-sm font-semibold", getDifferenceColor(item.chenhLech, item.phanTramSaiLech))}>
                      {item.chenhLech > 0 ? `+${formatNumber(item.chenhLech)}` : formatNumber(item.chenhLech)}
                    </td>
                    <td className={cn("px-4 py-3 text-right text-sm font-semibold", getDifferenceColor(item.chenhLech, item.phanTramSaiLech))}>
                      {item.phanTramSaiLech.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.tenChiNhanh}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.tenNhanVien}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-block rounded-md px-2 py-1 text-xs font-medium", statusConfig.COMPLETED.className)}>
                        {statusConfig.COMPLETED.label}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredData.length)} trong{" "}
              {filteredData.length} dòng
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline" size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-primary text-white" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline" size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TẠO PHIẾU KIỂM KHO */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative z-10 flex h-full w-[920px] flex-col bg-card shadow-xl">

            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Tạo phiếu kiểm kho</h3>
              <button onClick={() => setIsDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              <div className="grid grid-cols-2 gap-4">

                {/* Chi nhánh kiểm: khóa cứng với manager */}
                <div>
                  <Label>Chi nhánh kiểm *</Label>
                  <Select
                    value={selectedBranch}
                    onValueChange={handleChangeBranch}
                    disabled={isBranchRestricted}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeBranches.map((b) => (
                        <SelectItem key={b.MaCN} value={b.MaCN}>{b.TenCN}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Người kiểm: tự điền nếu là manager/NV kho */}
                <div>
                  <Label>Người kiểm *</Label>
                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                    disabled={isBranchRestricted}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees.map((e) => (
                        <SelectItem key={e.MaNV} value={e.MaNV}>{e.TenNV}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* BẢNG KIỂM KHO */}
              <div className="rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Nguyên liệu</th>
                      <th className="px-3 py-2 text-right text-xs text-muted-foreground">Tồn hệ thống</th>
                      <th className="px-3 py-2 text-right text-xs text-muted-foreground">Tồn đếm thực tế</th>
                      <th className="px-3 py-2 text-right text-xs text-muted-foreground">Chênh lệch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditItems.map((item) => {
                      const diff = item.soLuongThucTe - item.soLuongHeThong;
                      return (
                        <tr key={item.maNL}>
                          <td className="px-3 py-2">
                            <p className="text-sm font-medium">
                              {ingredients.find((i) => i.MaNL === item.maNL)?.TenNL || item.maNL}
                            </p>
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            {formatNumber(item.soLuongHeThong)}
                          </td>
                          <td className="px-3 py-2">
                            <Input
                              type="number"
                              min={0}
                              value={item.soLuongThucTe}
                              onChange={(e) =>
                                updateActualStock(item.maNL, Number(e.target.value) || 0)
                              }
                              className="text-right"
                            />
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2 text-right text-sm font-bold",
                              diff === 0 ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {diff > 0 ? `+${formatNumber(diff)}` : formatNumber(diff)}
                          </td>
                        </tr>
                      );
                    })}
                    {auditItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-sm text-muted-foreground">
                          Chưa có dữ liệu tồn kho cho chi nhánh này
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
              <Button onClick={handleConfirmAudit}>Chốt phiếu & Đồng bộ kho</Button>
            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}
