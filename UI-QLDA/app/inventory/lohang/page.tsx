"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Download,
  RefreshCw,
  PackageSearch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Batch {
  MaLo: string;
  MaNL: string;
  MaCN: string;
  NgayNhap: string;
  HSD: string;
  SoLuongCon: number;
  IsSynced: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

interface Ingredient {
  MaNL: string;
  TenNL: string;
  DonViCoBan: string;
  TonToiThieu: number;
  TrangThai: number;
}

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
}

type BatchStatus = "normal" | "nearExpired" | "expired" | "empty";

const batchStorageKey = "LOHANG";
const branchStorageKey = "CHINHANH";
const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";

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
];

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
  },
  {
    MaNL: "NL002",
    TenNL: "Sữa tươi",
    DonViCoBan: "ML",
    TonToiThieu: 10000,
    TrangThai: 1,
  },
  {
    MaNL: "NL003",
    TenNL: "Sữa đặc",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
  },
  {
    MaNL: "NL004",
    TenNL: "Đường",
    DonViCoBan: "GRAM",
    TonToiThieu: 5000,
    TrangThai: 1,
  },
  {
    MaNL: "NL008",
    TenNL: "Trân châu đen",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
  },
];

const initialBatches: Batch[] = [
  {
    MaLo: "LO001",
    MaNL: "NL001",
    MaCN: "CN01",
    NgayNhap: "2026-05-23T08:00",
    HSD: "2026-12-31",
    SoLuongCon: 25000,
    IsSynced: false,
    CreatedAt: "2026-05-23T08:00:00",
    UpdatedAt: "2026-05-23T08:00:00",
  },
  {
    MaLo: "LO002",
    MaNL: "NL002",
    MaCN: "CN02",
    NgayNhap: "2026-05-23T09:00",
    HSD: "2026-06-30",
    SoLuongCon: 30000,
    IsSynced: false,
    CreatedAt: "2026-05-23T09:00:00",
    UpdatedAt: "2026-05-23T09:00:00",
  },
  {
    MaLo: "LO003",
    MaNL: "NL003",
    MaCN: "CN01",
    NgayNhap: "2026-05-23T09:30",
    HSD: "2026-06-15",
    SoLuongCon: 8000,
    IsSynced: false,
    CreatedAt: "2026-05-23T09:30:00",
    UpdatedAt: "2026-05-23T09:30:00",
  },
];

