"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Plus,
  Pencil,
  X,
  Trash2,
  RefreshCw,
  Repeat2,
} from "lucide-react";
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

interface UnitConversion {
  MaQD: string;
  MaDVTu: string;
  MaDVDen: string;
  TyLe: number;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

const unitStorageKey = "DONVI";
const conversionStorageKey = "QUYDOIDONVI";

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

const initialConversions: UnitConversion[] = [
  {
    MaQD: "QD001",
    MaDVTu: "KG",
    MaDVDen: "GRAM",
    TyLe: 1000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaQD: "QD002",
    MaDVTu: "LIT",
    MaDVDen: "ML",
    TyLe: 1000,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaQD: "QD003",
    MaDVTu: "HOP",
    MaDVDen: "CAI",
    TyLe: 12,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaQD: "QD004",
    MaDVTu: "GOI",
    MaDVDen: "GRAM",
    TyLe: 500,
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
  if (!unit.MaDV || !unit.TenDonVi) return null;

  return {
    MaDV: unit.MaDV,
    TenDonVi: unit.TenDonVi,
    TrangThai: Number(unit.TrangThai ?? 1),
    CreatedAt: unit.CreatedAt,
    UpdatedAt: unit.UpdatedAt,
  };
};

const normalizeConversion = (
  conversion: Partial<UnitConversion>,
): UnitConversion | null => {
  if (!conversion.MaQD || !conversion.MaDVTu || !conversion.MaDVDen) {
    return null;
  }

  const tyLe = Number(conversion.TyLe);

  if (Number.isNaN(tyLe)) return null;

  return {
    MaQD: conversion.MaQD,
    MaDVTu: conversion.MaDVTu,
    MaDVDen: conversion.MaDVDen,
    TyLe: tyLe,
    TrangThai: Number(conversion.TrangThai ?? 1),
    CreatedAt: conversion.CreatedAt,
    UpdatedAt: conversion.UpdatedAt,
  };
};

const getNextCode = (
  prefix: string,
  existingCodes: Array<string | undefined | null>,
) => {
  const maxNumber = existingCodes.reduce((max, code) => {
    if (!code) return max;
    if (!String(code).startsWith(prefix)) return max;

    const number = Number(String(code).replace(prefix, ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 6,
  }).format(value);
};

export default function UnitConversionPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [conversions, setConversions] =
    useState<UnitConversion[]>(initialConversions);

  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitConversion | null>(null);

  const [formData, setFormData] = useState({
    MaDVTu: "KG",
    MaDVDen: "GRAM",
    TyLe: "",
    TrangThai: 1,
  });

  const [testValue, setTestValue] = useState("1");
  const [testConversionId, setTestConversionId] = useState("QD001");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = () => {
    const storedUnits = getFromStorage<Partial<Unit>>(unitStorageKey, []);
    const normalizedUnits = storedUnits
      .map(normalizeUnit)
      .filter((item): item is Unit => item !== null);

    if (normalizedUnits.length > 0) {
      setUnits(normalizedUnits);
    } else {
      setUnits(initialUnits);
      saveToStorage(unitStorageKey, initialUnits);
    }

    const storedConversions = getFromStorage<Partial<UnitConversion>>(
      conversionStorageKey,
      [],
    );

    const normalizedConversions = storedConversions
      .map(normalizeConversion)
      .filter((item): item is UnitConversion => item !== null);

    if (normalizedConversions.length > 0) {
      setConversions(normalizedConversions);

      if (!testConversionId) {
        setTestConversionId(normalizedConversions[0].MaQD);
      }
    } else {
      setConversions(initialConversions);
      saveToStorage(conversionStorageKey, initialConversions);
      setTestConversionId(initialConversions[0]?.MaQD || "");
    }
  };

  useEffect(() => {
    loadData();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, unitFilter, statusFilter]);

  const activeUnits = units.filter((unit) => unit.TrangThai === 1);

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const filteredConversions = useMemo(() => {
    return conversions.filter((conversion) => {
      const fromName = getUnitName(conversion.MaDVTu);
      const toName = getUnitName(conversion.MaDVDen);

      const matchesSearch =
        conversion.MaQD.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversion.MaDVTu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversion.MaDVDen.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        toName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUnit =
        unitFilter === "all" ||
        conversion.MaDVTu === unitFilter ||
        conversion.MaDVDen === unitFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && conversion.TrangThai === 1) ||
        (statusFilter === "inactive" && conversion.TrangThai === 0);

      return matchesSearch && matchesUnit && matchesStatus;
    });
  }, [conversions, units, searchQuery, unitFilter, statusFilter]);

  const totalPages = Math.ceil(filteredConversions.length / pageSize);

  const paginatedConversions = filteredConversions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = conversions.filter(
    (conversion) => conversion.TrangThai === 1,
  ).length;

  const inactiveCount = conversions.filter(
    (conversion) => conversion.TrangThai === 0,
  ).length;

  const resetForm = () => {
    setFormData({
      MaDVTu: activeUnits[0]?.MaDV || "KG",
      MaDVDen: activeUnits[1]?.MaDV || "GRAM",
      TyLe: "",
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

  const handleOpenEdit = (conversion: UnitConversion) => {
    setEditingItem(conversion);
    setFormData({
      MaDVTu: conversion.MaDVTu,
      MaDVDen: conversion.MaDVDen,
      TyLe: String(conversion.TyLe),
      TrangThai: conversion.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const persistConversions = (updatedConversions: UnitConversion[]) => {
    setConversions(updatedConversions);
    saveToStorage(conversionStorageKey, updatedConversions);

    if (
      updatedConversions.length > 0 &&
      !updatedConversions.some((item) => item.MaQD === testConversionId)
    ) {
      setTestConversionId(updatedConversions[0].MaQD);
    }
  };

  const handleSave = () => {
    const tyLe = Number(formData.TyLe);

    if (!formData.MaDVTu || !formData.MaDVDen || !formData.TyLe) {
      alert("Vui lòng nhập đầy đủ đơn vị nguồn, đơn vị đích và tỷ lệ quy đổi");
      return;
    }

    if (formData.MaDVTu === formData.MaDVDen) {
      alert("Đơn vị nguồn và đơn vị đích không được trùng nhau");
      return;
    }

    if (Number.isNaN(tyLe) || tyLe <= 0) {
      alert("Tỷ lệ quy đổi phải là số lớn hơn 0");
      return;
    }

    const duplicatedPair = conversions.some((conversion) => {
      const isSamePair =
        conversion.MaDVTu === formData.MaDVTu &&
        conversion.MaDVDen === formData.MaDVDen;

      const isDifferentConversion =
        !editingItem || conversion.MaQD !== editingItem.MaQD;

      return isSamePair && isDifferentConversion;
    });

    if (duplicatedPair) {
      alert("Cặp đơn vị quy đổi này đã tồn tại");
      return;
    }

    const now = new Date().toISOString();

    if (editingItem) {
      const updatedConversions = conversions.map((conversion) =>
        conversion.MaQD === editingItem.MaQD
          ? {
              ...conversion,
              MaDVTu: formData.MaDVTu,
              MaDVDen: formData.MaDVDen,
              TyLe: tyLe,
              TrangThai: formData.TrangThai,
              UpdatedAt: now,
            }
          : conversion,
      );

      persistConversions(updatedConversions);
    } else {
      const newConversion: UnitConversion = {
        MaQD: getNextCode(
          "QD",
          conversions.map((conversion) => conversion.MaQD),
        ),
        MaDVTu: formData.MaDVTu,
        MaDVDen: formData.MaDVDen,
        TyLe: tyLe,
        TrangThai: formData.TrangThai,
        CreatedAt: now,
        UpdatedAt: now,
      };

      persistConversions([...conversions, newConversion]);
      setCurrentPage(1);
      setTestConversionId(newConversion.MaQD);
    }

    closeDrawer();
  };

  const handleToggleStatus = (MaQD: string) => {
    const updatedConversions = conversions.map((conversion) =>
      conversion.MaQD === MaQD
        ? {
            ...conversion,
            TrangThai: conversion.TrangThai === 1 ? 0 : 1,
            UpdatedAt: new Date().toISOString(),
          }
        : conversion,
    );

    persistConversions(updatedConversions);
  };

  const handleDelete = (MaQD: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn ngưng sử dụng quy đổi đơn vị này không?",
    );

    if (!isConfirmed) return;

    const updatedConversions = conversions.map((conversion) =>
      conversion.MaQD === MaQD
        ? {
            ...conversion,
            TrangThai: 0,
            UpdatedAt: new Date().toISOString(),
          }
        : conversion,
    );

    persistConversions(updatedConversions);
  };

  const selectedTestConversion = conversions.find(
    (conversion) => conversion.MaQD === testConversionId,
  );

  const convertedValue =
    selectedTestConversion && Number(testValue) > 0
      ? Number(testValue) * selectedTestConversion.TyLe
      : 0;

  return (
    <MainLayout
      title="Quy đổi đơn vị"
      breadcrumb="Trang chủ / Danh mục / Quy đổi đơn vị"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Repeat2 className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng quy đổi</p>
                <p className="text-2xl font-bold text-foreground">
                  {conversions.length}
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
            <p className="text-sm text-muted-foreground">Ngưng sử dụng</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {inactiveCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đơn vị khả dụng</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {activeUnits.length}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="mb-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Kiểm tra quy đổi nhanh
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Input
              type="number"
              min={0}
              value={testValue}
              onChange={(event) => setTestValue(event.target.value)}
              placeholder="Số lượng"
            />

            <Select
              value={testConversionId}
              onValueChange={setTestConversionId}
            >
              <SelectTrigger className="md:col-span-2">
                <SelectValue placeholder="Chọn quy đổi" />
              </SelectTrigger>

              <SelectContent>
                {conversions
                  .filter((conversion) => conversion.TrangThai === 1)
                  .map((conversion) => (
                    <SelectItem key={conversion.MaQD} value={conversion.MaQD}>
                      {getUnitName(conversion.MaDVTu)} →{" "}
                      {getUnitName(conversion.MaDVDen)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <div className="rounded-md border border-border px-3 py-2 text-sm">
              {selectedTestConversion ? (
                <>
                  <span className="text-muted-foreground">Kết quả: </span>
                  <span className="font-semibold text-primary">
                    {formatNumber(convertedValue)}{" "}
                    {getUnitName(selectedTestConversion.MaDVDen)}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  Chưa có quy đổi khả dụng
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <Select
            value={unitFilter}
            onValueChange={(value) => {
              setUnitFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Đơn vị" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả đơn vị</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.MaDV} value={unit.MaDV}>
                  {unit.TenDonVi} ({unit.MaDV})
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
              <SelectItem value="inactive">Ngưng sử dụng</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm mã quy đổi hoặc đơn vị..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>

          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm quy đổi
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã quy đổi
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Đơn vị nguồn
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Đơn vị đích
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tỷ lệ
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Diễn giải
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
                {paginatedConversions.map((conversion) => (
                  <tr key={conversion.MaQD} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {conversion.MaQD}
                    </td>

                    <td className="px-4 py-3 text-sm text-foreground">
                      {getUnitName(conversion.MaDVTu)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({conversion.MaDVTu})
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-foreground">
                      {getUnitName(conversion.MaDVDen)}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({conversion.MaDVDen})
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatNumber(conversion.TyLe)}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      1 {getUnitName(conversion.MaDVTu)} ={" "}
                      {formatNumber(conversion.TyLe)}{" "}
                      {getUnitName(conversion.MaDVDen)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={conversion.TrangThai === 1}
                          onCheckedChange={() =>
                            handleToggleStatus(conversion.MaQD)
                          }
                        />

                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-1 text-xs font-medium",
                            conversion.TrangThai === 1
                              ? "bg-[#D1E7DD] text-[#198754]"
                              : "bg-[#E2E3E5] text-[#383D41]",
                          )}
                        >
                          {conversion.TrangThai === 1
                            ? "Đang dùng"
                            : "Ngưng dùng"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(conversion)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(conversion.MaQD)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedConversions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có quy đổi đơn vị phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredConversions.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredConversions.length)}{" "}
              trong {filteredConversions.length} quy đổi
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
                {editingItem ? "Chỉnh sửa quy đổi" : "Thêm quy đổi đơn vị"}
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
                  <Label>Mã quy đổi</Label>

                  <Input value={editingItem.MaQD} disabled className="mt-1.5" />
                </div>
              )}

              <div>
                <Label>Đơn vị nguồn *</Label>

                <Select
                  value={formData.MaDVTu}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      MaDVTu: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn đơn vị nguồn" />
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
                <Label>Đơn vị đích *</Label>

                <Select
                  value={formData.MaDVDen}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      MaDVDen: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Chọn đơn vị đích" />
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
                <Label>Tỷ lệ quy đổi *</Label>

                <Input
                  type="number"
                  min={0}
                  step="0.000001"
                  value={formData.TyLe}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      TyLe: event.target.value,
                    })
                  }
                  placeholder="Ví dụ: 1000"
                  className="mt-1.5"
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  Nghĩa là: 1 đơn vị nguồn = tỷ lệ × đơn vị đích.
                </p>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Ví dụ:
                <br />
                <span className="font-medium text-foreground">
                  1 Kilogram = 1000 Gram
                </span>
                <br />
                thì chọn nguồn là KG, đích là GRAM, tỷ lệ là 1000.
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
