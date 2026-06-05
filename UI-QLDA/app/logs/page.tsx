"use client";

import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Download } from "lucide-react";
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

import api from "@/services/api";
import { getCurrentUser } from "@/lib/auth";
import type { AuthUser } from "@/lib/permissions";

interface LogEntry {
  id: number;
  createdAt: string;
  username: string;
  action: string;
  module: string;
  details: string;
  type: "info" | "warning" | "error" | "success";
  maCN: string | null;
}

interface Branch {
  maCN: string;
  tenCN: string;
}

const typeConfig = {
  info: { label: "Thông tin", className: "bg-[#CCE5FF] text-[#004085]" },
  warning: { label: "Cảnh báo", className: "bg-[#FFF3CD] text-[#856404]" },
  error: { label: "Lỗi", className: "bg-[#F8D7DA] text-[#DC3545]" },
  success: { label: "Thành công", className: "bg-[#D1E7DD] text-[#198754]" },
};

export default function LogsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const isSystemRole = currentUser?.chucVu === "ADMIN";

  const uniqueModules = useMemo(() => {
    const modules = logs.map((log) => log.module).filter(Boolean);
    return Array.from(new Set(modules));
  }, [logs]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const fetchInitialData = async () => {
      try {
        const logRes = await api.get("/api/logs");
        setLogs(logRes.data);

        if (user?.chucVu === "ADMIN") {
          const branchRes = await api.get("/api/chinhanh");
          setBranches(branchRes.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu nhật ký:", error);
      }
    };

    fetchInitialData();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || log.type === typeFilter;
      const matchesModule =
        moduleFilter === "all" || log.module === moduleFilter;

      const matchesBranch = branchFilter === "all" || log.maCN === branchFilter;

      return matchesSearch && matchesType && matchesModule && matchesBranch;
    });
  }, [logs, searchQuery, typeFilter, moduleFilter, branchFilter]);

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getBranchName = (maCN: string | null) => {
    if (!maCN) return "Hệ thống";

    const branch = branches.find((b) => b.maCN === maCN);
    return branch ? branch.tenCN : maCN;
  };

  const handleExportExcel = () => {
    if (filteredLogs.length === 0) {
      alert("Không có dữ liệu để xuất Excel");
      return;
    }

    const exportData = filteredLogs.map((log, index) => ({
      STT: index + 1,
      "Thời gian": formatDate(log.createdAt),
      "Người dùng": log.username,
      "Chi nhánh": getBranchName(log.maCN),
      "Hành động": log.action,
      Module: log.module,
      "Chi tiết": log.details,
      Loại: typeConfig[log.type]?.label || log.type,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "NhatKyHeThong");

    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 18 },
      { wch: 50 },
      { wch: 15 },
    ];

    const now = new Date();
    const fileName = `nhat-ky-he-thong-${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <MainLayout
      title="Nhật ký hệ thống"
      breadcrumb="Trang chủ / Nhật ký hệ thống"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          {/* CHỈ HIỂN THỊ BỘ LỌC CHI NHÁNH CHO ADMIN */}
          {isSystemRole && (
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                <SelectItem value="Hệ thống">Hệ thống (Quản trị)</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.maCN} value={b.maCN}>
                    {b.tenCN}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* BỘ LỌC MODULE TỰ ĐỘNG */}
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả module</SelectItem>
              {uniqueModules.map((mod) => (
                <SelectItem key={mod} value={mod}>
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="info">Thông tin</SelectItem>
              <SelectItem value="success">Thành công</SelectItem>
              <SelectItem value="warning">Cảnh báo</SelectItem>
              <SelectItem value="error">Lỗi</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhật ký..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

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
                    "Thời gian",
                    "Người dùng",
                    "Chi nhánh",
                    "Hành động",
                    "Module",
                    "Chi tiết",
                    "Loại",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                      {log.username}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {log.maCN || "Hệ thống"}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {log.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {log.module}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-muted-foreground max-w-[300px] truncate"
                      title={log.details}
                    >
                      {log.details}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium",
                          typeConfig[log.type]?.className,
                        )}
                      >
                        {typeConfig[log.type]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Chưa có dữ liệu nhật ký nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị {filteredLogs.length} bản ghi
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-primary text-white"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                Sau
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
