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
  PackagePlus,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/permissions";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportReceipt {
  MaPN: string;
  LoaiNguon: string;
  MaKhoNguon?: string;
  MaNCC: string;
  TenNCC?: string;
  MaCN: string;
  TenCN?: string;
  MaNV: string;
  TenNV?: string;
  NgayNhap: string;
  GhiChu?: string;
  TongTien: number;
  TrangThai: number;
  IsSynced: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

interface ImportDetail {
  MaPN: string;
  MaLo: string;
  MaLoNguon?: string;
  MaNL: string;
  TenNL?: string;
  SoLuong: number;
  DonGiaNhap: number;
  ThanhTien: number;
  HanSuDung: string;
}

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

interface ImportFormItem {
  RowId: number;
  MaNL: string;
  SoLuong: number;
  DonGiaNhap: number;
  HanSuDung: string;
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

interface Supplier {
  MaNCC: string;
  TenNCC: string;
  Sdt?: string;
  DiaChi?: string;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
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

type ImportSourceType = "NHA_CUNG_CAP" | "KHO_TONG";

interface ApiImportDetail {
  maLo: string;
  maNL: string;
  tenNL?: string;
  soLuong: number;
  donGiaNhap: number;
  thanhTien: number;
  hanSuDung?: string;
}

interface ApiImportReceipt {
  maPN: string;
  loaiNguon: string;
  maKhoNguon?: string;
  maNCC?: string;
  tenNCC?: string;
  maCN: string;
  tenCN?: string;
  maNV: string;
  tenNV?: string;
  ngayNhap: string;
  tongTien?: number;
  trangThai?: string | number;
  chiTiet?: ApiImportDetail[];
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
  tenChiNhanh?: string;
  trangThai?: number;
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

const branchStorageKey = "CHINHANH";
const employeeStorageKey = "NHANVIEN";
const supplierStorageKey = "NHACUNGCAP";
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

const initialSuppliers: Supplier[] = [
  {
    MaNCC: "NCC001",
    TenNCC: "Công ty CP Cà phê Trung Nguyên",
    TrangThai: 1,
  },
  {
    MaNCC: "NCC002",
    TenNCC: "Dairy Farm Việt Nam",
    TrangThai: 1,
  },
  {
    MaNCC: "NCC003",
    TenNCC: "Công ty TNHH Đường Biên Hòa",
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

const initialReceipts: ImportReceipt[] = [
  {
    MaPN: "PN001",
    LoaiNguon: "NCC",
    MaNCC: "NCC001",
    MaCN: "CN01",
    MaNV: "NV005",
    NgayNhap: "2026-05-23T08:00",
    GhiChu: "Nhập nguyên liệu đầu kỳ",
    TongTien: 2500000,
    TrangThai: 1,
    IsSynced: false,
    CreatedAt: "2026-05-23T08:00:00",
    UpdatedAt: "2026-05-23T08:00:00",
  },
  {
    MaPN: "PN002",
    LoaiNguon: "NCC",
    MaNCC: "NCC002",
    MaCN: "CN02",
    MaNV: "NV007",
    NgayNhap: "2026-05-23T09:00",
    GhiChu: "Nhập sữa tươi",
    TongTien: 1200000,
    TrangThai: 1,
    IsSynced: false,
    CreatedAt: "2026-05-23T09:00:00",
    UpdatedAt: "2026-05-23T09:00:00",
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
];

const initialDetails: ImportDetail[] = [
  {
    MaPN: "PN001",
    MaLo: "LO001",
    MaNL: "NL001",
    SoLuong: 25000,
    DonGiaNhap: 100,
    ThanhTien: 2500000,
    HanSuDung: "2026-12-31",
  },
  {
    MaPN: "PN002",
    MaLo: "LO002",
    MaNL: "NL002",
    SoLuong: 30000,
    DonGiaNhap: 40,
    ThanhTien: 1200000,
    HanSuDung: "2026-06-30",
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
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

const mapApiReceipt = (receipt: ApiImportReceipt): ImportReceipt => ({
  MaPN: receipt.maPN,
  LoaiNguon: receipt.loaiNguon,
  MaKhoNguon: receipt.maKhoNguon,
  MaNCC: receipt.maNCC || "",
  TenNCC: receipt.tenNCC,
  MaCN: receipt.maCN,
  TenCN: receipt.tenCN,
  MaNV: receipt.maNV,
  TenNV: receipt.tenNV,
  NgayNhap: receipt.ngayNhap,
  TongTien: receipt.tongTien || 0,
  TrangThai: receipt.trangThai === 1 || receipt.trangThai === "1" ? 1 : 0,
  IsSynced: true,
  CreatedAt: receipt.ngayNhap,
});

const mapApiDetails = (receipt: ApiImportReceipt): ImportDetail[] =>
  (receipt.chiTiet || []).map((detail) => ({
    MaPN: receipt.maPN,
    MaLo: detail.maLo,
    MaNL: detail.maNL,
    TenNL: detail.tenNL,
    SoLuong: detail.soLuong || 0,
    DonGiaNhap: detail.donGiaNhap || 0,
    ThanhTien: detail.thanhTien || 0,
    HanSuDung: detail.hanSuDung || "",
  }));

const mapApiBatches = (receipts: ApiImportReceipt[]): Batch[] =>
  receipts.flatMap((receipt) =>
    (receipt.chiTiet || []).map((detail) => ({
      MaLo: detail.maLo,
      MaNL: detail.maNL,
      MaCN: receipt.maCN,
      NgayNhap: receipt.ngayNhap,
      HSD: detail.hanSuDung || "",
      SoLuongCon: detail.soLuong || 0,
      IsSynced: true,
      CreatedAt: receipt.ngayNhap,
    })),
  );

const isActiveStatus = (value: string | number | undefined) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "number") return value === 1;

  const normalized = value.trim().toLowerCase();

  return ["1", "active", "hoat_dong", "hoạt động", "đang hoạt động"].includes(
    normalized,
  );
};

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

const mapApiSupplier = (supplier: ApiSupplier): Supplier => ({
  MaNCC: supplier.maNCC,
  TenNCC: supplier.tenNCC,
  Sdt: supplier.sdt,
  DiaChi: supplier.diaChi,
  TrangThai: isActiveStatus(supplier.trangThai) ? 1 : 0,
  CreatedAt: supplier.createdAt,
  UpdatedAt: supplier.updatedAt,
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

const buildReceiptQueryParams = (maCN: string, maNCC: string) => {
  const params: Record<string, string> = {};
  if (maCN !== "all") params.maCN = maCN;
  if (maNCC !== "all") params.maNCC = maNCC;

  return Object.keys(params).length > 0 ? params : undefined;
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

export default function ImportPage() {
  const [receipts, setReceipts] = useState<ImportReceipt[]>([]);
  const [details, setDetails] = useState<ImportDetail[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingReceiptMaPN, setEditingReceiptMaPN] = useState<string | null>(
    null,
  );

  const [selectedBranch, setSelectedBranch] = useState("");
  const [sourceType, setSourceType] =
    useState<ImportSourceType>("NHA_CUNG_CAP");
  const [selectedSupplier, setSelectedSupplier] = useState("NCC001");
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [importDate, setImportDate] = useState(toInputDateTime(new Date()));
  const [note, setNote] = useState("");

  const [importItems, setImportItems] = useState<ImportFormItem[]>([
    {
      RowId: 1,
      MaNL: "",
      SoLuong: 0,
      DonGiaNhap: 0,
      HanSuDung: "",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const pageSize = 10;

  const upsertSupplier = (supplier: Supplier) => {
    setSuppliers((current) => {
      const exists = current.some((item) => item.MaNCC === supplier.MaNCC);

      if (!exists) return [...current, supplier];

      return current.map((item) =>
        item.MaNCC === supplier.MaNCC ? supplier : item,
      );
    });
  };

  const loadSupplierDetail = async (maNCC: string) => {
    if (!maNCC) return null;

    const response = await api.get<ApiSupplier>(`/api/nhacungcap/${maNCC}`);
    const supplier = mapApiSupplier(response.data);

    upsertSupplier(supplier);

    return supplier;
  };

  const loadData = async (
    filterMaCN = branchFilter,
    filterMaNCC = supplierFilter,
  ) => {
    try {
      setIsLoading(true);
      const user = getCurrentUser();
      const effectiveMaCN =
        user?.chucVu === "NHANVIEN_KHO" && user.maCN
          ? user.maCN
          : filterMaCN;
      const receiptsResponse = await api.get<ApiImportReceipt[]>(
        "/api/nhapkho",
        {
          params: buildReceiptQueryParams(effectiveMaCN, filterMaNCC),
        },
      );
      const [
        branchesResult,
        employeesResult,
        suppliersResult,
        ingredientsResult,
        unitsResult,
      ] = await Promise.allSettled([
        api.get<ApiBranch[]>("/api/chinhanh"),
        api.get<ApiEmployee[]>("/api/nhanvien"),
        api.get<ApiSupplier[]>("/api/nhacungcap"),
        api.get<ApiIngredient[]>("/api/nguyenlieu"),
        api.get<ApiUnit[]>("/api/donvi"),
      ]);
      const apiReceipts = Array.isArray(receiptsResponse.data)
        ? receiptsResponse.data
        : [];

      setReceipts(apiReceipts.map(mapApiReceipt));
      setDetails(apiReceipts.flatMap(mapApiDetails));
      setBatches(mapApiBatches(apiReceipts));
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
      setSuppliers(
        suppliersResult.status === "fulfilled" &&
          Array.isArray(suppliersResult.value.data)
          ? suppliersResult.value.data.map(mapApiSupplier)
          : initialSuppliers,
      );
      setIngredients(
        ingredientsResult.status === "fulfilled" &&
          Array.isArray(ingredientsResult.value.data)
          ? ingredientsResult.value.data.map(mapApiIngredient)
          : initialIngredients,
      );
      setUnits(
        unitsResult.status === "fulfilled" &&
          Array.isArray(unitsResult.value.data)
          ? unitsResult.value.data.map(mapApiUnit)
          : initialUnits,
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không tải được danh sách phiếu nhập từ backend";
      alert(message);
      setReceipts([]);
      setDetails([]);
      setBatches([]);
      setBranches(getFromStorage<Branch>(branchStorageKey, initialBranches));
      setEmployees(
        getFromStorage<Employee>(employeeStorageKey, initialEmployees),
      );
      setSuppliers(
        getFromStorage<Supplier>(supplierStorageKey, initialSuppliers),
      );
      setIngredients(
        getFromStorage<Ingredient>(ingredientStorageKey, initialIngredients),
      );
      setUnits(getFromStorage<Unit>(unitStorageKey, initialUnits));
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
  }, [branchFilter, supplierFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, branchFilter, supplierFilter]);

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
    if (sourceType !== "NHA_CUNG_CAP" || !selectedSupplier) return;

    loadSupplierDetail(selectedSupplier).catch(() => {
      // The list endpoint remains the source for the dropdown if detail lookup fails.
    });
  }, [sourceType, selectedSupplier]);

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

  useEffect(() => {
    if (sourceType !== "KHO_TONG") return;

    const sourceWarehouses = branches.filter(
      (branch) => branch.TrangThai === 1 && branch.MaCN !== selectedBranch,
    );
    const sourceWarehouse = sourceWarehouses.find(
      (branch) => branch.MaCN === selectedSourceWarehouse,
    );

    if (!sourceWarehouse) {
      setSelectedSourceWarehouse(sourceWarehouses[0]?.MaCN || "");
    }
  }, [
    sourceType,
    selectedBranch,
    selectedSourceWarehouse,
    branches,
  ]);

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
  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.TrangThai === 1,
  );
  const activeSourceWarehouses = branches.filter(
    (branch) => branch.TrangThai === 1 && branch.MaCN !== selectedBranch,
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

  const getSupplierName = (MaNCC: string) => {
    return (
      suppliers.find((supplier) => supplier.MaNCC === MaNCC)?.TenNCC || MaNCC
    );
  };

  const getIngredient = (MaNL: string) => {
    return ingredients.find((ingredient) => ingredient.MaNL === MaNL);
  };

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const totalValue = importItems.reduce(
    (sum, item) => sum + item.SoLuong * item.DonGiaNhap,
    0,
  );

  const nextReceiptCode = useMemo(() => {
    return getNextCode(
      "PN",
      receipts.map((receipt) => receipt.MaPN),
    );
  }, [receipts]);

  const resetForm = () => {
    const defaultBranch = currentUser?.maCN || activeBranches[0]?.MaCN || "";

    setEditingReceiptMaPN(null);
    setSelectedBranch(defaultBranch);
    setSourceType("NHA_CUNG_CAP");
    setSelectedSupplier(activeSuppliers[0]?.MaNCC || "NCC001");
    setSelectedSourceWarehouse(
      branches.find(
        (branch) => branch.TrangThai === 1 && branch.MaCN !== defaultBranch,
      )?.MaCN || "",
    );
    setSelectedEmployee(currentUser?.maNV || activeEmployees[0]?.MaNV || "");
    setImportDate(toInputDateTime(new Date()));
    setNote("");
    setImportItems([
      {
        RowId: 1,
        MaNL: "",
        SoLuong: 0,
        DonGiaNhap: 0,
        HanSuDung: "",
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

  const replaceReceiptFromApi = (apiReceipt: ApiImportReceipt) => {
    const mappedReceipt = mapApiReceipt(apiReceipt);
    const mappedDetails = mapApiDetails(apiReceipt);
    const mappedBatches = mapApiBatches([apiReceipt]);

    setReceipts((current) => [
      ...current.filter((item) => item.MaPN !== mappedReceipt.MaPN),
      mappedReceipt,
    ]);
    setDetails((current) => [
      ...current.filter((item) => item.MaPN !== mappedReceipt.MaPN),
      ...mappedDetails,
    ]);
    setBatches((current) => [
      ...current.filter(
        (item) => !mappedBatches.some((batch) => batch.MaLo === item.MaLo),
      ),
      ...mappedBatches,
    ]);
  };

  const handleLoadReceiptDetail = async (maPN: string) => {
    try {
      const response = await api.get<ApiImportReceipt>(`/api/nhapkho/${maPN}`);
      replaceReceiptFromApi(response.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không tải được chi tiết phiếu nhập";
      alert(message);
    }
  };

  const handleOpenEdit = async (maPN: string) => {
    try {
      const response = await api.get<ApiImportReceipt>(`/api/nhapkho/${maPN}`);
      const receipt = response.data;
      const mappedReceipt = mapApiReceipt(receipt);
      const mappedDetails = mapApiDetails(receipt);
      const receiptDate = receipt.ngayNhap
        ? toInputDateTime(new Date(receipt.ngayNhap))
        : toInputDateTime(new Date());
      const nextSourceType =
        mappedReceipt.LoaiNguon === "KHO_TONG" ? "KHO_TONG" : "NHA_CUNG_CAP";

      replaceReceiptFromApi(receipt);
      setEditingReceiptMaPN(mappedReceipt.MaPN);
      setSelectedBranch(mappedReceipt.MaCN);
      setSourceType(nextSourceType);
      setSelectedSupplier(mappedReceipt.MaNCC || activeSuppliers[0]?.MaNCC || "");
      setSelectedSourceWarehouse(
        mappedReceipt.MaKhoNguon ||
          activeBranches.find((branch) => branch.MaCN !== mappedReceipt.MaCN)
            ?.MaCN ||
          "",
      );
      setSelectedEmployee(mappedReceipt.MaNV);
      setImportDate(receiptDate);
      setNote(mappedReceipt.GhiChu || "");
      setImportItems(
        mappedDetails.length > 0
          ? mappedDetails.map((detail, index) => ({
              RowId: index + 1,
              MaNL: detail.MaNL,
              SoLuong: detail.SoLuong,
              DonGiaNhap: detail.DonGiaNhap,
              HanSuDung: detail.HanSuDung,
            }))
          : [
              {
                RowId: 1,
                MaNL: "",
                SoLuong: 0,
                DonGiaNhap: 0,
                HanSuDung: "",
              },
            ],
      );
      setIsDrawerOpen(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không tải được phiếu nhập để sửa";
      alert(message);
    }
  };

  const handleDeleteReceipt = async (maPN: string) => {
    const isConfirmed = confirm(
      `Bạn có chắc muốn xóa phiếu nhập ${maPN} không? Tồn kho sẽ được hoàn tác.`,
    );

    if (!isConfirmed) return;

    try {
      await api.delete(`/api/nhapkho/${maPN}`);
      await loadData();
      alert("Đã xóa phiếu nhập và hoàn tác tồn kho");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không xóa được phiếu nhập";
      alert(message);
    }
  };

  const addItem = () => {
    const nextRowId = Math.max(...importItems.map((item) => item.RowId), 0) + 1;

    setImportItems([
      ...importItems,
      {
        RowId: nextRowId,
        MaNL: "",
        SoLuong: 0,
        DonGiaNhap: 0,
        HanSuDung: "",
      },
    ]);
  };

  const removeItem = (rowId: number) => {
    if (importItems.length <= 1) return;

    setImportItems(importItems.filter((item) => item.RowId !== rowId));
  };

  const updateItem = (
    rowId: number,
    field: keyof ImportFormItem,
    value: string | number,
  ) => {
    setImportItems(
      importItems.map((item) =>
        item.RowId === rowId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleConfirmImport = async () => {
    if (
      !selectedBranch ||
      !selectedEmployee ||
      (sourceType === "NHA_CUNG_CAP" && !selectedSupplier) ||
      (sourceType === "KHO_TONG" && !selectedSourceWarehouse)
    ) {
      alert("Vui lòng chọn đầy đủ nguồn nhập, chi nhánh và nhân viên nhập");
      return;
    }

    if (
      sourceType === "KHO_TONG" &&
      selectedSourceWarehouse === selectedBranch
    ) {
      alert("Kho tổng nguồn và chi nhánh nhập phải khác nhau");
      return;
    }

    if (!importDate) {
      alert("Vui lòng chọn ngày nhập");
      return;
    }

    const hasInvalidItem = importItems.some(
      (item) =>
        !item.MaNL ||
        item.SoLuong <= 0 ||
        (sourceType === "NHA_CUNG_CAP"
          ? item.DonGiaNhap <= 0
          : item.DonGiaNhap < 0) ||
        !item.HanSuDung,
    );

    if (hasInvalidItem) {
      alert(
        sourceType === "NHA_CUNG_CAP"
          ? "Vui lòng nhập đầy đủ nguyên liệu, số lượng, đơn giá lớn hơn 0 và hạn sử dụng"
          : "Vui lòng nhập đầy đủ nguyên liệu, số lượng, đơn giá không âm và hạn sử dụng",
      );
      return;
    }

    const duplicatedIngredient = importItems.some((item, index) =>
      importItems.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && otherItem.MaNL === item.MaNL,
      ),
    );

    if (duplicatedIngredient) {
      alert(
        "Một nguyên liệu không nên xuất hiện nhiều lần trong cùng phiếu nhập",
      );
      return;
    }

    const receiptCode =
      editingReceiptMaPN ||
      getNextCode(
        "PN",
        receipts.map((receipt) => receipt.MaPN),
      );

    const firstBatchNumber = batches.reduce((max, batch) => {
      if (!batch.MaLo.startsWith("LO")) return max;

      const number = Number(batch.MaLo.replace("LO", ""));

      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    const payload = {
      maPN: receiptCode,
      loaiNguon: sourceType,
      maNCC: sourceType === "NHA_CUNG_CAP" ? selectedSupplier : undefined,
      maKhoNguon:
        sourceType === "KHO_TONG" ? selectedSourceWarehouse : undefined,
      maCN: selectedBranch,
      maNV: selectedEmployee,
      ngayNhap: importDate,
      ghiChu: note.trim(),
      chiTiet: importItems.map((item, index) => ({
        maLo: `LO${String(firstBatchNumber + index + 1).padStart(3, "0")}`,
        maNL: item.MaNL,
        soLuong: item.SoLuong,
        donGiaNhap: item.DonGiaNhap,
        hanSuDung: item.HanSuDung,
      })),
    };

    try {
      setIsSubmitting(true);
      if (sourceType === "NHA_CUNG_CAP") {
        const supplier = await loadSupplierDetail(selectedSupplier);

        if (!supplier || supplier.TrangThai !== 1) {
          alert("Nhà cung cấp không tồn tại hoặc đã ngừng hoạt động");
          return;
        }
      }

      if (editingReceiptMaPN) {
        await api.put<ApiImportReceipt>(
          `/api/nhapkho/${editingReceiptMaPN}`,
          payload,
        );
      } else {
        await api.post<ApiImportReceipt>("/api/nhapkho", payload);
      }
      await loadData();
      alert("Tạo phiếu nhập thành công và backend đã cập nhật tồn kho");
      handleCloseDrawer();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Không tạo được phiếu nhập kho";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const importRows = useMemo(() => {
    return details.map((detail) => {
      const receipt = receipts.find((item) => item.MaPN === detail.MaPN);
      const batch = batches.find((item) => item.MaLo === detail.MaLo);
      const ingredient = getIngredient(detail.MaNL || batch?.MaNL || "");

      return {
        MaPN: detail.MaPN,
        NgayNhap: receipt?.NgayNhap || "",
        MaLo: detail.MaLo,
        MaNL: detail.MaNL || batch?.MaNL || "",
        TenNL:
          detail.TenNL || ingredient?.TenNL || detail.MaNL || batch?.MaNL || "",
        DonVi: ingredient ? getUnitName(ingredient.DonViCoBan) : "-",
        SoLuong: detail.SoLuong,
        DonGiaNhap: detail.DonGiaNhap,
        ThanhTien: detail.ThanhTien,
        HanSuDung: detail.HanSuDung || batch?.HSD || "",
        MaCN: receipt?.MaCN || batch?.MaCN || "",
        TenCN: receipt?.TenCN || (receipt ? getBranchName(receipt.MaCN) : ""),
        MaNCC: receipt?.MaNCC || "",
        TenNCC: receipt?.TenNCC || (receipt ? getSupplierName(receipt.MaNCC) : ""),
        MaNV: receipt?.MaNV || "",
        TenNV: receipt?.TenNV || (receipt ? getEmployeeName(receipt.MaNV) : ""),
      };
    });
  }, [
    details,
    receipts,
    batches,
    ingredients,
    units,
    branches,
    suppliers,
    employees,
  ]);

  const filteredData = useMemo(() => {
    return importRows.filter((item) => {
      const matchesSearch =
        item.MaPN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaLo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenNCC.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" || item.MaCN === branchFilter;
      const matchesSupplier =
        supplierFilter === "all" || item.MaNCC === supplierFilter;

      return matchesSearch && matchesBranch && matchesSupplier;
    });
  }, [importRows, searchQuery, branchFilter, supplierFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleExportExcel = () => {
    const headers = [
      "Mã phiếu",
      "Ngày nhập",
      "Mã lô",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Số lượng",
      "Đơn vị",
      "Đơn giá nhập",
      "Thành tiền",
      "Hạn sử dụng",
      "Chi nhánh",
      "Nhà cung cấp",
      "Nhân viên",
    ];

    const rows = filteredData.map((item) => [
      item.MaPN,
      item.NgayNhap,
      item.MaLo,
      item.MaNL,
      item.TenNL,
      item.SoLuong,
      item.DonVi,
      item.DonGiaNhap,
      item.ThanhTien,
      item.HanSuDung,
      item.TenCN,
      item.TenNCC,
      item.TenNV,
    ]);

    downloadCsv("phieu-nhap-kho.csv", headers, rows);
  };

  return (
    <MainLayout
      title="Nhập kho"
      breadcrumb="Trang chủ / Kho nguyên liệu / Nhập kho"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <PackagePlus className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng phiếu nhập</p>
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
            <p className="text-sm text-muted-foreground">Tổng giá trị nhập</p>
            <p className="mt-1 text-xl font-bold text-primary">
              {formatCurrency(
                receipts.reduce((sum, receipt) => sum + receipt.TongTien, 0),
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
            value={supplierFilter}
            onValueChange={(value) => {
              setSupplierFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Nhà cung cấp" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
              {activeSuppliers.map((supplier) => (
                <SelectItem key={supplier.MaNCC} value={supplier.MaNCC}>
                  {supplier.TenNCC}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm mã phiếu, mã lô, nguyên liệu, nhà cung cấp..."
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
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
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
            Tạo phiếu nhập
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {[
                    "Mã phiếu",
                    "Ngày nhập",
                    "Mã lô",
                    "Nguyên liệu",
                    "Số lượng",
                    "Đơn vị",
                    "Đơn giá",
                    "Thành tiền",
                    "HSD",
                    "Chi nhánh",
                    "Nhà cung cấp",
                    "Nhân viên",
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
                {paginatedData.map((item, index) => (
                  <tr
                    key={`${item.MaPN}-${item.MaLo}-${index}`}
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold">
                      <button
                        type="button"
                        onClick={() => handleLoadReceiptDetail(item.MaPN)}
                        className="text-primary hover:underline"
                      >
                        {item.MaPN}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(item.NgayNhap)}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.MaLo}
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

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatCurrency(item.DonGiaNhap)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(item.ThanhTien)}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.HanSuDung}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.TenCN}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.TenNCC}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.TenNV}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item.MaPN)}
                          className="text-muted-foreground hover:text-primary"
                          title="Sửa phiếu nhập"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteReceipt(item.MaPN)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Xóa phiếu nhập"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={13}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có phiếu nhập phù hợp
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
              {filteredData.length} dòng nhập kho
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
                {editingReceiptMaPN ? "Sửa phiếu nhập kho" : "Tạo phiếu nhập kho"}
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
                    value={editingReceiptMaPN || nextReceiptCode}
                    disabled
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Ngày nhập *</Label>

                  <Input
                    type="datetime-local"
                    value={importDate}
                    onChange={(event) => setImportDate(event.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Chi nhánh nhập *</Label>

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
                  <Label>Nhân viên nhập *</Label>

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

                <div>
                  <Label>Nguồn nhập *</Label>

                  <Select
                    value={sourceType}
                    onValueChange={(value) =>
                      setSourceType(value as ImportSourceType)
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn nguồn nhập" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="NHA_CUNG_CAP">Nhà cung cấp</SelectItem>
                      <SelectItem value="KHO_TONG">Kho tổng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  {sourceType === "NHA_CUNG_CAP" ? (
                    <>
                      <Label>Nhà cung cấp *</Label>

                      <Select
                        value={selectedSupplier}
                        onValueChange={setSelectedSupplier}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>

                        <SelectContent>
                          {activeSuppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.MaNCC}
                              value={supplier.MaNCC}
                            >
                              {supplier.TenNCC}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <Label>Kho tổng nguồn *</Label>

                      <Select
                        value={selectedSourceWarehouse}
                        onValueChange={setSelectedSourceWarehouse}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Chọn kho tổng" />
                        </SelectTrigger>

                        <SelectContent>
                          {activeSourceWarehouses.map((branch) => (
                            <SelectItem key={branch.MaCN} value={branch.MaCN}>
                              {branch.TenCN}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
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
                    Chi tiết nguyên liệu nhập
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
                          Số lượng
                        </th>

                        <th className="w-40 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Đơn giá nhập
                        </th>

                        <th className="w-40 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Hạn sử dụng
                        </th>

                        <th className="w-40 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Thành tiền
                        </th>

                        <th className="w-14 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {importItems.map((item, index) => {
                        const ingredient = getIngredient(item.MaNL);

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

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                value={item.DonGiaNhap || ""}
                                onChange={(event) =>
                                  updateItem(
                                    item.RowId,
                                    "DonGiaNhap",
                                    Number(event.target.value) || 0,
                                  )
                                }
                                className="text-right"
                              />
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="date"
                                value={item.HanSuDung}
                                onChange={(event) =>
                                  updateItem(
                                    item.RowId,
                                    "HanSuDung",
                                    event.target.value,
                                  )
                                }
                              />
                            </td>

                            <td className="px-3 py-2 text-right text-sm font-semibold text-foreground">
                              {formatCurrency(item.SoLuong * item.DonGiaNhap)}
                            </td>

                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => removeItem(item.RowId)}
                                className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                                disabled={importItems.length === 1}
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

                <div className="flex items-center justify-between border-t border-border p-3">
                  <Button variant="outline" onClick={addItem} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Thêm nguyên liệu
                  </Button>

                  <div className="text-base font-semibold">
                    Tổng nhập:{" "}
                    <span className="text-primary">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border p-4">
              <Button variant="outline" onClick={handleCloseDrawer}>
                Hủy
              </Button>

              <Button onClick={handleConfirmImport} disabled={isSubmitting}>
                {isSubmitting
                  ? "Đang lưu..."
                  : editingReceiptMaPN
                    ? "Cập nhật phiếu nhập"
                    : "Xác nhận nhập kho"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

