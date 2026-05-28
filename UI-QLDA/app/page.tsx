"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { InventoryAlertsTable } from "@/components/dashboard/inventory-alerts-table";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { Wallet, ShoppingCart, AlertTriangle, RefreshCw } from "lucide-react";
import api from "@/services/api";

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

interface Employee {
  MaNV: string;
  TenNV: string;
  MaCN: string | null;
  TrangThai: number;
}

interface Product {
  MaSP: string;
  TenSP: string;
  GiaHienTai: number;
  IsTopping: boolean;
  TrangThai: number;
}

interface Invoice {
  MaHD: string;
  MaCN: string;
  MaNV?: string;
  NgayLap: string;
  TongTien: number;
  TrangThai: number | string;
}

interface InvoiceDetail {
  MaHD: string;
  MaSP: string;
  SoLuong: number;
  DonGia?: number;
  ThanhTien?: number;
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

interface InventoryStock {
  MaCN: string;
  MaNL: string;
  SoLuongTon: number;
  UpdatedAt?: string;
}

interface SyncLog {
  MaLog?: string;
  TrangThai: number | string;
}

interface ApiBranch {
  maCN?: string;
  MaCN?: string;
  tenCN?: string;
  TenCN?: string;
  diaChi?: string;
  DiaChi?: string;
  trangThai?: number;
  TrangThai?: number;
}

interface ApiRevenueRow {
  maCN?: string;
  MaCN?: string;
  tenCN?: string;
  TenCN?: string;
  tongDoanhThu?: number | string;
  TongDoanhThu?: number | string;
  soLuongDon?: number | string;
  SoLuongDon?: number | string;
}

interface ApiProductSalesRow {
  maSP?: string;
  MaSP?: string;
  tenSP?: string;
  TenSP?: string;
  tongSoLuongBan?: number | string;
  TongSoLuongBan?: number | string;
  tongDoanhThu?: number | string;
  TongDoanhThu?: number | string;
}

interface ApiInventoryAlertRow {
  maCN?: string;
  MaCN?: string;
  maNL?: string;
  MaNL?: string;
  tenNL?: string;
  TenNL?: string;
  soLuongTon?: number | string;
  SoLuongTon?: number | string;
  tonToiThieu?: number | string;
  TonToiThieu?: number | string;
  mucDo?: string;
  MucDo?: string;
  loaiCanhBao?: string;
  LoaiCanhBao?: string;
}

interface ApiRecentOrderRow {
  maHD?: string;
  MaHD?: string;
  maCN?: string;
  MaCN?: string;
  tenCN?: string;
  TenCN?: string;
  maNV?: string;
  MaNV?: string;
  tenNV?: string;
  TenNV?: string;
  tongTien?: number | string;
  TongTien?: number | string;
  createdAt?: string;
  CreatedAt?: string;
  trangThai?: number | string;
  TrangThai?: number | string;
}

interface InventoryAlert {
  MaNL: string;
  TenNL: string;
  TenCN: string;
  SoLuongTon: number;
  TonToiThieu: number;
  DonVi: string;
  Status: "danger" | "warning";
}

interface RecentOrder {
  MaHD: string;
  TenCN: string;
  TenNV: string;
  TongTien: number;
  ThoiGian: string;
  TrangThai: number;
}

interface TopProduct {
  TenSP: string;
  SoLuong: number;
}

const branchStorageKey = "CHINHANH";
const employeeStorageKey = "NHANVIEN";
const productStorageKey = "SANPHAM";
const invoiceStorageKey = "HOADON";
const invoiceDetailStorageKey = "CTHD";
const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";
const inventoryStorageKey = "TONKHO";
const syncLogStorageKey = "SYNCLOG";

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
    TenNV: "Nguyễn Văn An",
    MaCN: null,
    TrangThai: 1,
  },
  {
    MaNV: "NV003",
    TenNV: "Lê Văn Cường",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV005",
    TenNV: "Hoàng Văn Em",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV007",
    TenNV: "Võ Văn Khang",
    MaCN: "CN02",
    TrangThai: 1,
  },
];

