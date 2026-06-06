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
import { getCurrentUser } from "@/lib/auth";

interface Branch { MaCN: string; TenCN: string; DiaChi?: string; TrangThai: number; }
interface Employee { MaNV: string; TenNV: string; MaCN: string | null; TrangThai: number; }
interface Product { MaSP: string; TenSP: string; GiaHienTai: number; IsTopping: boolean; TrangThai: number; }
interface Invoice { MaHD: string; MaCN: string; MaNV?: string; NgayLap: string; TongTien: number; TrangThai: number | string; _SoLuongDon?: number; }
interface InvoiceDetail { MaHD: string; MaSP: string; SoLuong: number; DonGia?: number; ThanhTien?: number; }
interface Ingredient { MaNL: string; TenNL: string; DonViCoBan: string; TonToiThieu: number; TrangThai: number; }
interface Unit { MaDV: string; TenDonVi: string; TrangThai: number; }
interface InventoryStock { MaCN: string; MaNL: string; SoLuongTon: number; UpdatedAt?: string; }
interface SyncLog { MaLog?: string; TrangThai: number | string; }
interface ApiBranch { maCN?: string; MaCN?: string; tenCN?: string; TenCN?: string; diaChi?: string; DiaChi?: string; trangThai?: number; TrangThai?: number; }
interface ApiRevenueRow { maCN?: string; MaCN?: string; tenCN?: string; TenCN?: string; tongDoanhThu?: number | string; TongDoanhThu?: number | string; soLuongDon?: number | string; SoLuongDon?: number | string; }
interface ApiProductSalesRow { maSP?: string; MaSP?: string; tenSP?: string; TenSP?: string; tongSoLuongBan?: number | string; TongSoLuongBan?: number | string; tongDoanhThu?: number | string; TongDoanhThu?: number | string; }
interface ApiInventoryAlertRow { maCN?: string; MaCN?: string; maNL?: string; MaNL?: string; tenNL?: string; TenNL?: string; soLuongTon?: number | string; SoLuongTon?: number | string; tonToiThieu?: number | string; TonToiThieu?: number | string; mucDo?: string; MucDo?: string; loaiCanhBao?: string; LoaiCanhBao?: string; }
interface ApiRecentOrderRow { maHD?: string; MaHD?: string; maCN?: string; MaCN?: string; tenCN?: string; TenCN?: string; maNV?: string; MaNV?: string; tenNV?: string; TenNV?: string; tongTien?: number | string; TongTien?: number | string; createdAt?: string; CreatedAt?: string; trangThai?: number | string; TrangThai?: number | string; }
interface InventoryAlert { MaNL: string; TenNL: string; TenCN: string; SoLuongTon: number; TonToiThieu: number; DonVi: string; Status: "danger" | "warning"; }
interface RecentOrder { MaHD: string; TenCN: string; TenNV: string; TongTien: number; ThoiGian: string; TrangThai: number; }
interface TopProduct { TenSP: string; SoLuong: number; }

// ĐÃ DỌN SẠCH DỮ LIỆU GIẢ!
const initialBranches: Branch[] = [];
const initialEmployees: Employee[] = [];
const initialProducts: Product[] = [];
const initialUnits: Unit[] = [];
const initialIngredients: Ingredient[] = [];
const initialInventoryStocks: InventoryStock[] = [];
const initialInvoices: Invoice[] = [];
const initialInvoiceDetails: InvoiceDetail[] = [];
const initialSyncLogs: SyncLog[] = [];

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

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
const getDateOnly = (value: string) => String(value || "").slice(0, 10);
const getLatestDate = (invoices: Invoice[]) => {
  const completedInvoices = invoices.filter(isCompletedInvoice);
  if (completedInvoices.length === 0) return new Date().toISOString().slice(0, 10);
  return completedInvoices.map((invoice) => getDateOnly(invoice.NgayLap)).sort().at(-1)!;
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
  return invoice.TrangThai === 1 || invoice.TrangThai === "1" || invoice.TrangThai === "PAID" || invoice.TrangThai === "COMPLETED" || invoice.TrangThai === "DA_THANH_TOAN";
};