const statusConfig: Record<BatchStatus, { label: string; className: string }> =
  {
    normal: {
      label: "Còn hạn",
      className: "bg-[#D1E7DD] text-[#198754]",
    },
    nearExpired: {
      label: "Sắp hết hạn",
      className: "bg-[#FFF3CD] text-[#856404]",
    },
    expired: {
      label: "Hết hạn",
      className: "bg-[#F8D7DA] text-[#DC3545]",
    },
    empty: {
      label: "Hết lô",
      className: "bg-[#E2E3E5] text-[#383D41]",
    },
  };

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

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDate = (value: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (value: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getDaysUntilExpiry = (hsd: string) => {
  if (!hsd) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(hsd);
  expiryDate.setHours(0, 0, 0, 0);

  const diffTime = expiryDate.getTime() - today.getTime();

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getBatchStatus = (batch: Batch): BatchStatus => {
  if (batch.SoLuongCon <= 0) return "empty";

  const days = getDaysUntilExpiry(batch.HSD);

  if (days < 0) return "expired";
  if (days <= 30) return "nearExpired";

  return "normal";
};

const downloadCsv = (
  fileName: string,
  headers: string[],
  rows: unknown[][],
) => {
  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export default function BatchPage() {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [ingredientFilter, setIngredientFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = () => {
    const storedBranches = getFromStorage<Branch>(
      branchStorageKey,
      initialBranches,
    );

    const storedIngredients = getFromStorage<Ingredient>(
      ingredientStorageKey,
      initialIngredients,
    );

    const storedUnits = getFromStorage<Unit>(unitStorageKey, initialUnits);

    const storedBatches = getFromStorage<Batch>(
      batchStorageKey,
      initialBatches,
    );

    setBranches(storedBranches);
    setIngredients(storedIngredients);
    setUnits(storedUnits);
    setBatches(storedBatches);

    if (!localStorage.getItem(branchStorageKey)) {
      saveToStorage(branchStorageKey, initialBranches);
    }

    if (!localStorage.getItem(ingredientStorageKey)) {
      saveToStorage(ingredientStorageKey, initialIngredients);
    }

    if (!localStorage.getItem(unitStorageKey)) {
      saveToStorage(unitStorageKey, initialUnits);
    }

    if (!localStorage.getItem(batchStorageKey)) {
      saveToStorage(batchStorageKey, initialBatches);
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
  }, [searchQuery, branchFilter, ingredientFilter, statusFilter]);

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);

  const activeIngredients = ingredients.filter(
    (ingredient) => ingredient.TrangThai === 1,
  );

  const getBranchName = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const getIngredient = (MaNL: string) => {
    return ingredients.find((ingredient) => ingredient.MaNL === MaNL);
  };

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const batchRows = useMemo(() => {
    return batches.map((batch) => {
      const ingredient = getIngredient(batch.MaNL);
      const status = getBatchStatus(batch);
      const daysUntilExpiry = getDaysUntilExpiry(batch.HSD);

      return {
        ...batch,
        TenCN: getBranchName(batch.MaCN),
        TenNL: ingredient?.TenNL || batch.MaNL,
        DonViCoBan: ingredient?.DonViCoBan || "",
        DonVi: ingredient ? getUnitName(ingredient.DonViCoBan) : "-",
        Status: status,
        DaysUntilExpiry: daysUntilExpiry,
      };
    });
  }, [batches, branches, ingredients, units]);

  const filteredData = useMemo(() => {
    return batchRows.filter((batch) => {
      const matchesSearch =
        batch.MaLo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.TenCN.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" || batch.MaCN === branchFilter;

      const matchesIngredient =
        ingredientFilter === "all" || batch.MaNL === ingredientFilter;

      const matchesStatus =
        statusFilter === "all" || batch.Status === statusFilter;

      return (
        matchesSearch && matchesBranch && matchesIngredient && matchesStatus
      );
    });
  }, [batchRows, searchQuery, branchFilter, ingredientFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const normalCount = batchRows.filter(
    (batch) => batch.Status === "normal",
  ).length;

  const nearExpiredCount = batchRows.filter(
    (batch) => batch.Status === "nearExpired",
  ).length;

  const expiredCount = batchRows.filter(
    (batch) => batch.Status === "expired",
  ).length;

  const emptyCount = batchRows.filter(
    (batch) => batch.Status === "empty",
  ).length;

  const handleExportExcel = () => {
    const headers = [
      "Mã lô",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Đơn vị",
      "Số lượng còn",
      "Chi nhánh",
      "Ngày nhập",
      "Hạn sử dụng",
      "Số ngày còn lại",
      "Trạng thái",
      "Đồng bộ",
    ];

    const rows = filteredData.map((batch) => [
      batch.MaLo,
      batch.MaNL,
      batch.TenNL,
      batch.DonVi,
      batch.SoLuongCon,
      batch.TenCN,
      batch.NgayNhap,
      batch.HSD,
      batch.DaysUntilExpiry,
      statusConfig[batch.Status].label,
      batch.IsSynced ? "Đã đồng bộ" : "Chưa đồng bộ",
    ]);

    downloadCsv("lo-hang.csv", headers, rows);
  };

  const handleResetMockData = () => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn khôi phục dữ liệu lô hàng mẫu không?",
    );

    if (!isConfirmed) return;

    setBatches(initialBatches);
    saveToStorage(batchStorageKey, initialBatches);
    setCurrentPage(1);
  };

  return (
    <MainLayout
      title="Lô hàng"
      breadcrumb="Trang chủ / Kho nguyên liệu / Lô hàng"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <PackageSearch className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng lô hàng</p>
                <p className="text-2xl font-bold text-foreground">
                  {batches.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1E7DD]">
                <CheckCircle2 className="h-5 w-5 text-[#198754]" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Còn hạn</p>
                <p className="text-2xl font-bold text-[#198754]">
                  {normalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3CD]">
                <AlertTriangle className="h-5 w-5 text-[#856404]" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Sắp hết hạn</p>
                <p className="text-2xl font-bold text-[#856404]">
                  {nearExpiredCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8D7DA]">
                <XCircle className="h-5 w-5 text-[#DC3545]" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Hết hạn/Hết lô</p>
                <p className="text-2xl font-bold text-[#DC3545]">
                  {expiredCount + emptyCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
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
              {activeBranches.map((branch) => (
                <SelectItem key={branch.MaCN} value={branch.MaCN}>
                  {branch.TenCN}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={ingredientFilter}
            onValueChange={(value) => {
              setIngredientFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Nguyên liệu" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả nguyên liệu</SelectItem>
              {activeIngredients.map((ingredient) => (
                <SelectItem key={ingredient.MaNL} value={ingredient.MaNL}>
                  {ingredient.TenNL}
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
              <SelectItem value="normal">Còn hạn</SelectItem>
              <SelectItem value="nearExpired">Sắp hết hạn</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
              <SelectItem value="empty">Hết lô</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm mã lô, nguyên liệu, chi nhánh..."
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

          <Button variant="outline" onClick={handleResetMockData}>
            Khôi phục mẫu
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {[
                    "Mã lô",
                    "Nguyên liệu",
                    "Đơn vị",
                    "Số lượng còn",
                    "Chi nhánh",
                    "Ngày nhập",
                    "Hạn sử dụng",
                    "Còn lại",
                    "Trạng thái",
                    "Đồng bộ",
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
                {paginatedData.map((batch) => (
                  <tr key={batch.MaLo} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {batch.MaLo}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {batch.TenNL}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {batch.MaNL}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {batch.DonVi}
                      {batch.DonViCoBan && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({batch.DonViCoBan})
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatNumber(batch.SoLuongCon)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{batch.TenCN}</p>
                      <p className="text-xs text-muted-foreground">
                        {batch.MaCN}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(batch.NgayNhap)}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(batch.HSD)}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {batch.Status === "expired"
                        ? `Quá hạn ${Math.abs(batch.DaysUntilExpiry)} ngày`
                        : batch.Status === "empty"
                          ? "Không còn hàng"
                          : `${batch.DaysUntilExpiry} ngày`}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium",
                          statusConfig[batch.Status].className,
                        )}
                      >
                        {statusConfig[batch.Status].label}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium",
                          batch.IsSynced
                            ? "bg-[#D1E7DD] text-[#198754]"
                            : "bg-[#FFF3CD] text-[#856404]",
                        )}
                      >
                        {batch.IsSynced ? "Đã đồng bộ" : "Chưa đồng bộ"}
                      </span>
                    </td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có lô hàng phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredData.length)} trong{" "}
              {filteredData.length} lô hàng
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
    </MainLayout>
  );
}
