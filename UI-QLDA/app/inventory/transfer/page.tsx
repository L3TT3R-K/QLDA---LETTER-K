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
  ArrowRightLeft,
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
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/permissions";
import api from "@/services/api";

type TransferStatus = "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";

interface TransferReceipt {
  MaPC: string;
  MaCNXuat: string;
  MaCNNhap: string;
  MaNVTao: string;
  NgayTao: string;
  TrangThai: string;
  GhiChu?: string;
  IsSynced: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

interface TransferDetail {
  MaPC: string;
  MaNL: string;
  SoLuong: number;
}

interface TransferFormItem {
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

interface ApiTransferDetail {
  maLo?: string;
  maNL: string;
  tenNL?: string;
  soLuong: number;
  hanSuDung?: string;
}

interface ApiTransferReceipt {
  maPC: string;
  maCNXuat: string;
  maCNNhap: string;
  maNVTao: string;
  tenNVTao?: string;
  ngayTao: string;
  trangThai: string | number;
  chiTiet?: ApiTransferDetail[];
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

const receiptStorageKey = "PHIEUCHUYEN";
const detailStorageKey = "CTPC";
const inventoryStorageKey = "TONKHO";
const branchStorageKey = "CHINHANH";
const employeeStorageKey = "NHANVIEN";
const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";

const transferApi = {
  list: (params?: { maKho?: string; trangThai?: string }) =>
    api.get<ApiTransferReceipt[]>("/api/dieuchuyenkho", { params }),
  create: (payload: {
    maCNXuat: string;
    maCNNhap: string;
    maNVTao: string;
    chiTiet: Array<{ maNL: string; soLuong: number }>;
  }) => api.post<ApiTransferReceipt>("/api/dieuchuyenkho", payload),
  getById: (maPDC: string) =>
    api.get<ApiTransferReceipt>(`/api/dieuchuyenkho/${maPDC}`),
  send: (maPDC: string, payload: { maNV: string; ghiChu?: string }) =>
    api.post<ApiTransferReceipt>(`/api/dieuchuyenkho/${maPDC}/gui`, payload),
  receive: (maPDC: string, payload: { maNV: string; ghiChu?: string }) =>
    api.post<ApiTransferReceipt>(`/api/dieuchuyenkho/${maPDC}/nhan`, payload),
  cancel: (maPDC: string, payload?: { maNV: string; ghiChu?: string }) =>
    api.post<ApiTransferReceipt>(`/api/dieuchuyenkho/${maPDC}/huy`, payload),
};

const statusConfig: Record<
  TransferStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Chờ gửi",
    className: "bg-[#FFF3CD] text-[#856404]",
  },
  SENT: {
    label: "Đang chuyển",
    className: "bg-[#CFF4FC] text-[#055160]",
  },
  RECEIVED: {
    label: "Hoàn thành",
    className: "bg-[#D1E7DD] text-[#198754]",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-[#F8D7DA] text-[#DC3545]",
  },
};

const normalizeTransferStatus = (
  value?: string | number | null,
): TransferStatus => {
  const status = String(value || "").trim();
  const upperStatus = status.toUpperCase();
  const lowerStatus = status.toLowerCase();

  switch (status) {
    case "DRAFT":
    case "0":
    case "CHO_GUI":
    case "TAO_PHIEU":
    case "Tao phieu":
    case "Tạo phiếu":
    case "Chờ gửi":
    case "Cho gui":
      return "DRAFT";

    case "SENT":
    case "1":
    case "DA_GUI":
    case "DANG_CHUYEN":
    case "Đang chuyển":
    case "Đang chuyển":
    case "Dang chuyen":
      return "SENT";

    case "RECEIVED":
    case "COMPLETED":
    case "DONE":
    case "2":
    case "HOAN_THANH":
    case "DA_NHAN":
    case "Đã nhận":
    case "Da nhan":
    case "Hoàn thành":
    case "Hoan thanh":
      return "RECEIVED";

    case "CANCELLED":
    case "CANCELED":
    case "3":
    case "HUY":
    case "Hủy":
    case "Đã hủy":
    case "Da huy":
      return "CANCELLED";

    default:
      break;
  }

  if (
    upperStatus.includes("CANCEL") ||
    upperStatus.includes("HUY") ||
    lowerStatus.includes("huy") ||
    lowerStatus.includes("h\u1ee7y") ||
    lowerStatus.includes("Â§y")
  ) {
    return "CANCELLED";
  }

  if (
    upperStatus.includes("RECEIVED") ||
    upperStatus.includes("DA_NHAN") ||
    lowerStatus.includes("nhan") ||
    lowerStatus.includes("nh\u1eadn") ||
    lowerStatus.includes("nhÃ")
  ) {
    return "RECEIVED";
  }

  if (
    upperStatus.includes("SENT") ||
    upperStatus.includes("DANG_CHUYEN") ||
    lowerStatus.includes("chuyen") ||
    lowerStatus.includes("chuy\u1ec3n") ||
    lowerStatus.includes("chuyÃ")
  ) {
    return "SENT";
  }

  if (
    upperStatus.includes("TAO_PHIEU") ||
    upperStatus.includes("CHO_GUI") ||
    lowerStatus.includes("tao") ||
    lowerStatus.includes("t\u1ea1o") ||
    lowerStatus.includes("phi")
  ) {
    return "DRAFT";
  }

  return "DRAFT";
};

const getTransferStatusInfo = (value?: string | number | null) => {
  return statusConfig[normalizeTransferStatus(value)];
};

const toBackendTransferStatus = (status: string) => {
  switch (normalizeTransferStatus(status)) {
    case "DRAFT":
      return "TAO_PHIEU";
    case "SENT":
      return "DANG_CHUYEN";
    case "RECEIVED":
      return "DA_NHAN";
    case "CANCELLED":
      return "HUY";
    default:
      return status;
  }
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

const initialReceipts: TransferReceipt[] = [
  {
    MaPC: "PC001",
    MaCNXuat: "CN01",
    MaCNNhap: "CN02",
    MaNVTao: "NV005",
    NgayTao: "2026-05-23T10:00",
    TrangThai: "RECEIVED",
    GhiChu: "Điều chuyển cà phê bột sang chi nhánh Quận 3",
    IsSynced: false,
    CreatedAt: "2026-05-23T10:00:00",
    UpdatedAt: "2026-05-23T10:00:00",
  },
  {
    MaPC: "PC002",
    MaCNXuat: "CN02",
    MaCNNhap: "CN03",
    MaNVTao: "NV007",
    NgayTao: "2026-05-23T11:00",
    TrangThai: "SENT",
    GhiChu: "Đang chuyển sữa tươi",
    IsSynced: false,
    CreatedAt: "2026-05-23T11:00:00",
    UpdatedAt: "2026-05-23T11:00:00",
  },
];

const initialDetails: TransferDetail[] = [
  { MaPC: "PC001", MaNL: "NL001", SoLuong: 5000 },
  { MaPC: "PC002", MaNL: "NL002", SoLuong: 2000 },
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

const mapApiReceipt = (receipt: ApiTransferReceipt): TransferReceipt => ({
  MaPC: receipt.maPC,
  MaCNXuat: receipt.maCNXuat,
  MaCNNhap: receipt.maCNNhap,
  MaNVTao: receipt.maNVTao,
  NgayTao: receipt.ngayTao,
  TrangThai: normalizeTransferStatus(receipt.trangThai),
  GhiChu: "",
  IsSynced: true,
  CreatedAt: receipt.ngayTao,
});

const mapApiDetails = (receipt: ApiTransferReceipt): TransferDetail[] =>
  (receipt.chiTiet || []).map((detail) => ({
    MaPC: receipt.maPC,
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

export default function InventoryTransferPage() {
  const [receipts, setReceipts] = useState<TransferReceipt[]>(initialReceipts);
  const [details, setDetails] = useState<TransferDetail[]>(initialDetails);
  const [inventory, setInventory] =
    useState<InventoryStock[]>(initialInventory);

  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [transferDate, setTransferDate] = useState(toInputDateTime(new Date()));
  const [note, setNote] = useState("");

  const [transferItems, setTransferItems] = useState<TransferFormItem[]>([
    {
      RowId: 1,
      MaNL: "",
      SoLuong: 0,
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMaPC, setActionMaPC] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const pageSize = 10;

  const loadData = async (
    filterBranch = branchFilter,
    filterStatus = statusFilter,
  ) => {
    try {
      setIsLoading(true);

      const receiptsParams = {
        ...(filterBranch !== "all" ? { maKho: filterBranch } : {}),
        ...(filterStatus !== "all"
          ? { trangThai: toBackendTransferStatus(filterStatus) }
          : {}),
      };

      const receiptsResponse = await transferApi.list(
        Object.keys(receiptsParams).length > 0 ? receiptsParams : undefined,
      );

      const [
        branchesResult,
        employeesResult,
        ingredientsResult,
        unitsResult,
        inventoryResult,
      ] = await Promise.allSettled([
        api.get<ApiBranch[]>("/api/chinhanh"),
        api.get<ApiEmployee[]>("/api/nhanvien"),
        api.get<ApiIngredient[]>("/api/nguyenlieu"),
        api.get<ApiUnit[]>("/api/donvi"),
        api.get<ApiInventoryStock[]>("/api/inventory/stock"),
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
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không tải được danh sách phiếu điều chuyển từ backend";
      alert(message);

      setReceipts(
        getFromStorage<TransferReceipt>(receiptStorageKey, initialReceipts).map(
          (receipt) => ({
            ...receipt,
            TrangThai: normalizeTransferStatus(receipt.TrangThai),
          }),
        ),
      );
      setDetails(getFromStorage<TransferDetail>(detailStorageKey, initialDetails));
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
  }, [branchFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, branchFilter, statusFilter]);

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
    setFromBranch(currentUser.maCN);
  }, [currentUser]);

  useEffect(() => {
    const employee = employees.find(
      (item) =>
        item.MaNV === selectedEmployee &&
        item.TrangThai === 1 &&
        (item.MaCN === fromBranch || item.MaCN === null),
    );

    if (!employee) {
      const firstEmployee = employees.find(
        (item) =>
          item.TrangThai === 1 &&
          (item.MaCN === fromBranch || item.MaCN === null),
      );

      if (firstEmployee) {
        setSelectedEmployee(firstEmployee.MaNV);
      }
    }
  }, [fromBranch, selectedEmployee, employees]);

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);
  const isBranchRestricted =
    currentUser?.chucVu === "NHANVIEN_KHO" ||
    currentUser?.chucVu === "QUANLY_CHINHANH";
  const activeSourceBranches = activeBranches.filter(
    (branch) =>
      !isBranchRestricted || !currentUser?.maCN || branch.MaCN === currentUser.maCN,
  );

  const activeEmployees = employees.filter(
    (employee) =>
      employee.TrangThai === 1 &&
      (employee.MaCN === fromBranch || employee.MaCN === null),
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
    const defaultFrom =
      currentUser?.maCN || activeSourceBranches[0]?.MaCN || "";
    const defaultTo =
      activeBranches.find((branch) => branch.MaCN !== defaultFrom)?.MaCN ||
      "";

    const firstEmployee =
      currentUser?.maNV ||
      employees.find(
        (item) =>
          item.TrangThai === 1 &&
          (item.MaCN === defaultFrom || item.MaCN === null),
      )?.MaNV ||
      "";

    setFromBranch(defaultFrom);
    setToBranch(defaultTo);
    setSelectedEmployee(firstEmployee);
    setTransferDate(toInputDateTime(new Date()));
    setNote("");
    setTransferItems([
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
    const nextRowId =
      Math.max(...transferItems.map((item) => item.RowId), 0) + 1;

    setTransferItems([
      ...transferItems,
      {
        RowId: nextRowId,
        MaNL: "",
        SoLuong: 0,
      },
    ]);
  };

  const removeItem = (rowId: number) => {
    if (transferItems.length <= 1) return;

    setTransferItems(transferItems.filter((item) => item.RowId !== rowId));
  };

  const updateItem = (
    rowId: number,
    field: keyof TransferFormItem,
    value: string | number,
  ) => {
    setTransferItems(
      transferItems.map((item) =>
        item.RowId === rowId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const updateInventoryAfterTransfer = (
    currentInventory: InventoryStock[],
    items: TransferFormItem[],
    MaCNXuat: string,
    MaCNNhap: string,
  ) => {
    const updatedInventory = [...currentInventory];

    items.forEach((item) => {
      const fromIndex = updatedInventory.findIndex(
        (stock) => stock.MaCN === MaCNXuat && stock.MaNL === item.MaNL,
      );

      if (fromIndex >= 0) {
        updatedInventory[fromIndex] = {
          ...updatedInventory[fromIndex],
          SoLuongTon:
            Number(updatedInventory[fromIndex].SoLuongTon || 0) -
            Number(item.SoLuong || 0),
          UpdatedAt: new Date().toISOString(),
        };
      }

      const toIndex = updatedInventory.findIndex(
        (stock) => stock.MaCN === MaCNNhap && stock.MaNL === item.MaNL,
      );

      if (toIndex >= 0) {
        updatedInventory[toIndex] = {
          ...updatedInventory[toIndex],
          SoLuongTon:
            Number(updatedInventory[toIndex].SoLuongTon || 0) +
            Number(item.SoLuong || 0),
          UpdatedAt: new Date().toISOString(),
        };
      } else {
        updatedInventory.push({
          MaCN: MaCNNhap,
          MaNL: item.MaNL,
          SoLuongTon: Number(item.SoLuong || 0),
          UpdatedAt: new Date().toISOString(),
        });
      }
    });

    return mergeInventoryStocks(updatedInventory);
  };

  const handleConfirmTransfer = async () => {
    if (!fromBranch || !toBranch || !selectedEmployee || !transferDate) {
      alert(
        "Vui lòng chọn chi nhánh xuất, chi nhánh nhận, nhân viên và ngày chuyển",
      );
      return;
    }

    if (fromBranch === toBranch) {
      alert("Chi nhánh xuất và chi nhánh nhận không được trùng nhau");
      return;
    }

    const hasInvalidItem = transferItems.some(
      (item) => !item.MaNL || item.SoLuong <= 0,
    );

    if (hasInvalidItem) {
      alert("Vui lòng chọn nguyên liệu và nhập số lượng chuyển lớn hơn 0");
      return;
    }

    const duplicatedIngredient = transferItems.some((item, index) =>
      transferItems.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && otherItem.MaNL === item.MaNL,
      ),
    );

    if (duplicatedIngredient) {
      alert(
        "Một nguyên liệu không nên xuất hiện nhiều lần trong cùng phiếu điều chuyển",
      );
      return;
    }

    const notEnoughStock = transferItems.find((item) => {
      const currentStock = getCurrentStock(fromBranch, item.MaNL);
      return item.SoLuong > currentStock;
    });

    if (notEnoughStock) {
      const ingredient = getIngredient(notEnoughStock.MaNL);
      const currentStock = getCurrentStock(fromBranch, notEnoughStock.MaNL);

      alert(
        `Không đủ tồn kho ở chi nhánh xuất cho ${
          ingredient?.TenNL || notEnoughStock.MaNL
        }. Tồn hiện tại: ${formatNumber(currentStock)}`,
      );
      return;
    }

    const payload = {
      maCNXuat: fromBranch,
      maCNNhap: toBranch,
      maNVTao: selectedEmployee,
      chiTiet: transferItems.map((item) => ({
        maNL: item.MaNL,
        soLuong: item.SoLuong,
      })),
    };

    try {
      setIsSubmitting(true);
      const response = await transferApi.create(payload);
      await transferApi.getById(response.data.maPC);
      await loadData();

      alert("Tạo phiếu điều chuyển thành công");
      handleCloseDrawer();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không tạo được phiếu điều chuyển kho";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferAction = async (
    maPC: string,
    action: "gui" | "nhan" | "huy",
  ) => {
    const actionLabel =
      action === "gui" ? "gửi" : action === "nhan" ? "nhận" : "hủy";
    const isConfirmed = confirm(
      `Bạn có chắc muốn ${actionLabel} phiếu điều chuyển ${maPC} không?`,
    );

    if (!isConfirmed) return;

    try {
      setActionMaPC(maPC);
      const payload = {
        maNV: selectedEmployee,
        ghiChu: note.trim(),
      };

      if (action === "gui") {
        await transferApi.send(maPC, payload);
      } else if (action === "nhan") {
        await transferApi.receive(maPC, payload);
      } else {
        await transferApi.cancel(maPC, payload);
      }

      await transferApi.getById(maPC);
      await loadData();
      alert(`Đã ${actionLabel} phiếu điều chuyển ${maPC}`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        `Không ${actionLabel} được phiếu điều chuyển`;
      alert(message);
    } finally {
      setActionMaPC(null);
    }
  };

  const transferRows = useMemo(() => {
    return details.map((detail) => {
      const receipt = receipts.find((item) => item.MaPC === detail.MaPC);
      const ingredient = getIngredient(detail.MaNL);

      return {
        MaPC: detail.MaPC,
        NgayTao: receipt?.NgayTao || "",
        MaNL: detail.MaNL,
        TenNL: ingredient?.TenNL || detail.MaNL,
        DonVi: ingredient ? getUnitName(ingredient.DonViCoBan) : "-",
        SoLuong: Number(detail.SoLuong || 0),
        MaCNXuat: receipt?.MaCNXuat || "",
        TenCNXuat: receipt ? getBranchName(receipt.MaCNXuat) : "",
        MaCNNhap: receipt?.MaCNNhap || "",
        TenCNNhap: receipt ? getBranchName(receipt.MaCNNhap) : "",
        MaNVTao: receipt?.MaNVTao || "",
        TenNVTao: receipt ? getEmployeeName(receipt.MaNVTao) : "",
        TrangThai: normalizeTransferStatus(receipt?.TrangThai),
        GhiChu: receipt?.GhiChu || "",
      };
    });
  }, [details, receipts, ingredients, units, branches, employees]);

  const filteredData = useMemo(() => {
    return transferRows.filter((item) => {
      const matchesSearch =
        item.MaPC.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenCNXuat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenCNNhap.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" ||
        item.MaCNXuat === branchFilter ||
        item.MaCNNhap === branchFilter;

      const matchesStatus =
        statusFilter === "all" ||
        normalizeTransferStatus(item.TrangThai) === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [transferRows, searchQuery, branchFilter, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleExportExcel = () => {
    const headers = [
      "Mã phiếu",
      "Ngày tạo",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Số lượng",
      "Đơn vị",
      "Chi nhánh xuất",
      "Chi nhánh nhập",
      "Trạng thái",
      "Nhân viên tạo",
      "Ghi chú",
    ];

    const rows = filteredData.map((item) => [
      item.MaPC,
      item.NgayTao,
      item.MaNL,
      item.TenNL,
      item.SoLuong,
      item.DonVi,
      item.TenCNXuat,
      item.TenCNNhap,
      getTransferStatusInfo(item.TrangThai).label,
      item.TenNVTao,
      item.GhiChu,
    ]);

    downloadCsv("phieu-dieu-chuyen-kho.csv", headers, rows);
  };

  return (
    <MainLayout
      title="Điều chuyển kho"
      breadcrumb="Trang chủ / Kho nguyên liệu / Điều chuyển kho"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Tổng phiếu chuyển
                </p>
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
            <p className="text-sm text-muted-foreground">Tổng lượng chuyển</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatNumber(
                details.reduce(
                  (sum, detail) => sum + Number(detail.SoLuong || 0),
                  0,
                ),
              )}
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
              <SelectItem value="DRAFT">Chờ gửi</SelectItem>
              <SelectItem value="SENT">Đang chuyển</SelectItem>
              <SelectItem value="RECEIVED">Hoàn thành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
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
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
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
            Tạo phiếu chuyển
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {[
                    "Mã phiếu",
                    "Ngày tạo",
                    "Nguyên liệu",
                    "Số lượng",
                    "Đơn vị",
                    "Chi nhánh xuất",
                    "Chi nhánh nhập",
                    "Trạng thái",
                    "Nhân viên",
                    "Ghi chú",
                    "Thao tác",
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
                  const status = getTransferStatusInfo(item.TrangThai);
                  const canManageOutgoing =
                    !isBranchRestricted || currentUser?.maCN === item.MaCNXuat;
                  const canReceive =
                    !isBranchRestricted || currentUser?.maCN === item.MaCNNhap;

                  return (
                    <tr
                      key={`${item.MaPC}-${item.MaNL}-${index}`}
                      className="hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-primary">
                        {item.MaPC}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDateTime(item.NgayTao)}
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

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.TenCNXuat}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.TenCNNhap}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-md px-2 py-1 text-xs font-medium",
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.TenNVTao}
                      </td>

                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {item.GhiChu || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {item.TrangThai === "DRAFT" && canManageOutgoing && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionMaPC === item.MaPC}
                                onClick={() =>
                                  handleTransferAction(item.MaPC, "gui")
                                }
                              >
                                Gửi
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={actionMaPC === item.MaPC}
                                onClick={() =>
                                  handleTransferAction(item.MaPC, "huy")
                                }
                              >
                                Hủy
                              </Button>
                            </>
                          )}

                          {item.TrangThai === "SENT" && canReceive && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionMaPC === item.MaPC}
                              onClick={() =>
                                handleTransferAction(item.MaPC, "nhan")
                              }
                            >
                              Nhận
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có phiếu điều chuyển phù hợp
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
              {filteredData.length} dòng điều chuyển
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

          <div className="relative z-10 flex h-full w-[860px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                Tạo phiếu điều chuyển kho
              </h3>

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
                  <Label>Ngày tạo *</Label>

                  <Input
                    type="datetime-local"
                    value={transferDate}
                    onChange={(event) => setTransferDate(event.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Chi nhánh xuất *</Label>

                  <Select
                    value={fromBranch}
                    onValueChange={setFromBranch}
                    disabled={isBranchRestricted}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn chi nhánh xuất" />
                    </SelectTrigger>

                    <SelectContent>
                      {activeSourceBranches.map((branch) => (
                        <SelectItem key={branch.MaCN} value={branch.MaCN}>
                          {branch.TenCN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Chi nhánh nhập *</Label>

                  <Select value={toBranch} onValueChange={setToBranch}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn chi nhánh nhập" />
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

                <div className="col-span-2">
                  <Label>Nhân viên tạo *</Label>

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
                    Chi tiết nguyên liệu điều chuyển
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
                          Tồn chi nhánh xuất
                        </th>

                        <th className="w-40 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Số lượng chuyển
                        </th>

                        <th className="w-14 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {transferItems.map((item, index) => {
                        const ingredient = getIngredient(item.MaNL);
                        const currentStock =
                          fromBranch && item.MaNL
                            ? getCurrentStock(fromBranch, item.MaNL)
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
                              {fromBranch && item.MaNL
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
                                disabled={transferItems.length === 1}
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

              <Button onClick={handleConfirmTransfer} disabled={isSubmitting}>
                {isSubmitting ? "Đang xử lý" : "Xác nhận điều chuyển"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
