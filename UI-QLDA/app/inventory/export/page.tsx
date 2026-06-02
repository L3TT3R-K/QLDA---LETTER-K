"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Plus,
  Download,
  Trash2,
  X,
  RefreshCw,
  PackageMinus,
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
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import api from "@/services/api";

type ExportReason = "USE" | "EXPIRE" | "DAMAGE" | "OTHER";

interface ExportReceipt {
  MaPX: string;
  MaCN: string;
  MaNV: string;
  NgayXuat: string;
  LyDo: string;
  GhiChu?: string;
  TrangThai: number;
  IsSynced: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

interface ExportDetail {
  MaPX: string;
  MaNL: string;
  SoLuong: number;
}

interface ExportFormItem {
  RowId: number;
  MaNL: string;
  SoLuong: number;
}

interface InventoryStock {
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

interface Employee {
  MaNV: string;
  Username?: string;
  PasswordHash?: string;
  TenNV: string;
  ChucVu?: string;
  MaCN: string | null;
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

interface ApiExportDetail {
  maLo?: string;
  maNL: string;
  tenNL?: string;
  soLuong: number;
  hanSuDung?: string;
}

interface ApiExportReceipt {
  maPX: string;
  maCN: string;
  tenCN?: string;
  maNV: string;
  tenNV?: string;
  ngayXuat: string;
  lyDo: string;
  trangThai?: string | number;
  chiTiet?: ApiExportDetail[];
}

interface ApiHaoHutXuatKho {
  maNL: string;
  tenNL?: string;
  lyDo: string;
  tongSoLuong: number;
}

interface ApiBranch {
  maCN: string;
  tenCN: string;
  diaChi?: string;
  trangThai?: number;
}

interface ApiEmployee {
  maNV: string;
  username?: string;
  tenNV: string;
  chucVu?: string;
  maCN?: string | null;
  trangThai?: number;
}

interface ApiIngredient {
  maNL: string;
  tenNL: string;
  tenDonVi?: string;
  donViCoBan?: string;
  tonToiThieu?: number;
  trangThai?: string | number;
}

interface ApiUnit {
  maDV: string;
  tenDonVi: string;
  trangThai?: number;
}

interface ApiInventoryStock {
  maNL: string;
  maCN?: string;
  chiNhanh?: string;
  tonHienTai: number;
}

const receiptStorageKey = "PHIEUXUAT";
const detailStorageKey = "CTPX";
const inventoryStorageKey = "TONKHO";
const branchStorageKey = "CHINHANH";
const employeeStorageKey = "NHANVIEN";
const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";

const reasonConfig: Record<ExportReason, { label: string; className: string }> =
  {
    USE: {
      label: "Sử dụng",
      className: "bg-[#D1E7DD] text-[#198754]",
    },
    EXPIRE: {
      label: "Hết hạn",
      className: "bg-[#FFF3CD] text-[#856404]",
    },
    DAMAGE: {
      label: "Hư hỏng",
      className: "bg-[#F8D7DA] text-[#DC3545]",
    },
    OTHER: {
      label: "Khác",
      className: "bg-[#E2E3E5] text-[#383D41]",
    },
  };

const normalizeExportReason = (value?: string | null): ExportReason => {
  const reason = String(value || "").trim();

  switch (reason) {
    case "USE":
    case "Sử dụng":
    case "Su dung":
    case "Xuất sử dụng":
    case "Xuat su dung":
    case "XUAT_SU_DUNG":
    case "XUAT_NGUYEN_LIEU":
      return "USE";

    case "EXPIRE":
    case "EXPIRED":
    case "Hết hạn":
    case "Het han":
    case "Hủy nguyên liệu hết hạn":
    case "Huy nguyen lieu het han":
    case "XUAT_HET_HAN":
    case "HET_HAN":
      return "EXPIRE";

    case "DAMAGE":
    case "DAMAGED":
    case "Hư hỏng":
    case "Hu hong":
    case "XUAT_HU_HONG":
    case "HONG":
      return "DAMAGE";

    case "OTHER":
    case "Khác":
    case "Khac":
    case "Hao hụt":
    case "Hao hut":
    case "LOSS":
    case "XUAT_KHAC":
    case "THAT_THOAT":
      return "OTHER";

    default:
      return "OTHER";
  }
};

const getReasonInfo = (value?: string | null) => {
  return reasonConfig[normalizeExportReason(value)];
};

const toBackendExportReason = (reason: ExportReason) => {
  switch (reason) {
    case "USE":
      return "XUAT_SU_DUNG";
    case "EXPIRE":
      return "HET_HAN";
    case "DAMAGE":
      return "HONG";
    case "OTHER":
    default:
      return "THAT_THOAT";
  }
};

const getCreateExportEndpoint = (reason: ExportReason) => {
  if (reason === "USE") return "/api/xuatkho/xuat-nguyen-lieu";
  if (reason === "OTHER") return "/api/xuatkho";

  return "/api/xuatkho/hao-hut";
};

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

const initialEmployees: Employee[] = [
  {
    MaNV: "NV001",
    Username: "admin",
    PasswordHash: "123456",
    TenNV: "Nguyễn Văn An",
    ChucVu: "ADMIN",
    MaCN: null,
    TrangThai: 1,
  },
  {
    MaNV: "NV003",
    Username: "cuonglv",
    PasswordHash: "123456",
    TenNV: "Lê Văn Cường",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV005",
    Username: "emhv",
    PasswordHash: "123456",
    TenNV: "Hoàng Văn Em",
    ChucVu: "NHANVIEN_KHO",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV007",
    Username: "khangvv",
    PasswordHash: "123456",
    TenNV: "Võ Văn Khang",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN02",
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

const initialInventory: InventoryStock[] = [
  { MaCN: "CN01", MaNL: "NL001", SoLuongTon: 25000 },
  { MaCN: "CN01", MaNL: "NL002", SoLuongTon: 45000 },
  { MaCN: "CN01", MaNL: "NL003", SoLuongTon: 8000 },
  { MaCN: "CN01", MaNL: "NL004", SoLuongTon: 12000 },
  { MaCN: "CN01", MaNL: "NL008", SoLuongTon: 2500 },
  { MaCN: "CN02", MaNL: "NL001", SoLuongTon: 18000 },
  { MaCN: "CN02", MaNL: "NL002", SoLuongTon: 9000 },
];

const initialReceipts: ExportReceipt[] = [
  {
    MaPX: "PX001",
    MaCN: "CN01",
    MaNV: "NV005",
    NgayXuat: "2026-05-23T10:00",
    LyDo: "USE",
    GhiChu: "Xuất nguyên liệu sử dụng trong ngày",
    TrangThai: 1,
    IsSynced: false,
    CreatedAt: "2026-05-23T10:00:00",
    UpdatedAt: "2026-05-23T10:00:00",
  },
  {
    MaPX: "PX002",
    MaCN: "CN02",
    MaNV: "NV007",
    NgayXuat: "2026-05-23T11:00",
    LyDo: "EXPIRE",
    GhiChu: "Hủy nguyên liệu hết hạn",
    TrangThai: 1,
    IsSynced: false,
    CreatedAt: "2026-05-23T11:00:00",
    UpdatedAt: "2026-05-23T11:00:00",
  },
];

const initialDetails: ExportDetail[] = [
  { MaPX: "PX001", MaNL: "NL001", SoLuong: 2000 },
  { MaPX: "PX001", MaNL: "NL002", SoLuong: 5000 },
  { MaPX: "PX002", MaNL: "NL002", SoLuong: 1000 },
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

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
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

const toInputDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const mergeInventoryStocks = (stocks: InventoryStock[]) => {
  const stockMap = new Map<string, InventoryStock>();

  stocks.forEach((stock) => {
    const key = `${stock.MaCN}-${stock.MaNL}`;
    const oldStock = stockMap.get(key);
    const stockQuantity = Number(stock.SoLuongTon || 0);

    if (oldStock) {
      stockMap.set(key, {
        ...oldStock,
        SoLuongTon: Number(oldStock.SoLuongTon || 0) + stockQuantity,
        UpdatedAt: stock.UpdatedAt || oldStock.UpdatedAt,
      });
    } else {
      stockMap.set(key, {
        ...stock,
        SoLuongTon: stockQuantity,
      });
    }
  });

  return Array.from(stockMap.values());
};

const isActiveStatus = (value: string | number | undefined) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "number") return value === 1;

  const normalized = value.trim().toLowerCase();

  return ["1", "active", "hoat_dong", "hoạt động", "đang hoạt động"].includes(
    normalized,
  );
};

const mapApiReceipt = (receipt: ApiExportReceipt): ExportReceipt => ({
  MaPX: receipt.maPX,
  MaCN: receipt.maCN,
  MaNV: receipt.maNV,
  NgayXuat: receipt.ngayXuat,
  LyDo: normalizeExportReason(receipt.lyDo),
  GhiChu: "",
  TrangThai: receipt.trangThai === 0 || receipt.trangThai === "0" ? 0 : 1,
  IsSynced: true,
  CreatedAt: receipt.ngayXuat,
});

const mapApiDetails = (receipt: ApiExportReceipt): ExportDetail[] =>
  (receipt.chiTiet || []).map((detail) => ({
    MaPX: receipt.maPX,
    MaNL: detail.maNL,
    SoLuong: detail.soLuong || 0,
  }));

const mapApiBranch = (branch: ApiBranch): Branch => ({
  MaCN: branch.maCN,
  TenCN: branch.tenCN,
  DiaChi: branch.diaChi,
  TrangThai: branch.trangThai ?? 1,
});

const mapApiEmployee = (employee: ApiEmployee): Employee => ({
  MaNV: employee.maNV,
  Username: employee.username,
  TenNV: employee.tenNV,
  ChucVu: employee.chucVu,
  MaCN: employee.maCN ?? null,
  TrangThai: employee.trangThai ?? 1,
});

const mapApiIngredient = (ingredient: ApiIngredient): Ingredient => ({
  MaNL: ingredient.maNL,
  TenNL: ingredient.tenNL,
  DonViCoBan: ingredient.donViCoBan || ingredient.tenDonVi || "",
  TonToiThieu: ingredient.tonToiThieu || 0,
  TrangThai: isActiveStatus(ingredient.trangThai) ? 1 : 0,
});

const mapApiUnit = (unit: ApiUnit): Unit => ({
  MaDV: unit.maDV,
  TenDonVi: unit.tenDonVi,
  TrangThai: unit.trangThai ?? 1,
});

const mapApiInventoryStock = (stock: ApiInventoryStock): InventoryStock => ({
  MaCN: stock.maCN || stock.chiNhanh || "",
  MaNL: stock.maNL,
  SoLuongTon: stock.tonHienTai || 0,
});

const getMonthRangeParams = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);

