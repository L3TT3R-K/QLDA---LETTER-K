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
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface Invoice {
  MaHD: string;
  MaCN: string;
  NgayLap: string;
  TongTien: number;
  TrangThai: number | string;
  CreatedAt?: string;
  UpdatedAt?: string;
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
}

interface ChartRow {
  label: string;
  [key: string]: string | number;
}

const branchStorageKey = "CHINHANH";
const invoiceStorageKey = "HOADON";

const chartColors = [
  "#2C6E49",
  "#F4A261",
  "#0DCAF0",
  "#6C757D",
  "#8B5CF6",
  "#198754",
  "#DC3545",
  "#856404",
];

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
];

const initialInvoices: Invoice[] = [
  {
    MaHD: "HD001",
    MaCN: "CN01",
    NgayLap: "2026-05-18",
    TongTien: 4200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD002",
    MaCN: "CN02",
    NgayLap: "2026-05-18",
    TongTien: 3800000,
    TrangThai: 1,
  },
  {
    MaHD: "HD003",
    MaCN: "CN03",
    NgayLap: "2026-05-18",
    TongTien: 3200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD004",
    MaCN: "CN01",
    NgayLap: "2026-05-19",
    TongTien: 5100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD005",
    MaCN: "CN02",
    NgayLap: "2026-05-19",
    TongTien: 4100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD006",
    MaCN: "CN03",
    NgayLap: "2026-05-19",
    TongTien: 3500000,
    TrangThai: 1,
  },
  {
    MaHD: "HD007",
    MaCN: "CN01",
    NgayLap: "2026-05-20",
    TongTien: 4700000,
    TrangThai: 1,
  },
  {
    MaHD: "HD008",
    MaCN: "CN02",
    NgayLap: "2026-05-20",
    TongTien: 4200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD009",
    MaCN: "CN04",
    NgayLap: "2026-05-20",
    TongTien: 3100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD010",
    MaCN: "CN01",
    NgayLap: "2026-05-21",
    TongTien: 5500000,
    TrangThai: 1,
  },
  {
    MaHD: "HD011",
    MaCN: "CN02",
    NgayLap: "2026-05-21",
    TongTien: 4800000,
    TrangThai: 1,
  },
  {
    MaHD: "HD012",
    MaCN: "CN04",
    NgayLap: "2026-05-21",
    TongTien: 3800000,
    TrangThai: 1,
  },
  {
    MaHD: "HD013",
    MaCN: "CN01",
    NgayLap: "2026-05-22",
    TongTien: 4900000,
    TrangThai: 1,
  },
  {
    MaHD: "HD014",
    MaCN: "CN03",
    NgayLap: "2026-05-22",
    TongTien: 3400000,
    TrangThai: 1,
  },
  {
    MaHD: "HD015",
    MaCN: "CN05",
    NgayLap: "2026-05-22",
    TongTien: 2900000,
    TrangThai: 1,
  },
  {
    MaHD: "HD016",
    MaCN: "CN01",
    NgayLap: "2026-05-23",
    TongTien: 6200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD017",
    MaCN: "CN02",
    NgayLap: "2026-05-23",
    TongTien: 5100000,
    TrangThai: 1,
  },
  {
    MaHD: "HD018",
    MaCN: "CN03",
    NgayLap: "2026-05-23",
    TongTien: 4200000,
    TrangThai: 1,
  },
  {
    MaHD: "HD019",
    MaCN: "CN05",
    NgayLap: "2026-05-23",
    TongTien: 3300000,
    TrangThai: 1,
  },
];

const previousPeriodByBranch: Record<string, number> = {
  CN01: 23000000,
  CN02: 20000000,
  CN03: 16000000,
  CN04: 12000000,
  CN05: 9000000,
};

