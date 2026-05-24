"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Download,
  RefreshCw,
  Package,
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

interface InventoryItem {
  MaCN: string;
  MaNL: string;
  SoLuongTon: number;
  UpdatedAt?: string;
}

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
}

interface Ingredient {
  MaNL: string;
  TenNL: string;
  DonViCoBan: string;
  TonToiThieu: number;
  TrangThai: number;
}

const inventoryStorageKey = "TONKHO";
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
    MaNL: "NL005",
    TenNL: "Trà đào",
    DonViCoBan: "GRAM",
    TonToiThieu: 2000,
    TrangThai: 1,
  },
  {
    MaNL: "NL006",
    TenNL: "Siro đào",
    DonViCoBan: "ML",
    TonToiThieu: 2000,
    TrangThai: 1,
  },
  {
    MaNL: "NL007",
    TenNL: "Bột matcha",
    DonViCoBan: "GRAM",
    TonToiThieu: 1000,
    TrangThai: 1,
  },
  {
    MaNL: "NL008",
    TenNL: "Trân châu đen",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
  },
  {
    MaNL: "NL009",
    TenNL: "Kem cheese",
    DonViCoBan: "GRAM",
    TonToiThieu: 1500,
    TrangThai: 1,
  },
  {
    MaNL: "NL010",
    TenNL: "Bánh tiramisu",
    DonViCoBan: "CAI",
    TonToiThieu: 10,
    TrangThai: 1,
  },
];

const initialInventoryData: InventoryItem[] = [
  { MaCN: "CN01", MaNL: "NL001", SoLuongTon: 25000 },
  { MaCN: "CN01", MaNL: "NL002", SoLuongTon: 45000 },
  { MaCN: "CN01", MaNL: "NL003", SoLuongTon: 8000 },
  { MaCN: "CN01", MaNL: "NL004", SoLuongTon: 12000 },
  { MaCN: "CN01", MaNL: "NL008", SoLuongTon: 2500 },
  { MaCN: "CN02", MaNL: "NL001", SoLuongTon: 18000 },
  { MaCN: "CN02", MaNL: "NL002", SoLuongTon: 9000 },
  { MaCN: "CN02", MaNL: "NL004", SoLuongTon: 0 },
  { MaCN: "CN02", MaNL: "NL007", SoLuongTon: 1500 },
  { MaCN: "CN03", MaNL: "NL005", SoLuongTon: 3500 },
  { MaCN: "CN03", MaNL: "NL006", SoLuongTon: 1000 },
  { MaCN: "CN04", MaNL: "NL009", SoLuongTon: 700 },
  { MaCN: "CN05", MaNL: "NL010", SoLuongTon: 20 },
];

const statusConfig = {
  normal: {
    label: "Bình thường",
    className: "bg-[#D1E7DD] text-[#198754]",
  },
  warning: {
    label: "Cảnh báo",
    className: "bg-[#FFF3CD] text-[#856404]",
  },
  danger: {
    label: "Nguy hiểm",
    className: "bg-[#F8D7DA] text-[#DC3545]",
  },
  outOfStock: {
    label: "Hết hàng",
    className: "bg-[#6C757D] text-white",
  },
};

type StockStatus = keyof typeof statusConfig;

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

const normalizeBranch = (branch: Partial<Branch>): Branch | null => {
  if (!branch.MaCN || !branch.TenCN) return null;

  return {
    MaCN: branch.MaCN,
    TenCN: branch.TenCN,
    DiaChi: branch.DiaChi,
    TrangThai: Number(branch.TrangThai ?? 1),
  };
};

const normalizeUnit = (unit: Partial<Unit>): Unit | null => {
  if (!unit.MaDV || !unit.TenDonVi) return null;

  return {
    MaDV: unit.MaDV,
    TenDonVi: unit.TenDonVi,
    TrangThai: Number(unit.TrangThai ?? 1),
  };
};