  return {
    tuNgay: toInputDateTime(firstDay),
    denNgay: toInputDateTime(lastDay),
  };
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

export default function InventoryExportPage() {
  const [receipts, setReceipts] = useState<ExportReceipt[]>(initialReceipts);
  const [details, setDetails] = useState<ExportDetail[]>(initialDetails);
  const [inventory, setInventory] =
    useState<InventoryStock[]>(initialInventory);

  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReason, setSelectedReason] = useState<ExportReason>("USE");
  const [exportDate, setExportDate] = useState(toInputDateTime(new Date()));
  const [note, setNote] = useState("");

  const [exportItems, setExportItems] = useState<ExportFormItem[]>([
    {
      RowId: 1,
      MaNL: "",
      SoLuong: 0,
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [haoHutStats, setHaoHutStats] = useState<ApiHaoHutXuatKho[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const pageSize = 10;

  const loadData = async (filterMaCN = branchFilter) => {
    try {
      setIsLoading(true);
      const user = getCurrentUser();
      const effectiveMaCN =
        user?.chucVu === "NHANVIEN_KHO" && user.maCN
          ? user.maCN
          : filterMaCN;

      const receiptsResponse = await api.get<ApiExportReceipt[]>(
        "/api/xuatkho",
        {
          params: effectiveMaCN !== "all" ? { maCN: effectiveMaCN } : undefined,
        },
      );

      const [
        branchesResult,
        employeesResult,
        ingredientsResult,
        unitsResult,
        inventoryResult,
        haoHutResult,
      ] = await Promise.allSettled([
        api.get<ApiBranch[]>("/api/chinhanh"),
        api.get<ApiEmployee[]>("/api/nhanvien"),
        api.get<ApiIngredient[]>("/api/nguyenlieu"),
        api.get<ApiUnit[]>("/api/donvi"),
        api.get<ApiInventoryStock[]>("/api/inventory/stock"),
        effectiveMaCN !== "all"
          ? api.get<ApiHaoHutXuatKho[]>("/api/xuatkho/hao-hut", {
              params: {
                maCN: effectiveMaCN,
                ...getMonthRangeParams(),
              },
            })
          : api.get<ApiHaoHutXuatKho[]>("/api/xuatkho/hao-hut", {
              params: getMonthRangeParams(),
            }),
      ]);

      const apiReceipts = Array.isArray(receiptsResponse.data)
        ? receiptsResponse.data
        : [];

      setReceipts(apiReceipts.map(mapApiReceipt));
      setDetails(apiReceipts.flatMap(mapApiDetails));
      setBranches(
        branchesResult.status === "fulfilled" &&
          Array.isArray(branchesResult.value.data)
          ? branchesResult.value.data.map(mapApiBranch)
          : initialBranches,
      );
      setEmployees(
        employeesResult.status === "fulfilled" &&
          Array.isArray(employeesResult.value.data)
          ? employeesResult.value.data.map(mapApiEmployee)
          : initialEmployees,
      );
      setIngredients(
        ingredientsResult.status === "fulfilled" &&
          Array.isArray(ingredientsResult.value.data)
          ? ingredientsResult.value.data.map(mapApiIngredient)
          : initialIngredients,
      );
      setUnits(
        unitsResult.status === "fulfilled" && Array.isArray(unitsResult.value.data)
          ? unitsResult.value.data.map(mapApiUnit)
          : initialUnits,
      );
      setInventory(
        inventoryResult.status === "fulfilled" &&
          Array.isArray(inventoryResult.value.data)
          ? mergeInventoryStocks(inventoryResult.value.data.map(mapApiInventoryStock))
          : initialInventory,
      );
      setHaoHutStats(
        haoHutResult.status === "fulfilled" &&
          Array.isArray(haoHutResult.value.data)
          ? haoHutResult.value.data
          : [],
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không tải được danh sách phiếu xuất từ backend";
      alert(message);

      const storedReceipts = getFromStorage<ExportReceipt>(
        receiptStorageKey,
        initialReceipts,
      ).map((receipt) => ({
        ...receipt,
        LyDo: normalizeExportReason(receipt.LyDo),
      }));

      setReceipts(storedReceipts);
      setDetails(getFromStorage<ExportDetail>(detailStorageKey, initialDetails));
      setBranches(getFromStorage<Branch>(branchStorageKey, initialBranches));
      setEmployees(
        getFromStorage<Employee>(employeeStorageKey, initialEmployees),
      );
      setIngredients(
        getFromStorage<Ingredient>(ingredientStorageKey, initialIngredients),
      );
      setUnits(getFromStorage<Unit>(unitStorageKey, initialUnits));
      setInventory(
        mergeInventoryStocks(
          getFromStorage<InventoryStock>(inventoryStorageKey, initialInventory),
        ),
      );
      setHaoHutStats([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadData();

    const handleStorage = () => loadData();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [branchFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, branchFilter, reasonFilter]);

  useEffect(() => {
    if (currentUser?.maNV) {
      setSelectedEmployee(currentUser.maNV);
    }
    if (
      (currentUser?.chucVu !== "NHANVIEN_KHO" &&
        currentUser?.chucVu !== "QUANLY_CHINHANH") ||
      !currentUser.maCN
    ) return;

    setBranchFilter(currentUser.maCN);
    setSelectedBranch(currentUser.maCN);
  }, [currentUser]);

  useEffect(() => {
    const employee = employees.find(
      (item) =>
        item.MaNV === selectedEmployee &&
        item.TrangThai === 1 &&
        (item.MaCN === selectedBranch || item.MaCN === null),
    );

    if (!employee) {
      const firstEmployee = employees.find(
        (item) =>
          item.TrangThai === 1 &&
          (item.MaCN === selectedBranch || item.MaCN === null),
      );

      if (firstEmployee) {
        setSelectedEmployee(firstEmployee.MaNV);
      }
    }
  }, [selectedBranch, selectedEmployee, employees]);

  const isBranchRestricted =
    currentUser?.chucVu === "NHANVIEN_KHO" ||
    currentUser?.chucVu === "QUANLY_CHINHANH";
  const activeBranches = branches.filter(
    (branch) =>
      branch.TrangThai === 1 &&
      (!isBranchRestricted || !currentUser?.maCN || branch.MaCN === currentUser.maCN),
  );

  const activeEmployees = employees.filter(
    (employee) =>
      employee.TrangThai === 1 &&
      (employee.MaCN === selectedBranch || employee.MaCN === null),
  );

  const activeIngredients = ingredients.filter(
    (ingredient) => ingredient.TrangThai === 1,
  );

  const getBranchName = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const getEmployeeName = (MaNV: string) => {
    return employees.find((employee) => employee.MaNV === MaNV)?.TenNV || MaNV;
  };

  const getIngredient = (MaNL: string) => {
    return ingredients.find((ingredient) => ingredient.MaNL === MaNL);
  };

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const getCurrentStock = (MaCN: string, MaNL: string) => {
    return (
      inventory.find((stock) => stock.MaCN === MaCN && stock.MaNL === MaNL)
        ?.SoLuongTon || 0
    );
  };

  const resetForm = () => {
    const firstBranch = currentUser?.maCN || activeBranches[0]?.MaCN || "";

    const firstEmployee =
      currentUser?.maNV ||
      employees.find(
        (item) =>
          item.TrangThai === 1 &&
          (item.MaCN === firstBranch || item.MaCN === null),
      )?.MaNV ||
      "";

    setSelectedBranch(firstBranch);
    setSelectedEmployee(firstEmployee);
    setSelectedReason("USE");
    setExportDate(toInputDateTime(new Date()));
    setNote("");
    setExportItems([
      {
        RowId: 1,
        MaNL: "",
        SoLuong: 0,
      },
    ]);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const addItem = () => {
    const nextRowId = Math.max(...exportItems.map((item) => item.RowId), 0) + 1;

    setExportItems([
      ...exportItems,
      {
        RowId: nextRowId,
        MaNL: "",
        SoLuong: 0,
      },
    ]);
  };

  const removeItem = (rowId: number) => {
    if (exportItems.length <= 1) return;

    setExportItems(exportItems.filter((item) => item.RowId !== rowId));
  };

  const updateItem = (
    rowId: number,
    field: keyof ExportFormItem,
    value: string | number,
  ) => {
    setExportItems(
      exportItems.map((item) =>
        item.RowId === rowId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleConfirmExport = async () => {
    if (!selectedBranch || !selectedEmployee || !exportDate) {
      alert("Vui lòng chọn chi nhánh, nhân viên và ngày xuất");
      return;
    }

    const hasInvalidItem = exportItems.some(
      (item) => !item.MaNL || item.SoLuong <= 0,
    );

    if (hasInvalidItem) {
      alert("Vui lòng chọn nguyên liệu và nhập số lượng xuất lớn hơn 0");
      return;
    }

    const duplicatedIngredient = exportItems.some((item, index) =>
      exportItems.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && otherItem.MaNL === item.MaNL,
      ),
    );

    if (duplicatedIngredient) {
      alert(
        "Một nguyên liệu không nên xuất hiện nhiều lần trong cùng phiếu xuất",
      );
      return;
    }

    const notEnoughStock = exportItems.find((item) => {
      const currentStock = getCurrentStock(selectedBranch, item.MaNL);
      return item.SoLuong > currentStock;
    });

    if (notEnoughStock) {
      const ingredient = getIngredient(notEnoughStock.MaNL);
      const currentStock = getCurrentStock(selectedBranch, notEnoughStock.MaNL);

      alert(
        `Không đủ tồn kho cho ${
          ingredient?.TenNL || notEnoughStock.MaNL
        }. Tồn hiện tại: ${formatNumber(currentStock)}`,
      );
      return;
    }

    const payload = {
      maCN: selectedBranch,
      maNV: selectedEmployee,
      lyDo: toBackendExportReason(selectedReason),
      chiTiet: exportItems.map((item) => ({
        maNL: item.MaNL,
        soLuong: item.SoLuong,
      })),
    };

    try {
      setIsSubmitting(true);
      const response = await api.post<ApiExportReceipt>(
        getCreateExportEndpoint(selectedReason),
        payload,
      );
      await api.get<ApiExportReceipt>(`/api/xuatkho/${response.data.maPX}`);
      await loadData();

      alert("Tạo phiếu xuất thành công và backend đã cập nhật tồn kho");
      handleCloseDrawer();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không tạo được phiếu xuất kho";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportRows = useMemo(() => {
    return details.map((detail) => {
      const receipt = receipts.find((item) => item.MaPX === detail.MaPX);
      const ingredient = getIngredient(detail.MaNL);

      return {
        MaPX: detail.MaPX,
        NgayXuat: receipt?.NgayXuat || "",
        MaNL: detail.MaNL,
        TenNL: ingredient?.TenNL || detail.MaNL,
        DonVi: ingredient ? getUnitName(ingredient.DonViCoBan) : "-",
        SoLuong: Number(detail.SoLuong || 0),
        LyDo: normalizeExportReason(receipt?.LyDo),
        MaCN: receipt?.MaCN || "",
        TenCN: receipt ? getBranchName(receipt.MaCN) : "",
        MaNV: receipt?.MaNV || "",
        TenNV: receipt ? getEmployeeName(receipt.MaNV) : "",
        GhiChu: receipt?.GhiChu || "",
      };
    });
  }, [details, receipts, ingredients, units, branches, employees]);

  const filteredData = useMemo(() => {
    return exportRows.filter((item) => {
      const matchesSearch =
        item.MaPX.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenCN.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" || item.MaCN === branchFilter;

      const matchesReason =
        reasonFilter === "all" ||
        normalizeExportReason(item.LyDo) === reasonFilter;

      return matchesSearch && matchesBranch && matchesReason;
    });
  }, [exportRows, searchQuery, branchFilter, reasonFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleExportExcel = () => {
    const headers = [
      "Mã phiếu",
      "Ngày xuất",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Số lượng",
      "Đơn vị",
      "Lý do",
      "Chi nhánh",
      "Nhân viên",
      "Ghi chú",
    ];

    const rows = filteredData.map((item) => [
      item.MaPX,
      item.NgayXuat,
      item.MaNL,
      item.TenNL,
      item.SoLuong,
      item.DonVi,
      getReasonInfo(item.LyDo).label,
      item.TenCN,
      item.TenNV,
      item.GhiChu,
    ]);

    downloadCsv("phieu-xuat-kho.csv", headers, rows);
  };

  const haoHutTotal = haoHutStats.reduce(
    (sum, item) => sum + Number(item.tongSoLuong || 0),
    0,
  );

  return (
    <MainLayout
      title="Xuất kho"
      breadcrumb="Trang chủ / Kho nguyên liệu / Xuất kho"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <PackageMinus className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng phiếu xuất</p>
                <p className="text-2xl font-bold text-foreground">
                  {receipts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tổng dòng chi tiết</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {details.length}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tổng lượng xuất</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatNumber(
                details.reduce(
                  (sum, detail) => sum + Number(detail.SoLuong || 0),
                  0,
                ),
              )}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Hao hụt tháng này</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {formatNumber(haoHutTotal)}
            </p>
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
            value={reasonFilter}
            onValueChange={(value) => {
              setReasonFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lý do" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả lý do</SelectItem>
              <SelectItem value="USE">Sử dụng</SelectItem>
              <SelectItem value="EXPIRE">Hết hạn</SelectItem>
              <SelectItem value="DAMAGE">Hư hỏng</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm mã phiếu, nguyên liệu, chi nhánh..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => loadData()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            {isLoading ? "Đang tải" : "Làm mới"}
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>

          <Button className="gap-2" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Tạo phiếu xuất
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {[
                    "Mã phiếu",
                    "Ngày xuất",
                    "Nguyên liệu",
                    "Số lượng",
                    "Đơn vị",
                    "Lý do",
                    "Chi nhánh",
                    "Nhân viên",
                    "Ghi chú",
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
                {paginatedData.map((item, index) => {
                  const reason = getReasonInfo(item.LyDo);

                  return (
                    <tr
                      key={`${item.MaPX}-${item.MaNL}-${index}`}
                      className="hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-primary">
                        {item.MaPX}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDateTime(item.NgayXuat)}
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          {item.TenNL}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.MaNL}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                        {formatNumber(item.SoLuong)}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.DonVi}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-1 text-xs font-medium",
                            reason.className,
                          )}
                        >
                          {reason.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.TenCN}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.TenNV}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.GhiChu || "—"}
                      </td>
                    </tr>
                  );
                })}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có phiếu xuất phù hợp
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
              {filteredData.length} dòng xuất kho
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseDrawer}
          />

          <div className="relative z-10 flex h-full w-[820px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">Tạo phiếu xuất kho</h3>

              <button
                onClick={handleCloseDrawer}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã phiếu</Label>

                  <Input
                    value="Tự động tạo khi lưu"
                    disabled
                    className="mt-1.5 bg-muted"
                  />
                </div>

                <div>
                  <Label>Ngày xuất *</Label>

                  <Input
                    type="datetime-local"
                    value={exportDate}
                    onChange={(event) => setExportDate(event.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Chi nhánh xuất *</Label>

                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                    disabled={isBranchRestricted}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>

                    <SelectContent>
                      {activeBranches.map((branch) => (
                        <SelectItem key={branch.MaCN} value={branch.MaCN}>
                          {branch.TenCN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nhân viên xuất *</Label>

                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                    disabled
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>

                    <SelectContent>
                      {activeEmployees.map((employee) => (
                        <SelectItem key={employee.MaNV} value={employee.MaNV}>
                          {employee.MaNV} - {employee.TenNV}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Lý do xuất *</Label>

                  <Select
                    value={selectedReason}
                    onValueChange={(value) =>
                      setSelectedReason(normalizeExportReason(value))
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn lý do" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="USE">Sử dụng</SelectItem>
                      <SelectItem value="EXPIRE">Hết hạn</SelectItem>
                      <SelectItem value="DAMAGE">Hư hỏng</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Ghi chú</Label>

                  <Textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Nhập ghi chú nếu có"
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border">
                <div className="border-b border-border p-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi tiết nguyên liệu xuất
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="w-12 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          STT
                        </th>

                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nguyên liệu
                        </th>

                        <th className="w-28 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Đơn vị
                        </th>

                        <th className="w-32 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tồn hiện tại
                        </th>

                        <th className="w-36 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Số lượng xuất
                        </th>

                        <th className="w-14 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {exportItems.map((item, index) => {
                        const ingredient = getIngredient(item.MaNL);
                        const currentStock =
                          selectedBranch && item.MaNL
                            ? getCurrentStock(selectedBranch, item.MaNL)
                            : 0;

                        return (
                          <tr key={item.RowId}>
                            <td className="px-3 py-2 text-center text-sm text-muted-foreground">
                              {index + 1}
                            </td>

                            <td className="px-3 py-2">
                              <Select
                                value={item.MaNL}
                                onValueChange={(value) =>
                                  updateItem(item.RowId, "MaNL", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn nguyên liệu" />
                                </SelectTrigger>

                                <SelectContent>
                                  {activeIngredients.map((ingredient) => (
                                    <SelectItem
                                      key={ingredient.MaNL}
                                      value={ingredient.MaNL}
                                    >
                                      {ingredient.MaNL} - {ingredient.TenNL}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>

                            <td className="px-3 py-2 text-center text-sm text-muted-foreground">
                              {ingredient
                                ? getUnitName(ingredient.DonViCoBan)
                                : "-"}
                            </td>

                            <td className="px-3 py-2 text-center text-sm font-medium text-foreground">
                              {selectedBranch && item.MaNL
                                ? formatNumber(currentStock)
                                : "-"}
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                value={item.SoLuong || ""}
                                onChange={(event) =>
                                  updateItem(
                                    item.RowId,
                                    "SoLuong",
                                    Number(event.target.value) || 0,
                                  )
                                }
                                className="text-right"
                              />
                            </td>

                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => removeItem(item.RowId)}
                                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                                disabled={exportItems.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-border p-3">
                  <Button variant="outline" onClick={addItem} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm nguyên liệu
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border p-4">
              <Button variant="outline" onClick={handleCloseDrawer}>
                Hủy
              </Button>

              <Button onClick={handleConfirmExport} disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý" : "Xác nhận xuất kho"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