const targetByBranch: Record<string, number> = {
  CN01: 130000000,
  CN02: 110000000,
  CN03: 95000000,
  CN04: 85000000,
  CN05: 75000000,
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

const normalizeBranch = (branch: Partial<Branch>): Branch | null => {
  if (!branch.MaCN || !branch.TenCN) return null;

  return {
    MaCN: branch.MaCN,
    TenCN: branch.TenCN,
    DiaChi: branch.DiaChi,
    TrangThai: Number(branch.TrangThai ?? 1),
    CreatedAt: branch.CreatedAt,
    UpdatedAt: branch.UpdatedAt,
  };
};

const normalizeInvoice = (
  invoice: Partial<Invoice> & Record<string, any>,
): Invoice | null => {
  const MaHD = invoice.MaHD || invoice.maHD;
  const MaCN = invoice.MaCN || invoice.maCN;
  const NgayLap =
    invoice.NgayLap ||
    invoice.ngayLap ||
    invoice.CreatedAt ||
    invoice.createdAt ||
    invoice.NgayTao ||
    invoice.ngayTao;

  const rawTotal =
    invoice.TongTien ??
    invoice.tongTien ??
    invoice.ThanhTien ??
    invoice.thanhTien ??
    invoice.Total ??
    invoice.total ??
    0;

  if (!MaHD || !MaCN || !NgayLap) return null;

  const TongTien = Number(rawTotal);

  if (Number.isNaN(TongTien)) return null;

  return {
    MaHD,
    MaCN,
    NgayLap: String(NgayLap).slice(0, 10),
    TongTien,
    TrangThai: invoice.TrangThai ?? invoice.trangThai ?? 1,
    CreatedAt: invoice.CreatedAt || invoice.createdAt,
    UpdatedAt: invoice.UpdatedAt || invoice.updatedAt,
  };
};

const convertToReportBranch = (branch: Branch, index: number): ReportBranch => {
  return {
    MaCN: branch.MaCN,
    TenCN: branch.TenCN,
    ShortName: branch.TenCN.replace("Phụng Lộc Coffee - ", "").replace(
      "Chi nhánh ",
      "",
    ),
    ChiTieu: targetByBranch[branch.MaCN] || 80000000,
    MauBieuDo: chartColors[index % chartColors.length],
    TrangThai: branch.TrangThai,
  };
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${Math.round(value / 1_000_000_000)} tỷ`;
  }

  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)} tr`;
  }

  return new Intl.NumberFormat("vi-VN").format(value);
};

const getDateLabel = (date: string) => {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
};

const getWeekLabel = (dateString: string) => {
  const date = new Date(dateString);
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const dayDiff = Math.floor(
    (date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000),
  );
  const week = Math.ceil((dayDiff + firstDay.getDay() + 1) / 7);

  return `Tuần ${week}`;
};