const normalizeIngredient = (
  ingredient: Partial<Ingredient>,
): Ingredient | null => {
  if (!ingredient.MaNL || !ingredient.TenNL || !ingredient.DonViCoBan) {
    return null;
  }

  const tonToiThieu = Number(ingredient.TonToiThieu);

  if (Number.isNaN(tonToiThieu)) return null;

  return {
    MaNL: ingredient.MaNL,
    TenNL: ingredient.TenNL,
    DonViCoBan: ingredient.DonViCoBan,
    TonToiThieu: tonToiThieu,
    TrangThai: Number(ingredient.TrangThai ?? 1),
  };
};

const normalizeInventoryItem = (
  item: Partial<InventoryItem>,
): InventoryItem | null => {
  if (!item.MaCN || !item.MaNL) return null;

  const soLuongTon = Number(item.SoLuongTon);

  if (Number.isNaN(soLuongTon)) return null;

  return {
    MaCN: item.MaCN,
    MaNL: item.MaNL,
    SoLuongTon: soLuongTon,
    UpdatedAt: item.UpdatedAt,
  };
};

const mergeInventoryStocks = (stocks: InventoryItem[]) => {
  const stockMap = new Map<string, InventoryItem>();

  stocks.forEach((stock) => {
    const key = `${stock.MaCN}-${stock.MaNL}`;
    const oldStock = stockMap.get(key);

    if (oldStock) {
      stockMap.set(key, {
        ...oldStock,
        SoLuongTon: oldStock.SoLuongTon + stock.SoLuongTon,
        UpdatedAt: stock.UpdatedAt || oldStock.UpdatedAt,
      });
    } else {
      stockMap.set(key, stock);
    }
  });

  return Array.from(stockMap.values());
};

