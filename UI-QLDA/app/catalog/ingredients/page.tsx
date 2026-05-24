"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Pencil, X, Trash2, Package } from "lucide-react";
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

interface Ingredient {
  MaNL: string;
  TenNL: string;
  DonViCoBan: string;
  TonToiThieu: number;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
}

const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";

const initialUnits: Unit[] = [
  { MaDV: "GRAM", TenDonVi: "Gram", TrangThai: 1 },
  { MaDV: "KG", TenDonVi: "Kilogram", TrangThai: 1 },
  { MaDV: "ML", TenDonVi: "Mililít", TrangThai: 1 },
  { MaDV: "LIT", TenDonVi: "Lít", TrangThai: 1 },
  { MaDV: "CAI", TenDonVi: "Cái", TrangThai: 1 },
  { MaDV: "HOP", TenDonVi: "Hộp", TrangThai: 1 },
  { MaDV: "CHAI", TenDonVi: "Chai", TrangThai: 1 },
  { MaDV: "LON", TenDonVi: "Lon", TrangThai: 1 },
  { MaDV: "GOI", TenDonVi: "Gói", TrangThai: 1 },
];

const initialIngredients: Ingredient[] = [
  {
    MaNL: "NL001",
    TenNL: "Cà phê bột",
    DonViCoBan: "GRAM",
    TonToiThieu: 5000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL002",
    TenNL: "Sữa tươi",
    DonViCoBan: "ML",
    TonToiThieu: 10000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL003",
    TenNL: "Sữa đặc",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL004",
    TenNL: "Đường",
    DonViCoBan: "GRAM",
    TonToiThieu: 5000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL005",
    TenNL: "Trà đào",
    DonViCoBan: "GRAM",
    TonToiThieu: 2000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL006",
    TenNL: "Siro đào",
    DonViCoBan: "ML",
    TonToiThieu: 2000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL007",
    TenNL: "Bột matcha",
    DonViCoBan: "GRAM",
    TonToiThieu: 1000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL008",
    TenNL: "Trân châu đen",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL009",
    TenNL: "Kem cheese",
    DonViCoBan: "GRAM",
    TonToiThieu: 1500,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaNL: "NL010",
    TenNL: "Bánh tiramisu",
    DonViCoBan: "CAI",
    TonToiThieu: 10,
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
  };
};

const normalizeIngredient = (
  ingredient: Partial<Ingredient>,
): Ingredient | null => {
  const MaNL = ingredient.MaNL;
  const TenNL = ingredient.TenNL;
  const DonViCoBan = ingredient.DonViCoBan;
  const TonToiThieu = Number(ingredient.TonToiThieu);

  if (!MaNL || !TenNL || !DonViCoBan || Number.isNaN(TonToiThieu)) {
    return null;
  }

  return {
    MaNL,
    TenNL,
    DonViCoBan,
    TonToiThieu,
    TrangThai: Number(ingredient.TrangThai ?? 1),
    CreatedAt: ingredient.CreatedAt,
    UpdatedAt: ingredient.UpdatedAt,
  };
};