const initialProducts: Product[] = [
  {
    MaSP: "SP001",
    TenSP: "Cà phê đen đá",
    GiaHienTai: 25000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP002",
    TenSP: "Cà phê sữa đá",
    GiaHienTai: 30000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP003",
    TenSP: "Bạc xỉu",
    GiaHienTai: 35000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP004",
    TenSP: "Trà đào cam sả",
    GiaHienTai: 45000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP005",
    TenSP: "Trà sữa truyền thống",
    GiaHienTai: 40000,
    IsTopping: false,
    TrangThai: 1,
  },
];

const initialUnits: Unit[] = [
  { MaDV: "GRAM", TenDonVi: "Gram", TrangThai: 1 },
  { MaDV: "KG", TenDonVi: "Kilogram", TrangThai: 1 },
  { MaDV: "ML", TenDonVi: "Mililít", TrangThai: 1 },
  { MaDV: "LIT", TenDonVi: "Lít", TrangThai: 1 },
  { MaDV: "CAI", TenDonVi: "Cái", TrangThai: 1 },
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

const initialInventoryStocks: InventoryStock[] = [
  { MaCN: "CN01", MaNL: "NL001", SoLuongTon: 25000 },
  { MaCN: "CN01", MaNL: "NL002", SoLuongTon: 45000 },
  { MaCN: "CN01", MaNL: "NL003", SoLuongTon: 8000 },
  { MaCN: "CN01", MaNL: "NL004", SoLuongTon: 12000 },
  { MaCN: "CN01", MaNL: "NL008", SoLuongTon: 2500 },
  { MaCN: "CN02", MaNL: "NL001", SoLuongTon: 18000 },
  { MaCN: "CN02", MaNL: "NL002", SoLuongTon: 9000 },
];

const initialInvoices: Invoice[] = [
  {
    MaHD: "HD001",
    MaCN: "CN01",
    MaNV: "NV003",
    NgayLap: "2026-05-18T09:00:00",
    TongTien: 4200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD002",
    MaCN: "CN02",
    MaNV: "NV007",
    NgayLap: "2026-05-18T09:20:00",
    TongTien: 3800000,
    TrangThai: 1,
  },
  {
    MaHD: "HD003",
    MaCN: "CN01",
    MaNV: "NV003",
    NgayLap: "2026-05-19T10:00:00",
    TongTien: 5100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD004",
    MaCN: "CN02",
    MaNV: "NV007",
    NgayLap: "2026-05-19T10:20:00",
    TongTien: 4100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD005",
    MaCN: "CN01",
    MaNV: "NV003",
    NgayLap: "2026-05-20T10:30:00",
    TongTien: 4700000,
    TrangThai: 1,
  },
  {
    MaHD: "HD006",
    MaCN: "CN03",
    MaNV: "NV001",
    NgayLap: "2026-05-20T11:00:00",
    TongTien: 3500000,
    TrangThai: 1,
  },
  {
    MaHD: "HD007",
    MaCN: "CN01",
    MaNV: "NV003",
    NgayLap: "2026-05-21T10:10:00",
    TongTien: 5500000,
    TrangThai: 1,
  },
  {
    MaHD: "HD008",
    MaCN: "CN02",
    MaNV: "NV007",
    NgayLap: "2026-05-21T10:30:00",
    TongTien: 4800000,
    TrangThai: 1,
  },
  {
    MaHD: "HD009",
    MaCN: "CN01",
    MaNV: "NV003",
    NgayLap: "2026-05-22T10:10:00",
    TongTien: 4900000,
    TrangThai: 1,
  },
  {
    MaHD: "HD010",
    MaCN: "CN03",
    MaNV: "NV001",
    NgayLap: "2026-05-22T10:30:00",
    TongTien: 3400000,
    TrangThai: 1,
  },
  {
    MaHD: "HD011",
    MaCN: "CN01",
    MaNV: "NV003",
    NgayLap: "2026-05-23T10:10:00",
    TongTien: 6200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD012",
    MaCN: "CN02",
    MaNV: "NV007",
    NgayLap: "2026-05-23T10:30:00",
    TongTien: 5100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD013",
    MaCN: "CN03",
    MaNV: "NV001",
    NgayLap: "2026-05-23T11:00:00",
    TongTien: 4200000,
    TrangThai: 1,
  },
];

const initialInvoiceDetails: InvoiceDetail[] = [
  {
    MaHD: "HD001",
    MaSP: "SP002",
    SoLuong: 40,
    DonGia: 30000,
    ThanhTien: 1200000,
  },
  {
    MaHD: "HD002",
    MaSP: "SP003",
    SoLuong: 35,
    DonGia: 35000,
    ThanhTien: 1225000,
  },
  {
    MaHD: "HD003",
    MaSP: "SP001",
    SoLuong: 50,
    DonGia: 25000,
    ThanhTien: 1250000,
  },
  {
    MaHD: "HD004",
    MaSP: "SP004",
    SoLuong: 28,
    DonGia: 45000,
    ThanhTien: 1260000,
  },
  {
    MaHD: "HD005",
    MaSP: "SP002",
    SoLuong: 45,
    DonGia: 30000,
    ThanhTien: 1350000,
  },
  {
    MaHD: "HD006",
    MaSP: "SP005",
    SoLuong: 30,
    DonGia: 40000,
    ThanhTien: 1200000,
  },
  {
    MaHD: "HD007",
    MaSP: "SP002",
    SoLuong: 55,
    DonGia: 30000,
    ThanhTien: 1650000,
  },
  {
    MaHD: "HD008",
    MaSP: "SP003",
    SoLuong: 42,
    DonGia: 35000,
    ThanhTien: 1470000,
  },
  {
    MaHD: "HD009",
    MaSP: "SP001",
    SoLuong: 36,
    DonGia: 25000,
    ThanhTien: 900000,
  },
  {
    MaHD: "HD010",
    MaSP: "SP004",
    SoLuong: 32,
    DonGia: 45000,
    ThanhTien: 1440000,
  },
  {
    MaHD: "HD011",
    MaSP: "SP002",
    SoLuong: 60,
    DonGia: 30000,
    ThanhTien: 1800000,
  },
  {
    MaHD: "HD012",
    MaSP: "SP003",
    SoLuong: 48,
    DonGia: 35000,
    ThanhTien: 1680000,
  },
  {
    MaHD: "HD013",
    MaSP: "SP005",
    SoLuong: 38,
    DonGia: 40000,
    ThanhTien: 1520000,
  },
];

const initialSyncLogs: SyncLog[] = [
  { MaLog: "SYNC001", TrangThai: 0 },
  { MaLog: "SYNC002", TrangThai: 0 },
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const getDateOnly = (value: string) => {
  return String(value || "").slice(0, 10);
};

const getLatestDate = (invoices: Invoice[]) => {
  const completedInvoices = invoices.filter(isCompletedInvoice);

  if (completedInvoices.length === 0) {
    return new Date().toISOString().slice(0, 10);
  }

  return completedInvoices
    .map((invoice) => getDateOnly(invoice.NgayLap))
    .sort()
    .at(-1)!;
};

const addDays = (dateString: string, days: number) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getLastSevenDateKeys = () => {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index - 6);

    return toDateKey(date);
  });
};