const getMonthLabel = (dateString: string) => {
  const [, month] = dateString.split("-");
  return `Tháng ${Number(month)}`;
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

export default function ReportsPage() {
  const [branches, setBranches] = useState<ReportBranch[]>(
    initialBranches.map(convertToReportBranch),
  );

  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const [draftDateFrom, setDraftDateFrom] = useState("2026-05-18");
  const [draftDateTo, setDraftDateTo] = useState("2026-05-23");
  const [draftBranch, setDraftBranch] = useState("all");
  const [draftViewBy, setDraftViewBy] = useState("day");

  const [dateFrom, setDateFrom] = useState("2026-05-18");
  const [dateTo, setDateTo] = useState("2026-05-23");
  const [branchFilter, setBranchFilter] = useState("all");
  const [viewBy, setViewBy] = useState("day");

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
      setBranches(normalizedBranches.map(convertToReportBranch));
    } else {
      setBranches(initialBranches.map(convertToReportBranch));
      saveToStorage(branchStorageKey, initialBranches);
    }

    const storedInvoices = getFromStorage<
      Partial<Invoice> & Record<string, any>
    >(invoiceStorageKey, []);

    const normalizedInvoices = storedInvoices
      .map(normalizeInvoice)
      .filter((item): item is Invoice => item !== null);

    if (normalizedInvoices.length > 0) {
      setInvoices(normalizedInvoices);
    } else {
      setInvoices(initialInvoices);
      saveToStorage(invoiceStorageKey, initialInvoices);
    }

    setCurrentPage(1);
  };

  useEffect(() => {
    loadData();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const getBranch = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN);
  };

  const getGroupLabel = (dateString: string) => {
    if (viewBy === "week") return getWeekLabel(dateString);
    if (viewBy === "month") return getMonthLabel(dateString);
    return getDateLabel(dateString);
  };

  const activeBranches = useMemo(() => {
    return branches.filter((branch) => branch.TrangThai === 1);
  }, [branches]);

  const selectedBranches = useMemo(() => {
    if (branchFilter === "all") {
      return activeBranches;
    }

    return branches.filter((branch) => branch.MaCN === branchFilter);
  }, [branches, activeBranches, branchFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const isCompleted =
        invoice.TrangThai === 1 ||
        invoice.TrangThai === "1" ||
        invoice.TrangThai === "PAID" ||
        invoice.TrangThai === "COMPLETED" ||
        invoice.TrangThai === "DA_THANH_TOAN";

      const matchesDate =
        invoice.NgayLap >= dateFrom && invoice.NgayLap <= dateTo;

      const matchesBranch =
        branchFilter === "all" || invoice.MaCN === branchFilter;

      const branch = getBranch(invoice.MaCN);
      const branchIsActive = branch?.TrangThai === 1;

      return isCompleted && matchesDate && matchesBranch && branchIsActive;
    });
  }, [invoices, branches, dateFrom, dateTo, branchFilter]);

  const branchReportData: BranchReportRow[] = useMemo(() => {
    return selectedBranches.map((branch) => {
      const branchInvoices = filteredInvoices.filter(
        (invoice) => invoice.MaCN === branch.MaCN,
      );

      const SoDon = branchInvoices.length;
      const DoanhThu = branchInvoices.reduce(
        (sum, invoice) => sum + invoice.TongTien,
        0,
      );

      const TrungBinhDon = SoDon > 0 ? Math.round(DoanhThu / SoDon) : 0;
      const previousRevenue = previousPeriodByBranch[branch.MaCN] || 0;

      const SoKyTruoc =
        previousRevenue > 0
          ? Number(
              (((DoanhThu - previousRevenue) / previousRevenue) * 100).toFixed(
                1,
              ),
            )
          : 0;

      const TyLeDatChiTieu =
        branch.ChiTieu > 0
          ? Math.min(Math.round((DoanhThu / branch.ChiTieu) * 100), 100)
          : 0;

      return {
        MaCN: branch.MaCN,
        TenCN: branch.TenCN,
        SoDon,
        DoanhThu,
        TrungBinhDon,
        SoKyTruoc,
        TyLeDatChiTieu,
      };
    });
  }, [filteredInvoices, selectedBranches]);

  const totalRevenue = branchReportData.reduce(
    (sum, branch) => sum + branch.DoanhThu,
    0,
  );

  const totalOrders = branchReportData.reduce(
    (sum, branch) => sum + branch.SoDon,
    0,
  );

  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const bestBranch = branchReportData.reduce<BranchReportRow | null>(
    (best, branch) => {
      if (!best) return branch;
      return branch.DoanhThu > best.DoanhThu ? branch : best;
    },
    null,
  );

  const chartData: ChartRow[] = useMemo(() => {
    const groupedData: Record<string, ChartRow> = {};

    filteredInvoices.forEach((invoice) => {
      const branch = getBranch(invoice.MaCN);

      if (!branch || branch.TrangThai !== 1) return;

      const label = getGroupLabel(invoice.NgayLap);

      if (!groupedData[label]) {
        groupedData[label] = { label };
      }

      groupedData[label][branch.ShortName] =
        Number(groupedData[label][branch.ShortName] || 0) + invoice.TongTien;
    });

    return Object.values(groupedData);
  }, [filteredInvoices, branches, viewBy]);

  const totalPages = Math.ceil(branchReportData.length / pageSize);

  const paginatedBranchData = branchReportData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleApplyFilter = () => {
    if (draftDateFrom > draftDateTo) {
      alert("Từ ngày phải nhỏ hơn hoặc bằng đến ngày");
      return;
    }

    setDateFrom(draftDateFrom);
    setDateTo(draftDateTo);
    setBranchFilter(draftBranch);
    setViewBy(draftViewBy);
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const headers = [
      "Mã chi nhánh",
      "Tên chi nhánh",
      "Số đơn",
      "Doanh thu",
      "TB/đơn",
      "So kỳ trước",
      "Đạt chỉ tiêu",
    ];

    const rows = branchReportData.map((branch) => [
      branch.MaCN,
      branch.TenCN,
      branch.SoDon,
      branch.DoanhThu,
      branch.TrungBinhDon,
      `${branch.SoKyTruoc}%`,
      `${branch.TyLeDatChiTieu}%`,
    ]);

    const totalRow = [
      "",
      "Tổng cộng",
      totalOrders,
      totalRevenue,
      avgOrderValue,
      "",
      "",
    ];

    downloadCsv("bao-cao-doanh-thu.csv", headers, [...rows, totalRow]);
  };

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    const rowsHtml = branchReportData
      .map(
        (branch) => `
          <tr>
            <td>${branch.MaCN}</td>
            <td>${branch.TenCN}</td>
            <td style="text-align:right">${branch.SoDon.toLocaleString("vi-VN")}</td>
            <td style="text-align:right">${formatCurrency(branch.DoanhThu)}</td>
            <td style="text-align:right">${formatCurrency(branch.TrungBinhDon)}</td>
            <td style="text-align:center">${branch.SoKyTruoc >= 0 ? "+" : ""}${branch.SoKyTruoc}%</td>
            <td style="text-align:center">${branch.TyLeDatChiTieu}%</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Báo cáo doanh thu</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #111827;
            }

            h1 {
              margin-bottom: 4px;
            }

            .meta {
              margin-bottom: 20px;
              color: #6B7280;
            }

            .summary {
              display: flex;
              gap: 16px;
              margin-bottom: 20px;
            }

            .card {
              border: 1px solid #E5E7EB;
              border-radius: 8px;
              padding: 12px;
              flex: 1;
            }

            .card-label {
              font-size: 12px;
              color: #6B7280;
              text-transform: uppercase;
            }

            .card-value {
              font-size: 22px;
              font-weight: bold;
              margin-top: 8px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }

            th, td {
              border: 1px solid #E5E7EB;
              padding: 8px;
              font-size: 13px;
            }

            th {
              background: #F3F4F6;
              text-align: left;
            }

            tfoot td {
              font-weight: bold;
              background: #F9FAFB;
            }
          </style>
        </head>

        <body>
          <h1>Báo cáo doanh thu</h1>
          <div class="meta">
            Từ ngày ${dateFrom} đến ${dateTo}
          </div>

          <div class="summary">
            <div class="card">
              <div class="card-label">Tổng doanh thu</div>
              <div class="card-value">${formatCurrency(totalRevenue)}</div>
            </div>

            <div class="card">
              <div class="card-label">Tổng số đơn</div>
              <div class="card-value">${totalOrders.toLocaleString("vi-VN")} đơn</div>
            </div>

            <div class="card">
              <div class="card-label">Doanh thu TB/đơn</div>
              <div class="card-value">${formatCurrency(avgOrderValue)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mã CN</th>
                <th>Chi nhánh</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
                <th>TB/đơn</th>
                <th>So kỳ trước</th>
                <th>Đạt chỉ tiêu</th>
              </tr>
            </thead>

            <tbody>
              ${rowsHtml}
            </tbody>

            <tfoot>
              <tr>
                <td></td>
                <td>Tổng cộng</td>
                <td style="text-align:right">${totalOrders.toLocaleString("vi-VN")}</td>
                <td style="text-align:right">${formatCurrency(totalRevenue)}</td>
                <td style="text-align:right">${formatCurrency(avgOrderValue)}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <MainLayout
      title="Báo cáo doanh thu"
      breadcrumb="Trang chủ / Báo cáo / Doanh thu"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />

            <Input
              type="date"
              value={draftDateFrom}
              onChange={(event) => setDraftDateFrom(event.target.value)}
              className="w-[150px]"
            />

            <span className="text-muted-foreground">—</span>

            <Input
              type="date"
              value={draftDateTo}
              onChange={(event) => setDraftDateTo(event.target.value)}
              className="w-[150px]"
            />
          </div>

          <Select value={draftBranch} onValueChange={setDraftBranch}>
            <SelectTrigger className="w-[240px]">
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

          <Select value={draftViewBy} onValueChange={setDraftViewBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Xem theo" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="day">Ngày</SelectItem>
              <SelectItem value="week">Tuần</SelectItem>
              <SelectItem value="month">Tháng</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleApplyFilter}>
            Áp dụng
          </Button>

          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportExcel}
            >
              <Download className="h-4 w-4" />
              Xuất Excel
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExportPDF}
            >
              <FileText className="h-4 w-4" />
              Xuất PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tổng doanh thu
            </p>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tổng số đơn
            </p>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {totalOrders.toLocaleString("vi-VN")} đơn
            </p>
          </div>

          <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Doanh thu TB/đơn
            </p>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(avgOrderValue)}
            </p>
          </div>

          <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Chi nhánh cao nhất
            </p>

            <p className="mt-2 truncate text-2xl font-bold text-primary">
              {bestBranch ? bestBranch.TenCN : "—"}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />

            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Biểu đồ doanh thu theo chi nhánh
            </h3>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6C757D" }}
                  axisLine={{ stroke: "#E9ECEF" }}
                />

                <YAxis
                  tick={{ fontSize: 12, fill: "#6C757D" }}
                  axisLine={{ stroke: "#E9ECEF" }}
                  tickFormatter={formatCompact}
                />

                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E9ECEF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />

                <Legend />

                {selectedBranches.map((branch) => (
                  <Bar
                    key={branch.MaCN}
                    dataKey={branch.ShortName}
                    fill={branch.MauBieuDo}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã CN
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi nhánh
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Số đơn
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Doanh thu
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    TB/đơn
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    So kỳ trước
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Đạt chỉ tiêu
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginatedBranchData.map((branch) => (
                  <tr key={branch.MaCN} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {branch.MaCN}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {branch.TenCN}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {branch.SoDon.toLocaleString("vi-VN")}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(branch.DoanhThu)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatCurrency(branch.TrungBinhDon)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-medium",
                          branch.SoKyTruoc >= 0
                            ? "text-[#198754]"
                            : "text-[#DC3545]",
                        )}
                      >
                        {branch.SoKyTruoc >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {branch.SoKyTruoc >= 0 ? "+" : ""}
                        {branch.SoKyTruoc}%
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              branch.TyLeDatChiTieu >= 80
                                ? "bg-[#198754]"
                                : branch.TyLeDatChiTieu >= 60
                                  ? "bg-[#F4A261]"
                                  : "bg-[#DC3545]",
                            )}
                            style={{
                              width: `${branch.TyLeDatChiTieu}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-medium text-muted-foreground">
                          {branch.TyLeDatChiTieu}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedBranchData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có dữ liệu báo cáo phù hợp
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="bg-muted font-semibold">
                  <td className="px-4 py-3 text-sm text-foreground"></td>

                  <td className="px-4 py-3 text-sm text-foreground">
                    Tổng cộng
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {totalOrders.toLocaleString("vi-VN")}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-foreground">
                    {formatCurrency(totalRevenue)}
                  </td>

                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                    {formatCurrency(avgOrderValue)}
                  </td>

                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {branchReportData.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, branchReportData.length)} trong{" "}
              {branchReportData.length} chi nhánh
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
