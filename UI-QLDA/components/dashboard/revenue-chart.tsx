"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Branch {
  MaCN: string;
  TenCN: string;
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

interface RevenueChartProps {
  invoices: Invoice[];
  branches: Branch[];
}

interface ChartRow {
  date: string;
  [key: string]: string | number;
}

const colors = ["#2C6E49", "#F4A261", "#0DCAF0", "#6C757D", "#8B5CF6"];

const formatCurrency = (value: number) => {
  return (
    new Intl.NumberFormat("vi-VN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value) + "đ"
  );
};

const getDateOnly = (value: string) => {
  return String(value || "").slice(0, 10);
};

const formatDateLabel = (value: string) => {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
};

const addDays = (dateString: string, days: number) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
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

const getShortBranchName = (name: string) => {
  return name
    .replace("Phụng Lộc Coffee - ", "")
    .replace("Chi nhánh ", "")
    .trim();
};

export function RevenueChart({ invoices, branches }: RevenueChartProps) {
  const [branchFilter, setBranchFilter] = useState("all");

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);

  const selectedBranches =
    branchFilter === "all"
      ? activeBranches.slice(0, 5)
      : activeBranches.filter((branch) => branch.MaCN === branchFilter);

  const chartData = useMemo(() => {
    const latestDate = getLatestDate(invoices);

    const lastSevenDays = Array.from({ length: 7 }, (_, index) =>
      addDays(latestDate, index - 6),
    );

    return lastSevenDays.map((date) => {
      const row: ChartRow = {
        date: formatDateLabel(date),
      };

      selectedBranches.forEach((branch) => {
        const revenue = invoices
          .filter(
            (invoice) =>
              isCompletedInvoice(invoice) &&
              invoice.MaCN === branch.MaCN &&
              getDateOnly(invoice.NgayLap) === date,
          )
          .reduce((sum, invoice) => sum + Number(invoice.TongTien || 0), 0);

        row[getShortBranchName(branch.TenCN)] = revenue;
      });

      return row;
    });
  }, [invoices, selectedBranches]);

  return (
    <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Doanh thu 7 ngày gần nhất
        </h3>

        <select
          value={branchFilter}
          onChange={(event) => setBranchFilter(event.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        >
          <option value="all">Tất cả chi nhánh</option>
          {activeBranches.map((branch) => (
            <option key={branch.MaCN} value={branch.MaCN}>
              {branch.TenCN}
            </option>
          ))}
        </select>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6C757D" }}
              axisLine={{ stroke: "#E9ECEF" }}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#6C757D" }}
              axisLine={{ stroke: "#E9ECEF" }}
              tickFormatter={formatCurrency}
            />

            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("vi-VN").format(Number(value)) + " ₫"
              }
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #E9ECEF",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />

            <Legend />

            {selectedBranches.map((branch, index) => {
              const key = getShortBranchName(branch.TenCN);

              return (
                <Line
                  key={branch.MaCN}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{
                    fill: colors[index % colors.length],
                    strokeWidth: 2,
                  }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