const isCompletedInvoice = (invoice: Invoice) => {
  return (
    invoice.TrangThai === 1 ||
    invoice.TrangThai === "1" ||
    invoice.TrangThai === "PAID" ||
    invoice.TrangThai === "COMPLETED" ||
    invoice.TrangThai === "DA_THANH_TOAN"
  );
};

const mergeInventoryStocks = (stocks: InventoryStock[]) => {
  const stockMap = new Map<string, InventoryStock>();

  stocks.forEach((stock) => {
    const key = `${stock.MaCN}-${stock.MaNL}`;
    const oldStock = stockMap.get(key);

    if (oldStock) {
      stockMap.set(key, {
        ...oldStock,
        SoLuongTon: oldStock.SoLuongTon + Number(stock.SoLuongTon || 0),
        UpdatedAt: stock.UpdatedAt || oldStock.UpdatedAt,
      });
    } else {
      stockMap.set(key, {
        ...stock,
        SoLuongTon: Number(stock.SoLuongTon || 0),
      });
    }
  });

  return Array.from(stockMap.values());
};

const normalizeInvoice = (invoice: any): Invoice | null => {
  const MaHD = invoice.MaHD || invoice.maHD;
  const MaCN = invoice.MaCN || invoice.maCN;
  const MaNV = invoice.MaNV || invoice.maNV;
  const NgayLap =
    invoice.NgayLap ||
    invoice.ngayLap ||
    invoice.CreatedAt ||
    invoice.createdAt ||
    invoice.NgayTao ||
    invoice.ngayTao;

  const TongTien = Number(
    invoice.TongTien ??
      invoice.tongTien ??
      invoice.ThanhTien ??
      invoice.thanhTien ??
      invoice.Total ??
      invoice.total ??
      0,
  );

  if (!MaHD || !MaCN || !NgayLap || Number.isNaN(TongTien)) {
    return null;
  }

  return {
    MaHD,
    MaCN,
    MaNV,
    NgayLap,
    TongTien,
    TrangThai: invoice.TrangThai ?? invoice.trangThai ?? 1,
  };
};