const normalizeApiBranch = (branch: ApiBranch): Branch | null => {
  const MaCN = branch.MaCN || branch.maCN;
  const TenCN = branch.TenCN || branch.tenCN;
  if (!MaCN || !TenCN) return null;
  return { MaCN, TenCN, DiaChi: branch.DiaChi || branch.diaChi, TrangThai: Number(branch.TrangThai ?? branch.trangThai ?? 1) };
};

const normalizeRevenueRow = (row: ApiRevenueRow, date: string): Invoice | null => {
  const MaCN = row.MaCN || row.maCN;
  const TongTien = Number(row.TongDoanhThu ?? row.tongDoanhThu ?? 0);
  const SoLuongDon = Number(row.SoLuongDon ?? row.soLuongDon ?? 0);
  if (!MaCN || Number.isNaN(TongTien)) return null;
  return { MaHD: `DT-${date}-${MaCN}`, MaCN, MaNV: "API", NgayLap: `${date}T12:00:00`, TongTien, TrangThai: 1, _SoLuongDon: SoLuongDon };
};

const normalizeProductSalesRow = (row: ApiProductSalesRow): (TopProduct & { MaSP: string }) | null => {
  const MaSP = row.MaSP || row.maSP;
  const TenSP = row.TenSP || row.tenSP;
  const SoLuong = Number(row.TongSoLuongBan ?? row.tongSoLuongBan ?? 0);
  if (!MaSP || !TenSP || Number.isNaN(SoLuong)) return null;
  return { MaSP, TenSP, SoLuong };
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
    ThoiGian: new Date(CreatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    TrangThai: TrangThai === 1 || TrangThai === "1" ? 1 : TrangThai === 2 || TrangThai === "2" ? 2 : 0,
  };
};