const getStockStatus = (
  soLuongTon: number,
  tonToiThieu: number,
): StockStatus => {
  if (soLuongTon <= 0) return "outOfStock";
  if (soLuongTon < tonToiThieu) return "danger";
  if (soLuongTon <= tonToiThieu * 1.5) return "warning";

  return "normal";
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
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

export default function InventoryStockPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [inventoryData, setInventoryData] =
    useState<InventoryItem[]>(initialInventoryData);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = () => {
    const storedBranches = getFromStorage<Partial<Branch>>(
      branchStorageKey,
      [],
    );
    const normalizedBranches = storedBranches
      .map(normalizeBranch)
      .filter((item): item is Branch => item !== null);

    if (normalizedBranches.length > 0) {
      setBranches(normalizedBranches);
    } else {
      setBranches(initialBranches);
      saveToStorage(branchStorageKey, initialBranches);
    }

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

    const storedIngredients = getFromStorage<Partial<Ingredient>>(
      ingredientStorageKey,
      [],
    );
    const normalizedIngredients = storedIngredients
      .map(normalizeIngredient)
      .filter((item): item is Ingredient => item !== null);

    if (normalizedIngredients.length > 0) {
      setIngredients(normalizedIngredients);
    } else {
      setIngredients(initialIngredients);
      saveToStorage(ingredientStorageKey, initialIngredients);
    }

    const storedInventory = getFromStorage<Partial<InventoryItem>>(
      inventoryStorageKey,
      [],
    );
    const normalizedInventory = storedInventory
      .map(normalizeInventoryItem)
      .filter((item): item is InventoryItem => item !== null);

    if (normalizedInventory.length > 0) {
      setInventoryData(mergeInventoryStocks(normalizedInventory));
    } else {
      const mergedInitialInventory = mergeInventoryStocks(initialInventoryData);
      setInventoryData(mergedInitialInventory);
      saveToStorage(inventoryStorageKey, mergedInitialInventory);
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
  }, [searchQuery, branchFilter, statusFilter]);

  const getBranchName = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const getIngredient = (MaNL: string) => {
    return ingredients.find((ingredient) => ingredient.MaNL === MaNL);
  };

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const enrichedInventory = useMemo(() => {
    return inventoryData.map((item) => {
      const ingredient = getIngredient(item.MaNL);
      const tonToiThieu = ingredient?.TonToiThieu ?? 0;
      const status = getStockStatus(item.SoLuongTon, tonToiThieu);

      return {
        ...item,
        TenCN: getBranchName(item.MaCN),
        TenNL: ingredient?.TenNL || item.MaNL,
        DonViCoBan: ingredient?.DonViCoBan || "",
        DonVi: ingredient ? getUnitName(ingredient.DonViCoBan) : "-",
        TonToiThieu: tonToiThieu,
        TrangThaiNguyenLieu: ingredient?.TrangThai ?? 1,
        Status: status,
      };
    });
  }, [inventoryData, branches, ingredients, units]);

  const filteredData = useMemo(() => {
    return enrichedInventory.filter((item) => {
      const matchesSearch =
        item.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenCN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaCN.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" || item.MaCN === branchFilter;

      const matchesStatus =
        statusFilter === "all" || item.Status === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [enrichedInventory, searchQuery, branchFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const normalCount = enrichedInventory.filter(
    (item) => item.Status === "normal",
  ).length;

  const warningCount = enrichedInventory.filter(
    (item) => item.Status === "warning",
  ).length;

  const dangerCount = enrichedInventory.filter(
    (item) => item.Status === "danger",
  ).length;

  const outOfStockCount = enrichedInventory.filter(
    (item) => item.Status === "outOfStock",
  ).length;

  const handleExportExcel = () => {
    const headers = [
      "Mã chi nhánh",
      "Tên chi nhánh",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Đơn vị",
      "Mã đơn vị",
      "Số lượng tồn",
      "Tồn tối thiểu",
      "Trạng thái",
    ];

    const rows = filteredData.map((item) => [
      item.MaCN,
      item.TenCN,
      item.MaNL,
      item.TenNL,
      item.DonVi,
      item.DonViCoBan,
      item.SoLuongTon,
      item.TonToiThieu,
      statusConfig[item.Status].label,
    ]);

    downloadCsv("ton-kho-hien-tai.csv", headers, rows);
  };

  const handleResetMockData = () => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn khôi phục dữ liệu tồn kho mẫu không?",
    );

    if (!isConfirmed) return;

    const mergedInitialInventory = mergeInventoryStocks(initialInventoryData);
    setInventoryData(mergedInitialInventory);
    saveToStorage(inventoryStorageKey, mergedInitialInventory);
    setCurrentPage(1);
  };

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);

  return (
    <MainLayout
      title="Tồn kho hiện tại"
      breadcrumb="Trang chủ / Kho nguyên liệu / Tồn kho"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng dòng tồn</p>
                <p className="text-2xl font-bold text-foreground">
                  {enrichedInventory.length}
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
                <p className="text-sm text-muted-foreground">Bình thường</p>
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
                <p className="text-sm text-muted-foreground">Cảnh báo</p>
                <p className="text-2xl font-bold text-[#856404]">
                  {warningCount + dangerCount}
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
                <p className="text-sm text-muted-foreground">Hết hàng</p>
                <p className="text-2xl font-bold text-[#DC3545]">
                  {outOfStockCount}
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
              <SelectItem value="normal">Bình thường</SelectItem>
              <SelectItem value="warning">Cảnh báo</SelectItem>
              <SelectItem value="danger">Nguy hiểm</SelectItem>
              <SelectItem value="outOfStock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm nguyên liệu, mã NL, chi nhánh..."
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã NL
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tên nguyên liệu
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Đơn vị
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi nhánh
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tồn hiện tại
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tồn tối thiểu
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginatedData.map((item) => (
                  <tr
                    key={`${item.MaCN}-${item.MaNL}`}
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {item.MaNL}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {item.TenNL}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.DonVi}
                      {item.DonViCoBan && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({item.DonViCoBan})
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{item.TenCN}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.MaCN}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatNumber(item.SoLuongTon)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatNumber(item.TonToiThieu)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium",
                          statusConfig[item.Status].className,
                        )}
                      >
                        {statusConfig[item.Status].label}
                      </span>
                    </td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có dữ liệu tồn kho phù hợp
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
              {filteredData.length} dòng tồn kho
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