const normalizeInvoiceDetail = (detail: any): InvoiceDetail | null => {
  const MaHD = detail.MaHD || detail.maHD;
  const MaSP = detail.MaSP || detail.maSP;
  const SoLuong = Number(
    detail.SoLuong ?? detail.soLuong ?? detail.quantity ?? 0,
  );
  const DonGia = Number(detail.DonGia ?? detail.donGia ?? detail.price ?? 0);
  const ThanhTien = Number(
    detail.ThanhTien ?? detail.thanhTien ?? SoLuong * DonGia,
  );

  if (!MaHD || !MaSP || Number.isNaN(SoLuong)) {
    return null;
  }

  return {
    MaHD,
    MaSP,
    SoLuong,
    DonGia,
    ThanhTien,
  };
};

const normalizeApiBranch = (branch: ApiBranch): Branch | null => {
  const MaCN = branch.MaCN || branch.maCN;
  const TenCN = branch.TenCN || branch.tenCN;

  if (!MaCN || !TenCN) return null;

  return {
    MaCN,
    TenCN,
    DiaChi: branch.DiaChi || branch.diaChi,
    TrangThai: Number(branch.TrangThai ?? branch.trangThai ?? 1),
  };
};

const normalizeRevenueRow = (row: ApiRevenueRow, date: string): Invoice | null => {
  const MaCN = row.MaCN || row.maCN;
  const TongTien = Number(row.TongDoanhThu ?? row.tongDoanhThu ?? 0);

  if (!MaCN || Number.isNaN(TongTien)) return null;

  return {
    MaHD: `DT-${date}-${MaCN}`,
    MaCN,
    MaNV: "API",
    NgayLap: `${date}T12:00:00`,
    TongTien,
    TrangThai: 1,
  };
};

const normalizeProductSalesRow = (
  row: ApiProductSalesRow,
): (TopProduct & { MaSP: string }) | null => {
  const MaSP = row.MaSP || row.maSP;
  const TenSP = row.TenSP || row.tenSP;
  const SoLuong = Number(row.TongSoLuongBan ?? row.tongSoLuongBan ?? 0);

  if (!MaSP || !TenSP || Number.isNaN(SoLuong)) return null;

  return {
    MaSP,
    TenSP,
    SoLuong,
  };
};

const unwrapApiData = <T,>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  return [];
};

