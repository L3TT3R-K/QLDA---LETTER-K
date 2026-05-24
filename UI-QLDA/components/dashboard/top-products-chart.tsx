"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopProduct {
  TenSP: string;
  SoLuong: number;
}

interface TopProductsChartProps {
  data: TopProduct[];
}

const colors = ["#F4A261", "#2C6E49", "#0DCAF0", "#8B5CF6", "#6C757D"];

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Top 5 sản phẩm bán chạy
      </h3>

      <div className="h-[280px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chưa có dữ liệu sản phẩm bán chạy
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={24}>
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#6C757D" }}
                axisLine={{ stroke: "#E9ECEF" }}
              />

              <YAxis
                type="category"
                dataKey="TenSP"
                tick={{ fontSize: 12, fill: "#6C757D" }}
                axisLine={{ stroke: "#E9ECEF" }}
                width={120}
              />

              <Tooltip
                formatter={(value: number) => [value + " ly", "Số lượng"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E9ECEF",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />

              <Bar dataKey="SoLuong" radius={[0, 4, 4, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
