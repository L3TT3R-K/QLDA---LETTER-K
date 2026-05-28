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
import { getCurrentUser } from "@/lib/auth";
import api from "@/services/api";

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface ApiBranch {
  maCN: string;
  tenCN: string;
  trangThai?: number;
}

interface BaoCaoTonKhoResponse {
  maCN: string;
  maNL: string;
  tenNL: string;
  soLuongTon: number;
  tonToiThieu: number;
  trangThai: string;
  loaiCanhBao?: string;
  mucDo?: string;
  thongDiep?: string;
}

interface BaoCaoHaoHutResponse {
  maKK: string;
  ngayKiem: string;
  maNL: string;
  tenNL: string;
  soLuongHeThong: number;
  soLuongThucTe: number;
  chenhLech: number;
  tyLeHaoHut: number;
}

interface CanhBaoTonKhoTongHopResponse {
  duoiTonToiThieu?: BaoCaoTonKhoResponse[];
  tonAm?: BaoCaoTonKhoResponse[];
  giaoDichDongBoLoi?: unknown[];
  soDuoiTonToiThieu?: number;
  soTonAm?: number;
  soGiaoDichDongBoLoi?: number;
  tongCanhBao?: number;
}

interface StockRow {
  maNL: string;
  tenNguyenLieu: string;
  donVi: string;
  chiNhanh: string;
  maCN: string;
  tonHienTai: number;
  tonToiThieu: number;
  trangThai: string;
  MaNL: string;
  TenNL: string;
  DonVi: string;
  TenCN: string;
  MaCN: string;
  SoLuongTon: number;
  TonToiThieu: number;
  Status: StockStatus;
  ThongDiep?: string;
}

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

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const toInputDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

const getMonthRangeParams = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);

  return {
    tuNgay: toInputDateTime(firstDay),
    denNgay: toInputDateTime(lastDay),
  };
};

const getStatusKey = (value?: string, quantity = 0): StockStatus => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized.includes("tồn âm") || quantity < 0) return "danger";
  if (normalized.includes("cần nhập") || normalized.includes("nguy")) {
    return "danger";
  }
  if (normalized.includes("cảnh báo") || normalized.includes("duoi")) {
    return "warning";
  }
  if (normalized.includes("hết") || quantity === 0) return "outOfStock";

  return "normal";
};

