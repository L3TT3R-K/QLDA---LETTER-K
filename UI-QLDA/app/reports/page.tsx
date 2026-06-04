"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  ReceiptText,
  Store,
  Wallet,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { cn } from "@/lib/utils";
import api from "@/services/api"; // Chèn thư viện gọi API

// --- INTERFACES ---
interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

interface ReportBranch {
  MaCN: string;
  TenCN: string;
  ShortName: string;
  ChiTieu: number;
  MauBieuDo: string;
  TrangThai: number;
}

interface BranchReportRow {
  MaCN: string;
  TenCN: string;
  SoDon: number;
  DoanhThu: number;
  TrungBinhDon: number;
  SoKyTruoc: number;
  TyLeDatChiTieu: number;
  MauBieuDo: string;
}

interface ApiReportResponse {
  maCN: string;
  tenCN: string;
  soLuongDon: number;
  tongDoanhThu: number;
}

const branchStorageKey = "CHINHANH";

const chartColors = [
  "#2C6E49", "#E76F51", "#277DA1", "#F4A261",
  "#8B5CF6", "#198754", "#DC3545", "#6C757D",
];

// Dữ liệu giả lập cho các chỉ số không có trong DB
const previousPeriodByBranch: Record<string, number> = {
  CN01: 23000000, CN02: 20000000, CN03: 16000000, CN04: 12000000, CN05: 9000000,
};

