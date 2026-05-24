"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: string
  timestamp: string
  user: string
  action: string
  module: string
  detail: string
  type: "info" | "warning" | "error" | "success"
}

const logData: LogEntry[] = [
  { id: "LOG001", timestamp: "15/01/2024 10:35:22", user: "Nguyễn Văn A", action: "Đăng nhập", module: "Hệ thống", detail: "Đăng nhập thành công từ IP 192.168.1.10", type: "info" },
  { id: "LOG002", timestamp: "15/01/2024 10:38:05", user: "Nguyễn Văn A", action: "Tạo đơn hàng", module: "POS", detail: "Tạo đơn #DH20240115001 – Tổng: 85.000 ₫", type: "success" },
  { id: "LOG003", timestamp: "15/01/2024 10:52:14", user: "Trần Thị B", action: "Nhập kho", module: "Kho nguyên liệu", detail: "Nhập 10kg Cà phê Arabica – Phiếu NK003", type: "success" },
  { id: "LOG004", timestamp: "15/01/2024 11:10:30", user: "Lê Văn C", action: "Đăng nhập thất bại", module: "Hệ thống", detail: "Sai mật khẩu – IP 192.168.1.15", type: "error" },
  { id: "LOG005", timestamp: "15/01/2024 11:15:00", user: "Lê Văn C", action: "Đăng nhập", module: "Hệ thống", detail: "Đăng nhập thành công từ IP 192.168.1.15", type: "info" },
  { id: "LOG006", timestamp: "15/01/2024 11:30:45", user: "Phạm Thị D", action: "Cảnh báo tồn kho", module: "Kho nguyên liệu", detail: "Kem whipping (Chi nhánh Gò Vấp) dưới mức tối thiểu", type: "warning" },
  { id: "LOG007", timestamp: "15/01/2024 12:05:18", user: "Hoàng Văn E", action: "Xuất kho", module: "Kho nguyên liệu", detail: "Xuất 2 lít sữa tươi hết hạn – Phiếu XK002", type: "info" },
  { id: "LOG008", timestamp: "15/01/2024 13:20:00", user: "Nguyễn Văn A", action: "Cập nhật sản phẩm", module: "Danh mục", detail: "Cập nhật giá Freeze cà phê: 49.000 → 52.000 ₫", type: "success" },
  { id: "LOG009", timestamp: "15/01/2024 14:45:33", user: "Trần Thị B", action: "Điều chuyển kho", module: "Kho nguyên liệu", detail: "Điều chuyển 5kg đường từ Q1 → Q3 – Phiếu DC003", type: "success" },
  { id: "LOG010", timestamp: "15/01/2024 16:00:00", user: "Hệ thống", action: "Sao lưu dữ liệu", module: "Hệ thống", detail: "Sao lưu tự động thành công", type: "info" },
]

const typeConfig = {
  info: { label: "Thông tin", className: "bg-[#CCE5FF] text-[#004085]" },
  warning: { label: "Cảnh báo", className: "bg-[#FFF3CD] text-[#856404]" },
  error: { label: "Lỗi", className: "bg-[#F8D7DA] text-[#DC3545]" },
  success: { label: "Thành công", className: "bg-[#D1E7DD] text-[#198754]" },
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [moduleFilter, setModuleFilter] = useState("all")

  const filteredLogs = logData.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || log.type === typeFilter
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter
    return matchesSearch && matchesType && matchesModule
  })

  return (
    <MainLayout title="Nhật ký hệ thống" breadcrumb="Trang chủ / Nhật ký hệ thống">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả module</SelectItem>
              <SelectItem value="Hệ thống">Hệ thống</SelectItem>
              <SelectItem value="POS">POS</SelectItem>
              <SelectItem value="Kho nguyên liệu">Kho nguyên liệu</SelectItem>
              <SelectItem value="Danh mục">Danh mục</SelectItem>
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

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhật ký..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {["Thời gian", "Người dùng", "Hành động", "Module", "Chi tiết", "Loại"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{log.user}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{log.module}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[300px]">{log.detail}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-block rounded-md px-2 py-1 text-xs font-medium", typeConfig[log.type].className)}>
                        {typeConfig[log.type].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">Hiển thị 1–{filteredLogs.length} trong {logData.length} bản ghi</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Trước</Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
              <Button variant="outline" size="sm">Sau</Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