const normalizeRecentOrderRow = (row: ApiRecentOrderRow): RecentOrder | null => {
  const MaHD = row.MaHD || row.maHD;
  const TenCN = row.TenCN || row.tenCN || row.MaCN || row.maCN || "";
  const TenNV = row.TenNV || row.tenNV || row.MaNV || row.maNV || "-";
  const TongTien = Number(row.TongTien ?? row.tongTien ?? 0);
  const CreatedAt = row.CreatedAt || row.createdAt;
  const TrangThai = row.TrangThai ?? row.trangThai ?? 0;

  if (!MaHD || !CreatedAt || Number.isNaN(TongTien)) return null;

  return {
    MaHD,
    TenCN,
    TenNV,
    TongTien,
    ThoiGian: new Date(CreatedAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    TrangThai:
      TrangThai === 1 || TrangThai === "1"
        ? 1
        : TrangThai === 2 || TrangThai === "2"
          ? 2
          : 0,
  };
};

export default function DashboardPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetail[]>(
    initialInvoiceDetails,
  );
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [inventoryStocks, setInventoryStocks] = useState<InventoryStock[]>(
    initialInventoryStocks,
  );
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(initialSyncLogs);
  const [apiTopProducts, setApiTopProducts] = useState<TopProduct[] | null>(
    null,
  );
  const [apiInventoryAlertRows, setApiInventoryAlertRows] = useState<
    ApiInventoryAlertRow[] | null
  >(null);
  const [apiRecentOrders, setApiRecentOrders] = useState<RecentOrder[] | null>(
    null,
  );

  const loadData = () => {
    const storedBranches = getFromStorage<Branch>(
      branchStorageKey,
      initialBranches,
    );
    const storedEmployees = getFromStorage<Employee>(
      employeeStorageKey,
      initialEmployees,
    );
    const storedProducts = getFromStorage<Product>(
      productStorageKey,
      initialProducts,
    );
    const storedRawInvoices = getFromStorage<any>(invoiceStorageKey, []);
    const storedRawDetails = getFromStorage<any>(invoiceDetailStorageKey, []);
    const storedIngredients = getFromStorage<Ingredient>(
      ingredientStorageKey,
      initialIngredients,
    );
    const storedUnits = getFromStorage<Unit>(unitStorageKey, initialUnits);
    const storedInventory = getFromStorage<InventoryStock>(
      inventoryStorageKey,
      initialInventoryStocks,
    );
    const storedSyncLogs = getFromStorage<SyncLog>(
      syncLogStorageKey,
      initialSyncLogs,
    );

    const normalizedInvoices = storedRawInvoices
      .map(normalizeInvoice)
      .filter((item): item is Invoice => item !== null);

    const normalizedDetails = storedRawDetails
      .map(normalizeInvoiceDetail)
      .filter((item): item is InvoiceDetail => item !== null);

    setBranches(storedBranches);
    setEmployees(storedEmployees);
    setProducts(storedProducts);
    setInvoices(
      normalizedInvoices.length > 0 ? normalizedInvoices : initialInvoices,
    );
    setInvoiceDetails(
      normalizedDetails.length > 0 ? normalizedDetails : initialInvoiceDetails,
    );
    setIngredients(storedIngredients);
    setUnits(storedUnits);
    setInventoryStocks(mergeInventoryStocks(storedInventory));
    setSyncLogs(storedSyncLogs);

    if (!localStorage.getItem(branchStorageKey)) {
      saveToStorage(branchStorageKey, initialBranches);
    }

    if (!localStorage.getItem(employeeStorageKey)) {
      saveToStorage(employeeStorageKey, initialEmployees);
    }

    if (!localStorage.getItem(productStorageKey)) {
      saveToStorage(productStorageKey, initialProducts);
    }

    if (!localStorage.getItem(invoiceStorageKey)) {
      saveToStorage(invoiceStorageKey, initialInvoices);
    }

    if (!localStorage.getItem(invoiceDetailStorageKey)) {
      saveToStorage(invoiceDetailStorageKey, initialInvoiceDetails);
    }

    if (!localStorage.getItem(ingredientStorageKey)) {
      saveToStorage(ingredientStorageKey, initialIngredients);
    }

    if (!localStorage.getItem(unitStorageKey)) {
      saveToStorage(unitStorageKey, initialUnits);
    }

    if (!localStorage.getItem(inventoryStorageKey)) {
      saveToStorage(
        inventoryStorageKey,
        mergeInventoryStocks(initialInventoryStocks),
      );
    }

    if (!localStorage.getItem(syncLogStorageKey)) {
      saveToStorage(syncLogStorageKey, initialSyncLogs);
    }
  };

  const fetchRevenueFromApi = async () => {
    const dateKeys = getLastSevenDateKeys();
    const firstDate = dateKeys[0];
    const lastDate = dateKeys.at(-1)!;

    const [branchesResult, ...revenueResults] = await Promise.allSettled([
      api.get<ApiBranch[]>("/api/chinhanh"),
      ...dateKeys.map((date) =>
        api.get<ApiRevenueRow[]>("/api/baocao/doanhthu-chinhanh", {
          params: {
            tuNgay: `${date}T00:00:00`,
            denNgay: `${date}T23:59:59`,
          },
        }),
      ),
    ]);

    let reportBranches = branches;

    if (
      branchesResult.status === "fulfilled" &&
      Array.isArray(branchesResult.value.data)
    ) {
      const apiBranches = branchesResult.value.data
        .map(normalizeApiBranch)
        .filter((item): item is Branch => item !== null);

      if (apiBranches.length > 0) {
        reportBranches = apiBranches;
        setBranches(apiBranches);
      }
    }

    const successfulRevenueResults = revenueResults.filter(
      (result) => result.status === "fulfilled",
    );

    if (successfulRevenueResults.length === 0) {
      console.error("Không tải được dữ liệu doanh thu từ backend");
      return;
    }

    const revenueInvoices = revenueResults.flatMap((result, index) => {
      if (result.status !== "fulfilled" || !Array.isArray(result.value.data)) {
        return [];
      }

      return result.value.data
        .map((row) => normalizeRevenueRow(row, dateKeys[index]))
        .filter((item): item is Invoice => item !== null);
    });

    setInvoices(revenueInvoices);

    const activeReportBranches = reportBranches.filter(
      (branch) => branch.TrangThai === 1,
    );

    const productResults = await Promise.allSettled(
      activeReportBranches.map((branch) =>
        api.get<ApiProductSalesRow[]>("/api/baocao/doanhthu-sanpham", {
          params: {
            maCN: branch.MaCN,
            tuNgay: `${firstDate}T00:00:00`,
            denNgay: `${lastDate}T23:59:59`,
          },
        }),
      ),
    );

    const productMap = new Map<string, TopProduct & { MaSP: string }>();

    productResults.forEach((result) => {
      if (result.status !== "fulfilled" || !Array.isArray(result.value.data)) {
        return;
      }

      result.value.data.forEach((row) => {
        const product = normalizeProductSalesRow(row);
        if (!product) return;

        const current = productMap.get(product.MaSP);

        productMap.set(product.MaSP, {
          MaSP: product.MaSP,
          TenSP: product.TenSP,
          SoLuong: (current?.SoLuong || 0) + product.SoLuong,
        });
      });
    });

    setApiTopProducts(
      Array.from(productMap.values())
        .sort((a, b) => b.SoLuong - a.SoLuong)
        .slice(0, 5),
    );
  };

  const fetchDashboardExtrasFromApi = async () => {
    const [alertResult, recentOrderResult] = await Promise.allSettled([
      api.get("/api/baocao/canh-bao"),
      api.get("/api/hoadon/recent", {
        params: {
          limit: 5,
        },
      }),
    ]);

    if (alertResult.status === "fulfilled") {
      setApiInventoryAlertRows(
        unwrapApiData<ApiInventoryAlertRow>(alertResult.value.data).slice(0, 5),
      );
    }

    if (recentOrderResult.status === "fulfilled") {
      const orders = unwrapApiData<ApiRecentOrderRow>(
        recentOrderResult.value.data,
      )
        .map(normalizeRecentOrderRow)
        .filter((item): item is RecentOrder => item !== null);

      setApiRecentOrders(orders);
    }
  };

  useEffect(() => {
    loadData();
    fetchRevenueFromApi();
    fetchDashboardExtrasFromApi();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const latestDate = useMemo(() => getLatestDate(invoices), [invoices]);
  const previousDate = useMemo(() => addDays(latestDate, -1), [latestDate]);

  const todayInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        getDateOnly(invoice.NgayLap) === latestDate &&
        isCompletedInvoice(invoice),
    );
  }, [invoices, latestDate]);

  const yesterdayInvoices = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        getDateOnly(invoice.NgayLap) === previousDate &&
        isCompletedInvoice(invoice),
    );
  }, [invoices, previousDate]);

  const todayRevenue = todayInvoices.reduce(
    (sum, invoice) => sum + invoice.TongTien,
    0,
  );

  const yesterdayRevenue = yesterdayInvoices.reduce(
    (sum, invoice) => sum + invoice.TongTien,
    0,
  );

  const revenueTrend =
    yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0;

  const totalOrdersToday = todayInvoices.length;
  const totalOrdersYesterday = yesterdayInvoices.length;

  const orderTrend =
    totalOrdersYesterday > 0
      ? Math.round(
          ((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) *
            100,
        )
      : 0;

  const getBranchName = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const getEmployeeName = (MaNV?: string) => {
    if (!MaNV) return "—";

    return employees.find((employee) => employee.MaNV === MaNV)?.TenNV || MaNV;
  };

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const inventoryAlerts: InventoryAlert[] = useMemo(() => {
    if (apiInventoryAlertRows) {
      return apiInventoryAlertRows
        .map((row) => {
          const MaCN = row.MaCN || row.maCN || "";
          const MaNL = row.MaNL || row.maNL || "";
          const ingredient = ingredients.find((item) => item.MaNL === MaNL);
          const unitName = ingredient ? getUnitName(ingredient.DonViCoBan) : "";
          const soLuongTon = Number(row.SoLuongTon ?? row.soLuongTon ?? 0);
          const tonToiThieu = Number(row.TonToiThieu ?? row.tonToiThieu ?? 0);
          const mucDo = row.MucDo || row.mucDo;
          const loaiCanhBao = row.LoaiCanhBao || row.loaiCanhBao;

          if (!MaNL || Number.isNaN(soLuongTon) || Number.isNaN(tonToiThieu)) {
            return null;
          }

          return {
            MaNL,
            TenNL: row.TenNL || row.tenNL || MaNL,
            TenCN: getBranchName(MaCN),
            SoLuongTon: soLuongTon,
            TonToiThieu: tonToiThieu,
            DonVi: unitName,
            Status:
              mucDo === "NGHIEM_TRONG" || loaiCanhBao === "TON_AM"
                ? "danger"
                : "warning",
          } satisfies InventoryAlert;
        })
        .filter((item): item is InventoryAlert => item !== null)
        .slice(0, 5);
    }

    return inventoryStocks
      .map((stock) => {
        const ingredient = ingredients.find((item) => item.MaNL === stock.MaNL);

        if (!ingredient || ingredient.TrangThai !== 1) return null;

        if (stock.SoLuongTon > ingredient.TonToiThieu * 1.5) return null;

        return {
          MaNL: stock.MaNL,
          TenNL: ingredient.TenNL,
          TenCN: getBranchName(stock.MaCN),
          SoLuongTon: stock.SoLuongTon,
          TonToiThieu: ingredient.TonToiThieu,
          DonVi: getUnitName(ingredient.DonViCoBan),
          Status:
            stock.SoLuongTon <= ingredient.TonToiThieu ? "danger" : "warning",
        } satisfies InventoryAlert;
      })
      .filter((item): item is InventoryAlert => item !== null)
      .slice(0, 5);
  }, [apiInventoryAlertRows, inventoryStocks, ingredients, branches, units]);

  const topProducts: TopProduct[] = useMemo(() => {
    const completedInvoiceIds = new Set(
      invoices.filter(isCompletedInvoice).map((invoice) => invoice.MaHD),
    );

    return products
      .filter((product) => product.TrangThai === 1)
      .map((product) => {
        const quantity = invoiceDetails
          .filter(
            (detail) =>
              detail.MaSP === product.MaSP &&
              completedInvoiceIds.has(detail.MaHD),
          )
          .reduce((sum, detail) => sum + detail.SoLuong, 0);

        return {
          TenSP: product.TenSP,
          SoLuong: quantity,
        };
      })
      .filter((item) => item.SoLuong > 0)
      .sort((a, b) => b.SoLuong - a.SoLuong)
      .slice(0, 5);
  }, [products, invoiceDetails, invoices]);

  const displayedTopProducts = apiTopProducts ?? topProducts;

  const recentOrders: RecentOrder[] = useMemo(() => {
    if (apiRecentOrders) return apiRecentOrders;

    return [...invoices]
      .sort(
        (a, b) => new Date(b.NgayLap).getTime() - new Date(a.NgayLap).getTime(),
      )
      .slice(0, 5)
      .map((invoice) => ({
        MaHD: invoice.MaHD,
        TenCN: getBranchName(invoice.MaCN),
        TenNV: getEmployeeName(invoice.MaNV),
        TongTien: invoice.TongTien,
        ThoiGian: new Date(invoice.NgayLap).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        TrangThai:
          invoice.TrangThai === 1 ||
          invoice.TrangThai === "1" ||
          invoice.TrangThai === "PAID" ||
          invoice.TrangThai === "COMPLETED"
            ? 1
            : invoice.TrangThai === 2 || invoice.TrangThai === "CANCELLED"
              ? 2
              : 0,
      }));
  }, [invoices, branches, employees]);

  const pendingSyncCount = syncLogs.filter((item) => {
    return (
      item.TrangThai === 0 ||
      item.TrangThai === "0" ||
      item.TrangThai === "PENDING" ||
      item.TrangThai === "ERROR"
    );
  }).length;

  return (
    <MainLayout title="Dashboard" breadcrumb="Trang chủ / Tổng quan">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Doanh thu gần nhất"
            value={formatCurrency(todayRevenue)}
            trend={{
              value: `${revenueTrend >= 0 ? "+" : ""}${revenueTrend}%`,
              isPositive: revenueTrend >= 0,
              label: "so với ngày trước",
            }}
            icon={Wallet}
            borderColor="accent"
          />

          <KPICard
            title="Tổng đơn hàng"
            value={`${totalOrdersToday} đơn`}
            trend={{
              value: `${orderTrend >= 0 ? "+" : ""}${orderTrend}%`,
              isPositive: orderTrend >= 0,
              label: "so với ngày trước",
            }}
            icon={ShoppingCart}
            borderColor="primary"
          />

          <KPICard
            title="Cảnh báo tồn kho"
            value={`${inventoryAlerts.length} nguyên liệu`}
            icon={AlertTriangle}
            borderColor="warning"
            badge={{
              text: inventoryAlerts.length > 0 ? "Cần xử lý" : "Ổn định",
              variant: inventoryAlerts.length > 0 ? "danger" : "info",
            }}
          />

          <KPICard
            title="Chờ đồng bộ"
            value={`${pendingSyncCount} giao dịch`}
            icon={RefreshCw}
            borderColor="info"
            badge={{
              text: pendingSyncCount > 0 ? "Đang chờ" : "Đã ổn",
              variant: pendingSyncCount > 0 ? "warning" : "info",
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart invoices={invoices} branches={branches} />
          </div>

          <div className="lg:col-span-2">
            <TopProductsChart data={displayedTopProducts} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InventoryAlertsTable alerts={inventoryAlerts} />
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </MainLayout>
  );
}