const targetByBranch: Record<string, number> = {
  CN01: 130000000, CN02: 110000000, CN03: 95000000, CN04: 85000000, CN05: 75000000,
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `${Number((value / 1_000_000_000).toFixed(1))} tỷ`;
  if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))} tr`;
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDateDisplay = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const getShortBranchName = (name: string) => {
  return name
    .replace("Phụng Lộc Coffee - ", "")
    .replace("Chi nhánh ", "")
    .trim();
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;

  return (
    <div className="min-w-[220px] rounded-lg border border-border bg-background p-3 text-sm shadow-lg">
      <p className="font-semibold text-foreground">{label}</p>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Doanh thu</span>
          <span className="font-semibold text-foreground">{formatCurrency(Number(row.DoanhThu || 0))}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Số đơn</span>
          <span className="font-medium text-foreground">{Number(row.SoDon || 0).toLocaleString("vi-VN")}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">Đạt chỉ tiêu</span>
          <span className="font-medium text-foreground">{Number(row.TyLeDatChiTieu || 0)}%</span>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export default function ReportsPage() {
  const [branches, setBranches] = useState<ReportBranch[]>([]);
  const [apiData, setApiData] = useState<ApiReportResponse[]>([]); // Hứng data từ DB
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");

  const [draftDateFrom, setDraftDateFrom] = useState("2026-05-01");
  const [draftDateTo, setDraftDateTo] = useState("2026-05-31");
  const [draftBranch, setDraftBranch] = useState("all");

  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-31");
  const [branchFilter, setBranchFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadBranches = async () => {
    try {
      const res = await api.get("/api/chinhanh"); 
      const activeBranches = res.data;
      
      const formatted = activeBranches.map((b: any, index: number) => ({
        MaCN: b.maCN,
        TenCN: b.tenCN,
        ShortName: b.tenCN.replace("Phụng Lộc Coffee - ", "").replace("Chi nhánh ", ""),
        ChiTieu: targetByBranch[b.maCN] || 80000000,
        MauBieuDo: chartColors[index % chartColors.length],
        TrangThai: Number(b.trangThai ?? 1),
      }));
      
      setBranches(formatted);
      
      localStorage.setItem(branchStorageKey, JSON.stringify(activeBranches));
      
    } catch (error) {
      console.error("Lỗi khi tải danh sách chi nhánh từ API:", error);
      const storedBranches = JSON.parse(localStorage.getItem(branchStorageKey) || "[]") as Branch[];
      const formatted = storedBranches.map((b, index) => ({
        MaCN: b.MaCN,
        TenCN: b.TenCN,
        ShortName: b.TenCN.replace("Phụng Lộc Coffee - ", "").replace("Chi nhánh ", ""),
        ChiTieu: targetByBranch[b.MaCN] || 80000000,
        MauBieuDo: chartColors[index % chartColors.length],
        TrangThai: Number(b.TrangThai ?? 1),
      }));
      setBranches(formatted);
    }
  };

  // 2. GỌI API BÁO CÁO TỪ SPRING BOOT
  const fetchReportData = async () => {
    setIsLoadingReport(true);
    setReportError("");

    try {
      // Định dạng ngày có giờ để khớp với LocalDateTime của Backend
      const res = await api.get("/api/baocao/doanhthu-chinhanh", {
        params: {
          tuNgay: `${dateFrom}T00:00:00`,
          denNgay: `${dateTo}T23:59:59`
        }
      });
      setApiData(res.data);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
      setApiData([]); // Xóa data nếu lỗi
      setReportError("Không tải được dữ liệu báo cáo. Vui lòng kiểm tra kết nối backend.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    fetchReportData();
    setCurrentPage(1);
  }, [dateFrom, dateTo]); // Tự động gọi API khi Ngày thay đổi

  const activeBranches = useMemo(() => branches.filter((b) => b.TrangThai === 1), [branches]);
  const selectedBranches = useMemo(() => branchFilter === "all" ? activeBranches : branches.filter((b) => b.MaCN === branchFilter), [branches, activeBranches, branchFilter]);

  // 3. MERGE API DATA VỚI BRANCH ĐỂ TẠO RA DỮ LIỆU BẢNG ĐẦY ĐỦ
  const branchReportData: BranchReportRow[] = useMemo(() => {
    return selectedBranches.map((branch) => {
      // Tìm xem chi nhánh này có doanh thu trả về từ API không
      const apiRow = apiData.find(d => d.maCN === branch.MaCN);
      
      const DoanhThu = apiRow ? apiRow.tongDoanhThu : 0;
      const SoDon = apiRow ? apiRow.soLuongDon : 0;
      const TrungBinhDon = SoDon > 0 ? Math.round(DoanhThu / SoDon) : 0;
      
      const previousRevenue = previousPeriodByBranch[branch.MaCN] || 0;
      const SoKyTruoc = previousRevenue > 0 ? Number((((DoanhThu - previousRevenue) / previousRevenue) * 100).toFixed(1)) : 0;
      const TyLeDatChiTieu = branch.ChiTieu > 0 ? Math.min(Math.round((DoanhThu / branch.ChiTieu) * 100), 100) : 0;

      return {
        MaCN: branch.MaCN,
        TenCN: branch.TenCN,
        SoDon,
        DoanhThu,
        TrungBinhDon,
        SoKyTruoc,
        TyLeDatChiTieu,
        MauBieuDo: branch.MauBieuDo
      };
    });
  }, [apiData, selectedBranches]);

  // CÁC CHỈ SỐ TỔNG
  const totalRevenue = branchReportData.reduce((sum, b) => sum + b.DoanhThu, 0);
  const totalOrders = branchReportData.reduce((sum, b) => sum + b.SoDon, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const bestBranch = branchReportData.reduce<BranchReportRow | null>((best, branch) => (!best || branch.DoanhThu > best.DoanhThu ? branch : best), null);

  // DATA DÀNH CHO BIỂU ĐỒ (Dạng cột thể hiện doanh thu theo từng chi nhánh)
  const chartData = branchReportData.map(b => ({
    name: getShortBranchName(b.TenCN),
    DoanhThu: b.DoanhThu,
    SoDon: b.SoDon,
    TyLeDatChiTieu: b.TyLeDatChiTieu,
    MauBieuDo: b.MauBieuDo
  })).sort((a, b) => b.DoanhThu - a.DoanhThu);

  const maxRevenue = Math.max(...chartData.map((item) => item.DoanhThu), 0);

  const totalPages = Math.ceil(branchReportData.length / pageSize);
  const paginatedBranchData = branchReportData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApplyFilter = () => {
    if (draftDateFrom > draftDateTo) {
      alert("Từ ngày phải nhỏ hơn hoặc bằng đến ngày");
      return;
    }
    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setBranchFilter(draftBranch);
  };

  const handleExportExcel = () => { alert("Đang xuất Excel...") };
  const handleExportPDF = () => { alert("Đang xuất PDF...") };

  return (
    <MainLayout title="Báo cáo doanh thu" breadcrumb="Trang chủ / Báo cáo / Doanh thu">
      <div className="space-y-6">
        
        {/* TOOLBAR LỌC */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input type="date" value={draftDateFrom} onChange={(e) => setDraftDateFrom(e.target.value)} className="w-[150px]" />
            <span className="text-muted-foreground">—</span>
            <Input type="date" value={draftDateTo} onChange={(e) => setDraftDateTo(e.target.value)} className="w-[150px]" />
          </div>

          <Select value={draftBranch} onValueChange={setDraftBranch}>
            <SelectTrigger className="w-[240px]"><SelectValue placeholder="Chi nhánh" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {activeBranches.map((branch) => (<SelectItem key={branch.MaCN} value={branch.MaCN}>{branch.TenCN}</SelectItem>))}
            </SelectContent>
          </Select>

          {/* Đã gỡ bỏ ô "Xem theo Ngày/Tuần/Tháng" vì API hiện tại gộp theo cả khoảng thời gian */}

          <Button variant="outline" onClick={handleApplyFilter}>Áp dụng</Button>
          <Button variant="outline" className="gap-2" onClick={fetchReportData} disabled={isLoadingReport}>
            <RefreshCw className={cn("h-4 w-4", isLoadingReport && "animate-spin")} /> Làm mới
          </Button>

          <div className="flex gap-2 xl:ml-auto">
            <Button variant="outline" className="gap-2" onClick={handleExportExcel}><Download className="h-4 w-4" /> Xuất Excel</Button>
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}><FileText className="h-4 w-4" /> Xuất PDF</Button>
          </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Kỳ báo cáo: <span className="font-medium text-foreground">{formatDateDisplay(dateFrom)} - {formatDateDisplay(dateTo)}</span>
            {branchFilter !== "all" && bestBranch ? <span> · {bestBranch.TenCN}</span> : null}
          </div>
          {reportError && <div className="mt-3 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{reportError}</div>}
        </div>

        {/* THỐNG KÊ TỔNG QUAN (CARD) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tổng doanh thu</p>
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tổng số đơn</p>
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalOrders.toLocaleString("vi-VN")} đơn</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Doanh thu TB/đơn</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(avgOrderValue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Chi nhánh cao nhất</p>
              <Store className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 truncate text-2xl font-bold text-primary" title={bestBranch?.TenCN}>{bestBranch ? getShortBranchName(bestBranch.TenCN) : "—"}</p>
          </div>
        </div>

        {/* BIỂU ĐỒ TRỰC QUAN */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Doanh thu các chi nhánh trong kỳ</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Sắp xếp theo doanh thu giảm dần, đơn vị trục dọc được rút gọn theo triệu/tỷ đồng.</p>
            </div>
            <div className="rounded-md bg-muted px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Cao nhất</p>
              <p className="text-sm font-semibold text-foreground">{formatCompact(maxRevenue)} ₫</p>
            </div>
          </div>
          <div className="h-[390px]">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                Không có dữ liệu để vẽ biểu đồ
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="24%" margin={{ top: 28, right: 16, left: 4, bottom: 34 }}>
                  <defs>
                    {chartColors.map((color, index) => (
                      <linearGradient key={color} id={`revenueGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} stroke="#E9ECEF" strokeDasharray="4 6" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6C757D" }}
                    angle={-16}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6C757D" }}
                    tickFormatter={formatCompact}
                    width={64}
                  />
                  <Tooltip cursor={{ fill: "rgba(44, 110, 73, 0.08)" }} content={<ChartTooltip />} />
                  <Bar dataKey="DoanhThu" radius={[8, 8, 0, 0]} maxBarSize={58}>
                    <LabelList dataKey="DoanhThu" position="top" formatter={(value: number) => formatCompact(Number(value))} className="fill-muted-foreground text-[11px]" />
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#revenueGradient-${index % chartColors.length})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BẢNG CHI TIẾT */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã CN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chi nhánh</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Số đơn</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doanh thu</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">TB/đơn</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">So kỳ trước</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đạt chỉ tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedBranchData.map((branch) => (
                  <tr key={branch.MaCN} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{branch.MaCN}</td>
                    <td className="px-4 py-3 text-sm font-medium">{branch.TenCN}</td>
                    <td className="px-4 py-3 text-right text-sm">{branch.SoDon.toLocaleString("vi-VN")}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrency(branch.DoanhThu)}</td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatCurrency(branch.TrungBinhDon)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center gap-1 text-sm font-medium", branch.SoKyTruoc >= 0 ? "text-[#198754]" : "text-[#DC3545]")}>
                        {branch.SoKyTruoc >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {branch.SoKyTruoc >= 0 ? "+" : ""}{branch.SoKyTruoc}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full rounded-full", branch.TyLeDatChiTieu >= 80 ? "bg-[#198754]" : branch.TyLeDatChiTieu >= 60 ? "bg-[#F4A261]" : "bg-[#DC3545]")} style={{ width: `${branch.TyLeDatChiTieu}%` }} />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{branch.TyLeDatChiTieu}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedBranchData.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">Không có dữ liệu báo cáo</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-muted font-semibold">
                  <td className="px-4 py-3 text-sm text-foreground"></td>
                  <td className="px-4 py-3 text-sm text-foreground">Tổng cộng</td>
                  <td className="px-4 py-3 text-right text-sm">{totalOrders.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3 text-right text-sm">{formatCurrency(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">{formatCurrency(avgOrderValue)}</td>
                  <td className="px-4 py-3"></td><td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
