import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  icon: LucideIcon;
  borderColor: "accent" | "primary" | "warning" | "info";
  badge?: {
    text: string;
    variant: "danger" | "warning" | "info";
  };
}

const borderColors = {
  accent: "border-t-accent",
  primary: "border-t-primary",
  warning: "border-t-[#FFC107]",
  info: "border-t-[#0DCAF0]",
};

const badgeVariants = {
  danger: "bg-[#F8D7DA] text-[#DC3545]",
  warning: "bg-[#FFF3CD] text-[#856404]",
  info: "bg-[#CFF4FC] text-[#055160]",
};

export function KPICard({
  title,
  value,
  trend,
  icon: Icon,
  borderColor,
  badge,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-t-4 bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        borderColors[borderColor],
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>

          {trend && (
            <p
              className={cn(
                "mt-1 text-sm",
                trend.isPositive ? "text-[#198754]" : "text-destructive",
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value} {trend.label}
            </p>
          )}

          {badge && (
            <span
              className={cn(
                "mt-2 inline-block rounded-md px-2 py-1 text-xs font-medium",
                badgeVariants[badge.variant],
              )}
            >
              {badge.text}
            </span>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
