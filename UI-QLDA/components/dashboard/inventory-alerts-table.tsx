import { cn } from "@/lib/utils";

interface InventoryAlert {
  MaNL: string;
  TenNL: string;
  TenCN: string;
  SoLuongTon: number;
  TonToiThieu: number;
  DonVi: string;
  Status: "danger" | "warning";
}

interface InventoryAlertsTableProps {
  alerts: InventoryAlert[];
}

const statusBadge = {
  danger: "bg-[#F8D7DA] text-[#DC3545]",
  warning: "bg-[#FFF3CD] text-[#856404]",
};

const statusLabel = {
  danger: "Nguy hiểm",
  warning: "Cảnh báo",
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

export function InventoryAlertsTable({ alerts }: InventoryAlertsTableProps) {
  return (
    <div className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Cảnh báo tồn kho
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nguyên liệu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chi nhánh
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tồn hiện tại
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tồn tối thiểu
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {alerts.map((alert) => (
              <tr
                key={`${alert.MaNL}-${alert.TenCN}`}
                className="hover:bg-muted/50"
              >
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {alert.TenNL}
                  <p className="text-xs text-muted-foreground">{alert.MaNL}</p>
                </td>

                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {alert.TenCN}
                </td>

                <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                  {formatNumber(alert.SoLuongTon)} {alert.DonVi}
                </td>

                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                  {formatNumber(alert.TonToiThieu)} {alert.DonVi}
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 py-1 text-xs font-medium",
                      statusBadge[alert.Status],
                    )}
                  >
                    {statusLabel[alert.Status]}
                  </span>
                </td>
              </tr>
            ))}

            {alerts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                  Không có cảnh báo tồn kho
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
