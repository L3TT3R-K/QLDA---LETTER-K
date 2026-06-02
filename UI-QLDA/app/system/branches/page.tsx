"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Plus,
  Pencil,
  X,
  MapPin,
  Trash2,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import api from "@/services/api";

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi: string;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface ApiBranch {
  maCN: string;
  tenCN: string;
  diaChi: string;
  trangThai?: number;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeBranch = (branch: ApiBranch): Branch | null => {
  const MaCN = branch.maCN;
  const TenCN = branch.tenCN;
  const DiaChi = branch.diaChi;

  if (!MaCN || !TenCN || !DiaChi) return null;

  return {
    MaCN,
    TenCN,
    DiaChi,
    TrangThai: Number(branch.trangThai ?? 1),
    CreatedAt: branch.createdAt,
    UpdatedAt: branch.updatedAt,
  };
};

const getNextBranchCode = (branches: Branch[]) => {
  const maxNumber = branches.reduce((max, branch) => {
    if (!branch.MaCN.startsWith("CN")) return max;

    const number = Number(branch.MaCN.replace("CN", ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `CN${String(maxNumber + 1).padStart(2, "0")}`;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);

  const [formData, setFormData] = useState({
    TenCN: "",
    DiaChi: "",
    TrangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    void loadBranches();
  }, []);

  const getApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) return "Có lỗi xảy ra. Vui lòng thử lại.";

    const data = error.response?.data;

    if (typeof data === "string") return data;
    if (data && typeof data.message === "string") return data.message;

    return "Không thể kết nối đến hệ thống. Vui lòng thử lại.";
  };

  const loadBranches = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get<ApiBranch[]>("/api/chinhanh");
      const normalizedBranches = (Array.isArray(response.data) ? response.data : [])
        .map(normalizeBranch)
        .filter((item): item is Branch => item !== null);

      setBranches(normalizedBranches);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      const matchesSearch =
        branch.TenCN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.MaCN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.DiaChi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && branch.TrangThai === 1) ||
        (statusFilter === "inactive" && branch.TrangThai === 0);

      return matchesSearch && matchesStatus;
    });
  }, [branches, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBranches.length / pageSize);

  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = branches.filter(
    (branch) => branch.TrangThai === 1,
  ).length;
  const inactiveCount = branches.filter(
    (branch) => branch.TrangThai === 0,
  ).length;

  const resetForm = () => {
    setFormData({
      TenCN: "",
      DiaChi: "",
      TrangThai: 1,
    });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingItem(branch);
    setFormData({
      TenCN: branch.TenCN,
      DiaChi: branch.DiaChi,
      TrangThai: branch.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    const tenCN = formData.TenCN.trim();
    const diaChi = formData.DiaChi.trim();

    if (!tenCN || !diaChi) {
      alert("Vui lòng nhập đầy đủ tên chi nhánh và địa chỉ");
      return;
    }

    const duplicatedName = branches.some((branch) => {
      const isSameName =
        branch.TenCN.trim().toLowerCase() === tenCN.toLowerCase();
      const isDifferentBranch =
        !editingItem || branch.MaCN !== editingItem.MaCN;

      return isSameName && isDifferentBranch;
    });

    if (duplicatedName) {
      alert("Tên chi nhánh đã tồn tại");
      return;
    }

    setIsSaving(true);

    try {
      if (editingItem) {
        await api.put(`/api/chinhanh/${editingItem.MaCN}`, {
          maCN: editingItem.MaCN,
          tenCN,
          diaChi,
          trangThai: formData.TrangThai,
        });
      } else {
        await api.post("/api/chinhanh", {
          maCN: getNextBranchCode(branches),
          tenCN,
          diaChi,
          trangThai: formData.TrangThai,
        });
        setCurrentPage(1);
      }

      await loadBranches();
      handleCloseDrawer();
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      await api.put(`/api/chinhanh/${branch.MaCN}`, {
        maCN: branch.MaCN,
        tenCN: branch.TenCN,
        diaChi: branch.DiaChi,
        trangThai: branch.TrangThai === 1 ? 0 : 1,
      });

      await loadBranches();
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  const handleDelete = async (MaCN: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn ngưng hoạt động chi nhánh này không?",
    );

    if (!isConfirmed) return;

    try {
      await api.delete(`/api/chinhanh/${MaCN}`);
      await loadBranches();
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
  };

  return (
    <MainLayout
      title="Quản lý chi nhánh"
      breadcrumb="Trang chủ / Hệ thống / Chi nhánh"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng chi nhánh</p>
                <p className="text-2xl font-bold text-foreground">
                  {branches.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang hoạt động</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tạm đóng</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm kiếm chi nhánh..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Tạm đóng</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm chi nhánh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {errorMessage && (
            <div className="col-span-2 rounded-lg bg-[#F8D7DA] p-4 text-sm text-[#842029] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              {errorMessage}
            </div>
          )}

          {isLoading && (
            <div className="col-span-2 rounded-lg bg-card p-6 text-center text-sm text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              Đang tải danh sách chi nhánh...
            </div>
          )}

          {paginatedBranches.map((branch) => (
            <div
              key={branch.MaCN}
              className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-primary">
                    {branch.MaCN}
                  </span>

                  <h3 className="text-base font-semibold text-foreground">
                    {branch.TenCN}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      branch.TrangThai === 1
                        ? "bg-[#D1E7DD] text-[#198754]"
                        : "bg-[#E2E3E5] text-[#383D41]",
                    )}
                  >
                    {branch.TrangThai === 1 ? "Hoạt động" : "Tạm đóng"}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(branch)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(branch.MaCN)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{branch.DiaChi}</span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span>Trạng thái hoạt động</span>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={branch.TrangThai === 1}
                      onCheckedChange={() => handleToggleStatus(branch)}
                    />

                    <span className="text-xs">
                      {branch.TrangThai === 1 ? "Bật" : "Tắt"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && !errorMessage && paginatedBranches.length === 0 && (
            <div className="col-span-2 rounded-lg bg-card p-6 text-center text-sm text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              Không có chi nhánh phù hợp
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <p className="text-sm text-muted-foreground">
            Hiển thị{" "}
            {filteredBranches.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            –{Math.min(currentPage * pageSize, filteredBranches.length)} trong{" "}
            {filteredBranches.length} chi nhánh
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

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseDrawer}
          />

          <div className="relative z-10 flex h-full w-[420px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
              </h3>

              <button
                onClick={handleCloseDrawer}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {editingItem && (
                <div>
                  <Label>Mã chi nhánh</Label>

                  <Input value={editingItem.MaCN} disabled className="mt-1.5" />
                </div>
              )}

              <div>
                <Label>Tên chi nhánh *</Label>

                <Input
                  value={formData.TenCN}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TenCN: event.target.value,
                    })
                  }
                  placeholder="Nhập tên chi nhánh"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Địa chỉ *</Label>

                <Textarea
                  value={formData.DiaChi}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      DiaChi: event.target.value,
                    })
                  }
                  placeholder="Nhập địa chỉ chi nhánh"
                  className="mt-1.5"
                  rows={4}
                />
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

                <Label>Hoạt động</Label>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Khi thêm mới, hệ thống sẽ tự tạo mã chi nhánh dạng{" "}
                <span className="font-medium text-foreground">
                  CN01, CN02, CN03...
                </span>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCloseDrawer}
              >
                Hủy
              </Button>

              <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