const mapReportStock = (
  item: BaoCaoTonKhoResponse,
  branchNames: Map<string, string>,
): StockRow => {
  const branchName = branchNames.get(item.maCN) || item.maCN;
  const quantity = item.soLuongTon || 0;
  const minQuantity = item.tonToiThieu || 0;
  const status =
    quantity < 0
      ? "danger"
      : quantity === 0
        ? "outOfStock"
        : quantity < minQuantity
          ? "danger"
          : getStatusKey(item.trangThai, quantity);

  return {
    maNL: item.maNL,
    tenNguyenLieu: item.tenNL,
    donVi: "-",
    chiNhanh: branchName,
    maCN: item.maCN,
    tonHienTai: quantity,
    tonToiThieu: minQuantity,
    trangThai: statusConfig[status].label,
    MaNL: item.maNL,
    TenNL: item.tenNL,
    DonVi: "-",
    TenCN: branchName,
    MaCN: item.maCN,
    SoLuongTon: quantity,
    TonToiThieu: minQuantity,
    Status: status,
    ThongDiep: item.thongDiep,
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

export default function InventoryStockPage() {
  const [inventoryData, setInventoryData] = useState<StockRow[]>([]);
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [stockWarnings, setStockWarnings] = useState<BaoCaoTonKhoResponse[]>(
    [],
  );
  const [warningSummary, setWarningSummary] =
    useState<CanhBaoTonKhoTongHopResponse | null>(null);
  const [lossReports, setLossReports] = useState<BaoCaoHaoHutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchStockData = async () => {
    try {
      setIsLoading(true);

      const currentUser = getCurrentUser();
      const isWarehouseStaff = currentUser?.chucVu === "NHANVIEN_KHO";
      const effectiveBranchFilter =
        isWarehouseStaff && currentUser?.maCN ? currentUser.maCN : branchFilter;
      const branchesResponse = await api.get<ApiBranch[]>("/api/chinhanh");
      const activeBranches = (branchesResponse.data || []).filter(
        (branch) => branch.trangThai === undefined || branch.trangThai === 1,
      );
      const accessibleBranches =
        isWarehouseStaff && currentUser?.maCN
          ? activeBranches.filter((branch) => branch.maCN === currentUser.maCN)
          : activeBranches;
      const branchNames = new Map(
        activeBranches.map((branch) => [branch.maCN, branch.tenCN]),
      );
      const selectedBranches =
        effectiveBranchFilter === "all"
          ? accessibleBranches
          : accessibleBranches.filter(
              (branch) => branch.maCN === effectiveBranchFilter,
            );
      const selectedLossBranches =
        effectiveBranchFilter === "all"
          ? accessibleBranches
          : accessibleBranches.filter(
              (branch) => branch.maCN === effectiveBranchFilter,
            );

      const [stockResults, warningResult, summaryResult, lossResults] =
        await Promise.all([
          Promise.all(
            selectedBranches.length > 0
              ? selectedBranches.map((branch) =>
                  api.get<ApiResponse<BaoCaoTonKhoResponse[]>>(
                    "/api/baocao/ton-kho",
                    {
                      params: { maCN: branch.maCN },
                    },
                  ),
                )
              : [
                  api.get<ApiResponse<BaoCaoTonKhoResponse[]>>(
                    "/api/baocao/ton-kho",
                  ),
                ],
          ),
          api.get<ApiResponse<BaoCaoTonKhoResponse[]>>(
            "/api/baocao/canh-bao-ton-kho",
            {
              params:
                effectiveBranchFilter !== "all"
                  ? { maCN: effectiveBranchFilter }
                  : undefined,
            },
          ),
          api.get<ApiResponse<CanhBaoTonKhoTongHopResponse>>(
            "/api/baocao/canh-bao",
            {
              params:
                effectiveBranchFilter !== "all"
                  ? { maCN: effectiveBranchFilter }
                  : undefined,
            },
          ),
          Promise.all(
            selectedLossBranches.map((branch) =>
              api.get<ApiResponse<BaoCaoHaoHutResponse[]>>(
                "/api/baocao/hao-hut",
                {
                  params: {
                    maCN: branch.maCN,
                    ...getMonthRangeParams(),
                  },
                },
              ),
            ),
          ),
        ]);

      setBranches(activeBranches);
      setInventoryData(
        stockResults.flatMap((result) =>
          (result.data.data || []).map((item) =>
            mapReportStock(item, branchNames),
          ),
        ),
      );
      setStockWarnings(warningResult.data.data || []);
      setWarningSummary(summaryResult.data.data || null);
      setLossReports(lossResults.flatMap((result) => result.data.data || []));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Không tải được báo cáo tồn kho từ backend";
      alert(message);
      setInventoryData([]);
      setStockWarnings([]);
      setWarningSummary(null);
      setLossReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [branchFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, branchFilter, statusFilter]);

  const enrichedInventory = useMemo(() => {
    return inventoryData.map((item) => {
      let statusKey: StockStatus = "normal";
      if (item.trangThai === "Hết hàng") statusKey = "outOfStock";
      else if (item.trangThai === "Nguy hiểm") statusKey = "danger";
      else if (item.trangThai === "Cảnh báo") statusKey = "warning";

      return {
        MaNL: item.maNL,
        TenNL: item.tenNguyenLieu,
        DonVi: item.donVi,
        TenCN: item.chiNhanh,
        MaCN: item.maCN || item.chiNhanh, 
        SoLuongTon: item.tonHienTai,
        TonToiThieu: item.tonToiThieu,
        Status: statusKey,
      };
    });
  }, [inventoryData]);

  const activeBranches = useMemo(() => {
    const branchesMap = new Map();
    enrichedInventory.forEach((item) => {
      if (!branchesMap.has(item.MaCN)) {
        branchesMap.set(item.MaCN, item.TenCN);
      }
    });
    return Array.from(branchesMap.entries()).map(([ma, ten]) => ({
      MaCN: ma,
      TenCN: ten,
    }));
  }, [enrichedInventory]);

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

  const normalCount = enrichedInventory.filter((item) => item.Status === "normal").length;
  const warningCount = enrichedInventory.filter((item) => item.Status === "warning").length;
  const dangerCount = enrichedInventory.filter((item) => item.Status === "danger").length;
  const outOfStockCount = enrichedInventory.filter((item) => item.Status === "outOfStock").length;
  const totalWarningCount =
    warningSummary?.tongCanhBao ?? stockWarnings.length;
  const lossCount = lossReports.length;

  const handleExportExcel = () => {
    const headers = [
      "Mã chi nhánh",
      "Tên chi nhánh",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Đơn vị",
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
      item.SoLuongTon,
      item.TonToiThieu,
      statusConfig[item.Status].label,
    ]);

    downloadCsv("ton-kho-hien-tai.csv", headers, rows);
  };

  return (
    <MainLayout
      title="Tồn kho hiện tại"
      breadcrumb="Trang chủ / Kho nguyên liệu / Tồn kho"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                  {totalWarningCount || warningCount + dangerCount}
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

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8D7DA]">
                <AlertTriangle className="h-5 w-5 text-[#DC3545]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hao hụt tháng này</p>
                <p className="text-2xl font-bold text-[#DC3545]">
                  {lossCount}
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

          <Button variant="outline" className="gap-2" onClick={fetchStockData} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Làm mới
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mã NL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tên nguyên liệu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đơn vị</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chi nhánh</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tồn hiện tại</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tồn tối thiểu</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Đang tải dữ liệu kho từ server...
                    </td>
                  </tr>
                ) : paginatedData.map((item, index) => (
                  <tr key={`${item.MaCN}-${item.MaNL}-${index}`} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{item.MaNL}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{item.TenNL}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.DonVi}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{item.TenCN}</p>
                      {item.MaCN !== item.TenCN && (
                         <p className="text-xs text-muted-foreground">{item.MaCN}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatNumber(item.SoLuongTon)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatNumber(item.TonToiThieu)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-block rounded-md px-2 py-1 text-xs font-medium", statusConfig[item.Status].className)}>
                        {statusConfig[item.Status].label}
                      </span>
                    </td>
                  </tr>
                ))}

                {!isLoading && paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Không có dữ liệu tồn kho phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredData.length)} trong {filteredData.length} dòng tồn kho
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-primary text-white" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((page) => page + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
