import { cn } from "@/lib/utils";

interface RecentOrder {
  MaHD: string;
  TenCN: string;
  TenNV: string;
  TongTien: number;
  ThoiGian: string;
  TrangThai: number;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

const statusBadge: Record<number, string> = {
  0: "bg-[#CFF4FC] text-[#055160]",
  1: "bg-[#D1E7DD] text-[#198754]",
  2: "bg-[#F8D7DA] text-[#DC3545]",
};

const statusLabel: Record<number, string> = {
  0: "Đang xử lý",
  1: "Hoàn tất",
  2: "Đã hủy",
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Đơn hàng gần nhất
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Mã đơn
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chi nhánh
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nhân viên
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng tiền
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Thời gian
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.MaHD} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm font-medium text-primary">
                  {order.MaHD}
                </td>

                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {order.TenCN}
                </td>

                <td className="px-4 py-3 text-sm text-foreground">
                  {order.TenNV}
                </td>

                <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  {formatCurrency(order.TongTien)}
                </td>

                <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                  {order.ThoiGian}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 py-1 text-xs font-medium",
                      statusBadge[order.TrangThai] || statusBadge[0],
                    )}
                  >
                    {statusLabel[order.TrangThai] || "Đang xử lý"}
                  </span>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  Không có đơn hàng gần đây
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
