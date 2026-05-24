"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Pencil, X, Trash2, Ruler } from "lucide-react";
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

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

const storageKey = "DONVI";

const initialUnits: Unit[] = [
  {
    MaDV: "GRAM",
    TenDonVi: "Gram",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "KG",
    TenDonVi: "Kilogram",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "ML",
    TenDonVi: "Mililít",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "LIT",
    TenDonVi: "Lít",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "CAI",
    TenDonVi: "Cái",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "HOP",
    TenDonVi: "Hộp",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "CHAI",
    TenDonVi: "Chai",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "LON",
    TenDonVi: "Lon",
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaDV: "GOI",
    TenDonVi: "Gói",
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

const normalizeUnit = (unit: Partial<Unit>): Unit | null => {
  const MaDV = unit.MaDV;
  const TenDonVi = unit.TenDonVi;

  if (!MaDV || !TenDonVi) return null;

  return {
    MaDV,
    TenDonVi,
    TrangThai: Number(unit.TrangThai ?? 1),
    CreatedAt: unit.CreatedAt,
    UpdatedAt: unit.UpdatedAt,
  };
};

const normalizeCode = (value: string) => {
  return value.trim().toUpperCase().replace(/\s+/g, "_");
};

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Unit | null>(null);

  const [formData, setFormData] = useState({
    MaDV: "",
    TenDonVi: "",
    TrangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const storedUnits = getFromStorage<Partial<Unit>>(storageKey, []);

    if (storedUnits.length > 0) {
      const normalizedUnits = storedUnits
        .map(normalizeUnit)
        .filter((item): item is Unit => item !== null);

      if (normalizedUnits.length > 0) {
        setUnits(normalizedUnits);
        return;
      }
    }

    saveToStorage(storageKey, initialUnits);
  }, []);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.MaDV.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.TenDonVi.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && unit.TrangThai === 1) ||
        (statusFilter === "inactive" && unit.TrangThai === 0);

      return matchesSearch && matchesStatus;
    });
  }, [units, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredUnits.length / pageSize);

  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = units.filter((unit) => unit.TrangThai === 1).length;
  const inactiveCount = units.filter((unit) => unit.TrangThai === 0).length;

  const resetForm = () => {
    setFormData({
      MaDV: "",
      TenDonVi: "",
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

  const handleOpenEdit = (unit: Unit) => {
    setEditingItem(unit);
    setFormData({
      MaDV: unit.MaDV,
      TenDonVi: unit.TenDonVi,
      TrangThai: unit.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const persistUnits = (updatedUnits: Unit[]) => {
    setUnits(updatedUnits);
    saveToStorage(storageKey, updatedUnits);
  };

  const handleSave = () => {
    const maDV = normalizeCode(formData.MaDV);
    const tenDonVi = formData.TenDonVi.trim();

    if (!maDV || !tenDonVi) {
      alert("Vui lòng nhập đầy đủ mã đơn vị và tên đơn vị");
      return;
    }

    const duplicatedCode = units.some((unit) => {
      const isSameCode = unit.MaDV.trim().toLowerCase() === maDV.toLowerCase();
      const isDifferentUnit = !editingItem || unit.MaDV !== editingItem.MaDV;

      return isSameCode && isDifferentUnit;
    });

    if (duplicatedCode) {
      alert("Mã đơn vị đã tồn tại");
      return;
    }

    const duplicatedName = units.some((unit) => {
      const isSameName =
        unit.TenDonVi.trim().toLowerCase() === tenDonVi.toLowerCase();

      const isDifferentUnit = !editingItem || unit.MaDV !== editingItem.MaDV;

      return isSameName && isDifferentUnit;
    });

    if (duplicatedName) {
      alert("Tên đơn vị đã tồn tại");
      return;
    }

    const now = new Date().toISOString();

    if (editingItem) {
      const updatedUnits = units.map((unit) =>
        unit.MaDV === editingItem.MaDV
          ? {
              ...unit,
              TenDonVi: tenDonVi,
              TrangThai: formData.TrangThai,
              UpdatedAt: now,
            }
          : unit,
      );

      persistUnits(updatedUnits);
    } else {
      const newUnit: Unit = {
        MaDV: maDV,
        TenDonVi: tenDonVi,
        TrangThai: formData.TrangThai,
        CreatedAt: now,
        UpdatedAt: now,
      };

      persistUnits([...units, newUnit]);
      setCurrentPage(1);
    }

    closeDrawer();
  };

  const handleToggleStatus = (MaDV: string) => {
    const updatedUnits = units.map((unit) =>
      unit.MaDV === MaDV
        ? {
            ...unit,
            TrangThai: unit.TrangThai === 1 ? 0 : 1,
            UpdatedAt: new Date().toISOString(),
          }
        : unit,
    );

    persistUnits(updatedUnits);
  };

  const handleDelete = (MaDV: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn ngưng sử dụng đơn vị này không?",
    );

    if (!isConfirmed) return;

    const updatedUnits = units.map((unit) =>
      unit.MaDV === MaDV
        ? {
            ...unit,
            TrangThai: 0,
            UpdatedAt: new Date().toISOString(),
          }
        : unit,
    );

    persistUnits(updatedUnits);
  };

  const handleResetMockData = () => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn khôi phục dữ liệu đơn vị mẫu không?",
    );

    if (!isConfirmed) return;

    persistUnits(initialUnits);
    setCurrentPage(1);
  };

  return (
    <MainLayout
      title="Quản lý đơn vị"
      breadcrumb="Trang chủ / Danh mục / Đơn vị"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Ruler className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng đơn vị</p>
                <p className="text-2xl font-bold text-foreground">
                  {units.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang sử dụng</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Ngừng sử dụng</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm kiếm mã hoặc tên đơn vị..."
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
              <SelectItem value="active">Đang sử dụng</SelectItem>
              <SelectItem value="inactive">Ngừng sử dụng</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleResetMockData}>
            Khôi phục mẫu
          </Button>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm đơn vị
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã đơn vị
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tên đơn vị
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
                {paginatedUnits.map((unit) => (
                  <tr key={unit.MaDV} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {unit.MaDV}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {unit.TenDonVi}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={unit.TrangThai === 1}
                          onCheckedChange={() => handleToggleStatus(unit.MaDV)}
                        />

                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-1 text-xs font-medium",
                            unit.TrangThai === 1
                              ? "bg-[#D1E7DD] text-[#198754]"
                              : "bg-[#E2E3E5] text-[#383D41]",
                          )}
                        >
                          {unit.TrangThai === 1
                            ? "Đang sử dụng"
                            : "Ngừng sử dụng"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(unit)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(unit.MaDV)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedUnits.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có đơn vị phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredUnits.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredUnits.length)} trong{" "}
              {filteredUnits.length} đơn vị
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
                {editingItem ? "Chỉnh sửa đơn vị" : "Thêm đơn vị mới"}
              </h3>

              <button
                onClick={closeDrawer}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <Label>Mã đơn vị *</Label>

                <Input
                  value={formData.MaDV}
                  disabled={!!editingItem}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      MaDV: event.target.value,
                    })
                  }
                  placeholder="Ví dụ: GRAM, KG, ML"
                  className="mt-1.5"
                />

                {editingItem && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Không nên đổi mã đơn vị vì các bảng khác đang tham chiếu mã
                    này.
                  </p>
                )}
              </div>

              <div>
                <Label>Tên đơn vị *</Label>

                <Input
                  value={formData.TenDonVi}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TenDonVi: event.target.value,
                    })
                  }
                  placeholder="Nhập tên đơn vị"
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

                <Label>Đang sử dụng</Label>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Mã đơn vị nên dùng dạng cố định như{" "}
                <span className="font-medium text-foreground">
                  GRAM, KG, ML, LIT, CAI, HOP...
                </span>
                <br />
                Màn Nguyên liệu sẽ lấy danh sách đơn vị từ{" "}
                <span className="font-medium text-foreground">
                  localStorage DONVI
                </span>
                .
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