const getScopedBranchCode = (forceBranchScope: boolean = false) => {
  const user = getCurrentUser() as any;
  if (!user) return null;
  if (forceBranchScope) return user.maCN || user.MaCN || null;
  
  const role = String(user.chucVu || user.role || user.Role || "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "QUAN_TRI" || role === "QUANTRIVIEN";
  
  if (!isAdmin) {
    return user.maCN || user.MaCN || user.branchId || user.branchCode || null;
  }
  return null;
};

export default function DashboardPage({ forceBranchScope = false }: { forceBranchScope?: boolean } = {}) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [apiTopProducts, setApiTopProducts] = useState<TopProduct[]>([]);
  const [apiInventoryAlertRows, setApiInventoryAlertRows] = useState<ApiInventoryAlertRow[]>([]);
  const [apiRecentOrders, setApiRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Xóa sạch LocalStorage tồn dư của code cũ
  useEffect(() => {
    localStorage.removeItem("HOADON");
    localStorage.removeItem("CTHD");
    localStorage.removeItem("SANPHAM");
    localStorage.removeItem("SYNCLOG");

    loadData();
    fetchRevenueFromApi();
    fetchDashboardExtrasFromApi();
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  const loadData = () => {
    const scopedBranchCode = getScopedBranchCode(forceBranchScope);
    const storedBranches = getFromStorage<Branch>("CHINHANH", []);
    const storedEmployees = getFromStorage<Employee>("NHANVIEN", []);
    const storedIngredients = getFromStorage<Ingredient>("NGUYENLIEU", []);
    const storedUnits = getFromStorage<Unit>("DONVI", []);

    setBranches(scopedBranchCode ? storedBranches.filter(b => b.MaCN === scopedBranchCode) : storedBranches);
    setEmployees(storedEmployees);
    setIngredients(storedIngredients);
    setUnits(storedUnits);
  };

  const fetchRevenueFromApi = async () => {
    const scopedBranchCode = getScopedBranchCode(forceBranchScope);
    const dateKeys = getLastSevenDateKeys();
    const firstDate = dateKeys[0];
    const lastDate = dateKeys.at(-1)!;

    const [branchesResult, ...revenueResults] = await Promise.allSettled([
      api.get<ApiBranch[]>("/api/chinhanh"),
      ...dateKeys.map((date) =>
        api.get<ApiRevenueRow[]>("/api/baocao/doanhthu-chinhanh", {
          params: {
            ...(scopedBranchCode ? { maCN: scopedBranchCode } : {}),
            tuNgay: `${date}T00:00:00`,
            denNgay: `${date}T23:59:59`,
          },
        }),
      ),
    ]);

    let reportBranches = branches.length > 0 ? branches : [];

    if (branchesResult.status === "fulfilled" && Array.isArray(branchesResult.value.data)) {
      const apiBranches = branchesResult.value.data.map(normalizeApiBranch).filter((item): item is Branch => item !== null);
      if (apiBranches.length > 0) {
        reportBranches = scopedBranchCode ? apiBranches.filter((branch) => branch.MaCN === scopedBranchCode) : apiBranches;
      }
    }

    const successfulRevenueResults = revenueResults.filter((result) => result.status === "fulfilled");
    if (successfulRevenueResults.length === 0) return;

    const revenueInvoices = revenueResults.flatMap((result, index) => {
      if (result.status !== "fulfilled" || !Array.isArray(result.value.data)) return [];
      return result.value.data
        .map((row) => normalizeRevenueRow(row, dateKeys[index]))
        .filter((item): item is Invoice => item !== null);
    });

    setInvoices(scopedBranchCode ? revenueInvoices.filter((invoice) => invoice.MaCN === scopedBranchCode) : revenueInvoices);

    const branchRevenueMap = new Map<string, number>();
    revenueInvoices.forEach(inv => {
       branchRevenueMap.set(inv.MaCN, (branchRevenueMap.get(inv.MaCN) || 0) + inv.TongTien);
    });
    reportBranches.sort((a, b) => {
       return (branchRevenueMap.get(b.MaCN) || 0) - (branchRevenueMap.get(a.MaCN) || 0);
    });
    setBranches(reportBranches);

    const activeReportBranches = reportBranches.filter((branch) => branch.TrangThai === 1);
    
    if (activeReportBranches.length > 0) {
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
          if (result.status !== "fulfilled" || !Array.isArray(result.value.data)) return;
          result.value.data.forEach((row) => {
            const product = normalizeProductSalesRow(row);
            if (!product) return;
            const current = productMap.get(product.MaSP);
            productMap.set(product.MaSP, { MaSP: product.MaSP, TenSP: product.TenSP, SoLuong: (current?.SoLuong || 0) + product.SoLuong });
          });
        });

        setApiTopProducts(Array.from(productMap.values()).sort((a, b) => b.SoLuong - a.SoLuong).slice(0, 5));
    } else {
        setApiTopProducts([]);
    }
  };

  const fetchDashboardExtrasFromApi = async () => {
    const scopedBranchCode = getScopedBranchCode(forceBranchScope);
    const [alertResult, recentOrderResult, syncLogResult] = await Promise.allSettled([
      api.get("/api/baocao/canh-bao-ton-kho", { params: scopedBranchCode ? { maCN: scopedBranchCode } : {} }),
      api.get("/api/hoadon/recent", { params: { ...(scopedBranchCode ? { maCN: scopedBranchCode } : {}), limit: 5 } }),
      api.get("/api/baocao/giao-dich-dong-bo-loi", { params: scopedBranchCode ? { maCN: scopedBranchCode } : {} })
    ]);

    if (alertResult.status === "fulfilled") {
      setApiInventoryAlertRows(unwrapApiData<ApiInventoryAlertRow>(alertResult.value.data).filter((row) => !scopedBranchCode || (row.MaCN || row.maCN) === scopedBranchCode).slice(0, 5));
    } else {
      setApiInventoryAlertRows([]);
    }

    if (recentOrderResult.status === "fulfilled") {
      const orders = unwrapApiData<ApiRecentOrderRow>(recentOrderResult.value.data).map(normalizeRecentOrderRow).filter((item): item is RecentOrder => item !== null);
      setApiRecentOrders(orders);
    } else {
      setApiRecentOrders([]);
    }

    if (syncLogResult.status === "fulfilled") {
       const syncData = unwrapApiData<any>(syncLogResult.value.data);
       const syncCount = syncData.filter((item: any) => {
          const t = item.trangThai || item.TrangThai;
          return t === 0 || t === "0" || t === "PENDING" || t === "ERROR";
       }).length;
       setPendingSyncCount(syncCount);
    } else {
       setPendingSyncCount(0);
    }
  };

  const latestDate = useMemo(() => getLatestDate(invoices), [invoices]);
  const previousDate = useMemo(() => addDays(latestDate, -1), [latestDate]);

  const todayInvoices = useMemo(() => invoices.filter((invoice) => getDateOnly(invoice.NgayLap) === latestDate && isCompletedInvoice(invoice)), [invoices, latestDate]);
  const yesterdayInvoices = useMemo(() => invoices.filter((invoice) => getDateOnly(invoice.NgayLap) === previousDate && isCompletedInvoice(invoice)), [invoices, previousDate]);

  const todayRevenue = todayInvoices.reduce((sum, invoice) => sum + invoice.TongTien, 0);
  const yesterdayRevenue = yesterdayInvoices.reduce((sum, invoice) => sum + invoice.TongTien, 0);
  const revenueTrend = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0;

  const totalOrdersToday = todayInvoices.reduce((sum, invoice) => sum + (invoice._SoLuongDon || 1), 0);
  const totalOrdersYesterday = yesterdayInvoices.reduce((sum, invoice) => sum + (invoice._SoLuongDon || 1), 0);
  const orderTrend = totalOrdersYesterday > 0 ? Math.round(((totalOrdersToday - totalOrdersYesterday) / totalOrdersYesterday) * 100) : 0;

  const getBranchName = (MaCN: string) => branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  const getUnitName = (MaDV: string) => units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;

  const inventoryAlerts: InventoryAlert[] = useMemo(() => {
    if (!apiInventoryAlertRows) return [];
    return apiInventoryAlertRows.map((row) => {
      const MaCN = row.MaCN || row.maCN || "";
      const MaNL = row.MaNL || row.maNL || "";
      const ingredient = ingredients.find((item) => item.MaNL === MaNL);
      const unitName = ingredient ? getUnitName(ingredient.DonViCoBan) : "";
      const soLuongTon = Number(row.SoLuongTon ?? row.soLuongTon ?? 0);
      const tonToiThieu = Number(row.TonToiThieu ?? row.tonToiThieu ?? 0);
      const mucDo = row.MucDo || row.mucDo;
      const loaiCanhBao = row.LoaiCanhBao || row.loaiCanhBao;
      if (!MaNL || Number.isNaN(soLuongTon) || Number.isNaN(tonToiThieu)) return null;
      return { MaNL, TenNL: row.TenNL || row.tenNL || MaNL, TenCN: getBranchName(MaCN), SoLuongTon: soLuongTon, TonToiThieu: tonToiThieu, DonVi: unitName, Status: mucDo === "NGHIEM_TRONG" || loaiCanhBao === "TON_AM" ? "danger" : "warning" } satisfies InventoryAlert;
    }).filter((item): item is InventoryAlert => item !== null).slice(0, 5);
  }, [apiInventoryAlertRows, ingredients, branches, units]);

  const displayedTopProducts = apiTopProducts || [];
  const recentOrders: RecentOrder[] = apiRecentOrders || [];
  
  // Xác định scopedBranchCode một lần nữa để truyền cho Chart
  const scopedBranchCode = getScopedBranchCode(forceBranchScope);

  return (
    <MainLayout title="Dashboard" breadcrumb="Trang chủ / Tổng quan">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Doanh thu gần nhất" value={formatCurrency(todayRevenue)} trend={{ value: `${revenueTrend >= 0 ? "+" : ""}${revenueTrend}%`, isPositive: revenueTrend >= 0, label: "so với ngày trước" }} icon={Wallet} borderColor="accent" />
          <KPICard title="Tổng đơn hàng" value={`${totalOrdersToday} đơn`} trend={{ value: `${orderTrend >= 0 ? "+" : ""}${orderTrend}%`, isPositive: orderTrend >= 0, label: "so với ngày trước" }} icon={ShoppingCart} borderColor="primary" />
          <KPICard title="Cảnh báo tồn kho" value={`${inventoryAlerts.length} nguyên liệu`} icon={AlertTriangle} borderColor="warning" badge={{ text: inventoryAlerts.length > 0 ? "Cần xử lý" : "Ổn định", variant: inventoryAlerts.length > 0 ? "danger" : "info" }} />
          <KPICard title="Chờ đồng bộ" value={`${pendingSyncCount} giao dịch`} icon={RefreshCw} borderColor="info" badge={{ text: pendingSyncCount > 0 ? "Đang chờ" : "Đã ổn", variant: pendingSyncCount > 0 ? "warning" : "info" }} />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart invoices={invoices} branches={branches} hideFilter={Boolean(scopedBranchCode)} />
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