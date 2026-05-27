"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Pencil, X, Trash2, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Supplier {
  MaNCC: string;
  TenNCC: string;
  Sdt?: string;
  DiaChi?: string;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface ApiSupplier {
  maNCC: string;
  tenNCC: string;
  sdt?: string;
  diaChi?: string;
  trangThai?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

const storageKey = "NHACUNGCAP";

const initialSuppliers: Supplier[] = [
  {
    MaNCC: "NCC001",
    TenNCC: "Công ty CP Cà phê Trung Nguyên",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNCC: "NCC002",
    TenNCC: "Dairy Farm Việt Nam",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNCC: "NCC003",
    TenNCC: "Công ty TNHH Đường Biên Hòa",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNCC: "NCC004",
    TenNCC: "Topping House",
    TrangThai: 0,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNCC: "NCC005",
    TenNCC: "Trà Thái Nguyên Premium",
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

const isActiveStatus = (value: string | number | undefined) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "number") return value === 1;

  const normalized = value.trim().toLowerCase();

  return ["1", "active", "hoat_dong", "hoạt động", "đang hoạt động"].includes(
    normalized,
  );
};

const mapApiSupplier = (supplier: ApiSupplier): Supplier => ({
  MaNCC: supplier.maNCC,
  TenNCC: supplier.tenNCC,
  Sdt: supplier.sdt,
  DiaChi: supplier.diaChi,
  TrangThai: isActiveStatus(supplier.trangThai) ? 1 : 0,
  CreatedAt: supplier.createdAt,
  UpdatedAt: supplier.updatedAt,
});

const toApiStatus = (status: number) => {
  return status === 1 ? "Hoạt động" : "Ngừng hoạt động";
};

const buildSupplierPayload = (supplier: {
  MaNCC?: string;
  TenNCC: string;
  Sdt?: string;
  DiaChi?: string;
  TrangThai: number;
}) => ({
  maNCC: supplier.MaNCC,
  tenNCC: supplier.TenNCC,
  sdt: supplier.Sdt,
  diaChi: supplier.DiaChi,
  trangThai: toApiStatus(supplier.TrangThai),
});

const normalizeSupplier = (supplier: Partial<Supplier>): Supplier | null => {
  const MaNCC = supplier.MaNCC;
  const TenNCC = supplier.TenNCC;

  if (!MaNCC || !TenNCC) return null;

  return {
    MaNCC,
    TenNCC,
    Sdt: supplier.Sdt,
    DiaChi: supplier.DiaChi,
    TrangThai: Number(supplier.TrangThai ?? 1),
    CreatedAt: supplier.CreatedAt,
    UpdatedAt: supplier.UpdatedAt,
  };
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    TenNCC: "",
    TrangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;

  const loadSuppliersFromStorage = () => {
    const storedSuppliers = getFromStorage<Partial<Supplier>>(storageKey, []);

    if (storedSuppliers.length > 0) {
      const normalizedSuppliers = storedSuppliers
        .map(normalizeSupplier)
        .filter((item): item is Supplier => item !== null);

      if (normalizedSuppliers.length > 0) {
        setSuppliers(normalizedSuppliers);
        return normalizedSuppliers;
      }
    }

    saveToStorage(storageKey, initialSuppliers);
    setSuppliers(initialSuppliers);

    return initialSuppliers;
  };

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiSupplier[]>("/api/nhacungcap", {
        params: { includeInactive: true },
      });
      const nextSuppliers = Array.isArray(response.data)
        ? response.data.map(mapApiSupplier)
        : [];

      setSuppliers(nextSuppliers);
      saveToStorage(storageKey, nextSuppliers);
    } catch (error: any) {
      loadSuppliersFromStorage();
      const message =
        error?.response?.data?.message ||
        "Không tải được danh sách nhà cung cấp từ backend";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const replaceSupplier = (supplier: Supplier) => {
    setSuppliers((current) => {
      const exists = current.some((item) => item.MaNCC === supplier.MaNCC);
      const nextSuppliers = exists
        ? current.map((item) =>
            item.MaNCC === supplier.MaNCC ? supplier : item,
          )
        : [...current, supplier];

      saveToStorage(storageKey, nextSuppliers);

      return nextSuppliers;
    });
  };

  const loadSupplierDetail = async (maNCC: string) => {
    const response = await api.get<ApiSupplier>(`/api/nhacungcap/${maNCC}`);
    const supplier = mapApiSupplier(response.data);

    replaceSupplier(supplier);

    return supplier;
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.TenNCC.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.MaNCC.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && supplier.TrangThai === 1) ||
        (statusFilter === "inactive" && supplier.TrangThai === 0);

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);

  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = suppliers.filter(
    (supplier) => supplier.TrangThai === 1,
  ).length;

  const inactiveCount = suppliers.filter(
    (supplier) => supplier.TrangThai === 0,
  ).length;

  const resetForm = () => {
    setFormData({
      TenNCC: "",
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

  const handleOpenEdit = async (supplier: Supplier) => {
    let supplierDetail = supplier;

    try {
      supplierDetail = await loadSupplierDetail(supplier.MaNCC);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không tải được chi tiết nhà cung cấp từ backend";
      alert(message);
    }

    setEditingItem(supplierDetail);
    setFormData({
      TenNCC: supplierDetail.TenNCC,
      TrangThai: supplierDetail.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    const tenNCC = formData.TenNCC.trim();

    if (!tenNCC) {
      alert("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    const duplicatedName = suppliers.some((supplier) => {
      const isSameName =
        supplier.TenNCC.trim().toLowerCase() === tenNCC.toLowerCase();

      const isDifferentSupplier =
        !editingItem || supplier.MaNCC !== editingItem.MaNCC;

      return isSameName && isDifferentSupplier;
    });

    if (duplicatedName) {
      alert("Tên nhà cung cấp đã tồn tại");
      return;
    }

    const payload = buildSupplierPayload({
      MaNCC: editingItem?.MaNCC,
      TenNCC: tenNCC,
      Sdt: editingItem?.Sdt,
      DiaChi: editingItem?.DiaChi,
      TrangThai: formData.TrangThai,
    });

    try {
      setIsSubmitting(true);

      if (editingItem) {
        const response = await api.put<ApiSupplier>(
          `/api/nhacungcap/${editingItem.MaNCC}`,
          payload,
        );

        replaceSupplier(mapApiSupplier(response.data));
      } else {
        const response = await api.post<ApiSupplier>("/api/nhacungcap", {
          ...payload,
          maNCC: undefined,
        });

        replaceSupplier(mapApiSupplier(response.data));
        setCurrentPage(1);
      }

      closeDrawer();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        (editingItem
          ? "Không cập nhật được nhà cung cấp"
          : "Không tạo được nhà cung cấp");
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (MaNCC: string) => {
    const supplier = suppliers.find((item) => item.MaNCC === MaNCC);

    if (!supplier) return;

    const nextSupplier = {
      ...supplier,
      TrangThai: supplier.TrangThai === 1 ? 0 : 1,
    };

    try {
      const response = await api.put<ApiSupplier>(
        `/api/nhacungcap/${MaNCC}`,
        buildSupplierPayload(nextSupplier),
      );

      replaceSupplier(mapApiSupplier(response.data));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không cập nhật được trạng thái nhà cung cấp";
      alert(message);
    }
  };

  const handleDelete = async (MaNCC: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn ngừng hợp tác với nhà cung cấp này không?",
    );

    if (!isConfirmed) return;

    try {
      await api.delete(`/api/nhacungcap/${MaNCC}`);
      await loadSuppliers();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không ngừng hợp tác được nhà cung cấp";
      alert(message);
    }
  };

  return (
    <MainLayout
      title="Quản lý nhà cung cấp"
      breadcrumb="Trang chủ / Danh mục / Nhà cung cấp"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng nhà cung cấp
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {suppliers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang hợp tác</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Ngừng hợp tác</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm kiếm nhà cung cấp..."
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hợp tác</SelectItem>
              <SelectItem value="inactive">Ngừng hợp tác</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm nhà cung cấp
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã NCC
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tên nhà cung cấp
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
                {paginatedSuppliers.map((supplier) => (
                  <tr key={supplier.MaNCC} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {supplier.MaNCC}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {supplier.TenNCC}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={supplier.TrangThai === 1}
                          onCheckedChange={() =>
                            handleToggleStatus(supplier.MaNCC)
                          }
                        />

                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-1 text-xs font-medium",
                            supplier.TrangThai === 1
                              ? "bg-[#D1E7DD] text-[#198754]"
                              : "bg-[#E2E3E5] text-[#383D41]",
                          )}
                        >
                          {supplier.TrangThai === 1
                            ? "Đang hợp tác"
                            : "Ngừng hợp tác"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(supplier)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(supplier.MaNCC)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedSuppliers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      {isLoading
                        ? "Đang tải danh sách nhà cung cấp..."
                        : "Không có nhà cung cấp phù hợp"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredSuppliers.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredSuppliers.length)}{" "}
              trong {filteredSuppliers.length} nhà cung cấp
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

          <div className="relative z-10 flex h-full w-[420px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp"}
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
                  <Label>Mã nhà cung cấp</Label>

                  <Input
                    value={editingItem.MaNCC}
                    disabled
                    className="mt-1.5"
                  />
                </div>
              )}

              <div>
                <Label>Tên nhà cung cấp *</Label>

                <Input
                  value={formData.TenNCC}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TenNCC: event.target.value,
                    })
                  }
                  placeholder="Nhập tên nhà cung cấp"
                  className="mt-1.5"
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

                <Label>Đang hợp tác</Label>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Khi thêm mới, hệ thống sẽ tự tạo mã nhà cung cấp dạng{" "}
                <span className="font-medium text-foreground">
                  NCC001, NCC002, NCC003...
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

              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