const getNextIngredientCode = (ingredients: Ingredient[]) => {
  const maxNumber = ingredients.reduce((max, ingredient) => {
    if (!ingredient.MaNL.startsWith("NL")) return max;

    const number = Number(ingredient.MaNL.replace("NL", ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `NL${String(maxNumber + 1).padStart(3, "0")}`;
};

export default function IngredientsPage() {
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState({
    TenNL: "",
    DonViCoBan: "GRAM",
    TonToiThieu: "",
    TrangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const storedUnits = getFromStorage<Partial<Unit>>(unitStorageKey, []);

    if (storedUnits.length > 0) {
      const normalizedUnits = storedUnits
        .map(normalizeUnit)
        .filter((item): item is Unit => item !== null);

      if (normalizedUnits.length > 0) {
        setUnits(normalizedUnits);
      } else {
        saveToStorage(unitStorageKey, initialUnits);
      }
    } else {
      saveToStorage(unitStorageKey, initialUnits);
    }

    const storedIngredients = getFromStorage<Partial<Ingredient>>(
      ingredientStorageKey,
      [],
    );

    if (storedIngredients.length > 0) {
      const normalizedIngredients = storedIngredients
        .map(normalizeIngredient)
        .filter((item): item is Ingredient => item !== null);

      if (normalizedIngredients.length > 0) {
        setIngredients(normalizedIngredients);
      } else {
        saveToStorage(ingredientStorageKey, initialIngredients);
      }
    } else {
      saveToStorage(ingredientStorageKey, initialIngredients);
    }
  }, []);

  const activeUnits = units.filter((unit) => unit.TrangThai === 1);

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => {
      const unitName = getUnitName(ingredient.DonViCoBan);

      const matchesSearch =
        ingredient.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unitName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUnit =
        unitFilter === "all" || ingredient.DonViCoBan === unitFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ingredient.TrangThai === 1) ||
        (statusFilter === "inactive" && ingredient.TrangThai === 0);

      return matchesSearch && matchesUnit && matchesStatus;
    });
  }, [ingredients, units, searchQuery, unitFilter, statusFilter]);

  const totalPages = Math.ceil(filteredIngredients.length / pageSize);

  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = ingredients.filter(
    (ingredient) => ingredient.TrangThai === 1,
  ).length;

  const inactiveCount = ingredients.filter(
    (ingredient) => ingredient.TrangThai === 0,
  ).length;

  const lowThresholdCount = ingredients.filter(
    (ingredient) => ingredient.TonToiThieu > 0 && ingredient.TrangThai === 1,
  ).length;

  const resetForm = () => {
    setFormData({
      TenNL: "",
      DonViCoBan: "GRAM",
      TonToiThieu: "",
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

  const handleOpenEdit = (ingredient: Ingredient) => {
    setEditingItem(ingredient);
    setFormData({
      TenNL: ingredient.TenNL,
      DonViCoBan: ingredient.DonViCoBan,
      TonToiThieu: String(ingredient.TonToiThieu),
      TrangThai: ingredient.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const persistIngredients = (updatedIngredients: Ingredient[]) => {
    setIngredients(updatedIngredients);
    saveToStorage(ingredientStorageKey, updatedIngredients);
  };

  const handleSave = () => {
    const tenNL = formData.TenNL.trim();
    const tonToiThieu = Number(formData.TonToiThieu);

    if (!tenNL || !formData.DonViCoBan || !formData.TonToiThieu) {
      alert(
        "Vui lòng nhập đầy đủ tên nguyên liệu, đơn vị cơ bản và tồn tối thiểu",
      );
      return;
    }

    if (Number.isNaN(tonToiThieu) || tonToiThieu < 0) {
      alert("Tồn tối thiểu phải là số lớn hơn hoặc bằng 0");
      return;
    }

    const unitExists = units.some((unit) => unit.MaDV === formData.DonViCoBan);

    if (!unitExists) {
      alert("Đơn vị cơ bản không tồn tại");
      return;
    }

    const duplicatedName = ingredients.some((ingredient) => {
      const isSameName =
        ingredient.TenNL.trim().toLowerCase() === tenNL.toLowerCase();

      const isDifferentIngredient =
        !editingItem || ingredient.MaNL !== editingItem.MaNL;

      return isSameName && isDifferentIngredient;
    });

    if (duplicatedName) {
      alert("Tên nguyên liệu đã tồn tại");
      return;
    }

    const now = new Date().toISOString();

    if (editingItem) {
      const updatedIngredients = ingredients.map((ingredient) =>
        ingredient.MaNL === editingItem.MaNL
          ? {
              ...ingredient,
              TenNL: tenNL,
              DonViCoBan: formData.DonViCoBan,
              TonToiThieu: tonToiThieu,
              TrangThai: formData.TrangThai,
              UpdatedAt: now,
            }
          : ingredient,
      );

      persistIngredients(updatedIngredients);
    } else {
      const newIngredient: Ingredient = {
        MaNL: getNextIngredientCode(ingredients),
        TenNL: tenNL,
        DonViCoBan: formData.DonViCoBan,
        TonToiThieu: tonToiThieu,
        TrangThai: formData.TrangThai,
        CreatedAt: now,
        UpdatedAt: now,
      };

      persistIngredients([...ingredients, newIngredient]);
      setCurrentPage(1);
    }

    closeDrawer();
  };

  const handleToggleStatus = (MaNL: string) => {
    const updatedIngredients = ingredients.map((ingredient) =>
      ingredient.MaNL === MaNL
        ? {
            ...ingredient,
            TrangThai: ingredient.TrangThai === 1 ? 0 : 1,
            UpdatedAt: new Date().toISOString(),
          }
        : ingredient,
    );

    persistIngredients(updatedIngredients);
  };

  const handleDelete = (MaNL: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn ngưng sử dụng nguyên liệu này không?",
    );

    if (!isConfirmed) return;

    const updatedIngredients = ingredients.map((ingredient) =>
      ingredient.MaNL === MaNL
        ? {
            ...ingredient,
            TrangThai: 0,
            UpdatedAt: new Date().toISOString(),
          }
        : ingredient,
    );

    persistIngredients(updatedIngredients);
  };

  const handleResetMockData = () => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn khôi phục dữ liệu nguyên liệu mẫu không?",
    );

    if (!isConfirmed) return;

    persistIngredients(initialIngredients);
    saveToStorage(unitStorageKey, initialUnits);
    setUnits(initialUnits);
    setCurrentPage(1);
  };

  return (
    <MainLayout
      title="Quản lý nguyên liệu"
      breadcrumb="Trang chủ / Danh mục / Nguyên liệu"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng nguyên liệu
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {ingredients.length}
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

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Có tồn tối thiểu</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {lowThresholdCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm kiếm nguyên liệu..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={unitFilter}
            onValueChange={(value) => {
              setUnitFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Đơn vị" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.MaDV} value={unit.MaDV}>
                  {unit.TenDonVi}
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
            Thêm nguyên liệu
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã NL
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tên nguyên liệu
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Đơn vị cơ bản
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tồn tối thiểu
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
                {paginatedIngredients.map((ingredient) => (
                  <tr key={ingredient.MaNL} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {ingredient.MaNL}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {ingredient.TenNL}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {getUnitName(ingredient.DonViCoBan)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({ingredient.DonViCoBan})
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {ingredient.TonToiThieu}{" "}
                      {getUnitName(ingredient.DonViCoBan)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={ingredient.TrangThai === 1}
                          onCheckedChange={() =>
                            handleToggleStatus(ingredient.MaNL)
                          }
                        />

                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-1 text-xs font-medium",
                            ingredient.TrangThai === 1
                              ? "bg-[#D1E7DD] text-[#198754]"
                              : "bg-[#E2E3E5] text-[#383D41]",
                          )}
                        >
                          {ingredient.TrangThai === 1
                            ? "Đang sử dụng"
                            : "Ngừng sử dụng"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(ingredient)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(ingredient.MaNL)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedIngredients.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có nguyên liệu phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredIngredients.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredIngredients.length)}{" "}
              trong {filteredIngredients.length} nguyên liệu
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
                {editingItem ? "Chỉnh sửa nguyên liệu" : "Thêm nguyên liệu mới"}
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
                  <Label>Mã nguyên liệu</Label>

                  <Input value={editingItem.MaNL} disabled className="mt-1.5" />
                </div>
              )}

              <div>
                <Label>Tên nguyên liệu *</Label>

                <Input
                  value={formData.TenNL}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TenNL: event.target.value,
                    })
                  }
                  placeholder="Nhập tên nguyên liệu"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Đơn vị cơ bản *</Label>

                <Select
                  value={formData.DonViCoBan}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      DonViCoBan: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn đơn vị cơ bản" />
                  </SelectTrigger>

                  <SelectContent>
                    {activeUnits.map((unit) => (
                      <SelectItem key={unit.MaDV} value={unit.MaDV}>
                        {unit.TenDonVi} ({unit.MaDV})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tồn tối thiểu *</Label>

                <Input
                  type="number"
                  min={0}
                  value={formData.TonToiThieu}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TonToiThieu: event.target.value,
                    })
                  }
                  placeholder="Nhập tồn tối thiểu"
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
                Khi thêm mới, hệ thống sẽ tự tạo mã nguyên liệu dạng{" "}
                <span className="font-medium text-foreground">
                  NL001, NL002, NL003...
                </span>
                <br />
                Đơn vị cơ bản dùng mã như{" "}
                <span className="font-medium text-foreground">
                  GRAM, KG, ML, LIT, CAI...
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
