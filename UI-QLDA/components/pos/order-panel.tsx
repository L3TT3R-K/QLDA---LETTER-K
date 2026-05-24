"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Trash2, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/app/pos/page";

type PaymentMethod = "cash" | "transfer";

interface OrderPanelProps {
  items: OrderItem[];
  onUpdateQuantity: (MaSP: string, SoLuong: number) => void;
  onUpdateNote: (MaSP: string, GhiChu: string) => void;
  onRemoveItem: (MaSP: string) => void;
  onClearOrder: () => void;
  onCheckout: (paymentMethod: PaymentMethod, giamGia: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const parseDiscount = (discount: string, subtotal: number) => {
  const cleanValue = discount.trim();

  if (!cleanValue) return 0;

  if (cleanValue.includes("%")) {
    const percent = Number(cleanValue.replace("%", ""));

    if (Number.isNaN(percent) || percent <= 0) return 0;

    return Math.min((subtotal * percent) / 100, subtotal);
  }

  const amount = Number(cleanValue.replace(/,/g, ""));

  if (Number.isNaN(amount) || amount <= 0) return 0;

  return Math.min(amount, subtotal);
};

export function OrderPanel({
  items,
  onUpdateQuantity,
  onUpdateNote,
  onRemoveItem,
  onClearOrder,
  onCheckout,
}: OrderPanelProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState("");

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.GiaBanTaiThoiDiem * item.SoLuong,
      0,
    );
  }, [items]);

  const discountAmount = useMemo(() => {
    return parseDiscount(discount, subtotal);
  }, [discount, subtotal]);

  const total = Math.max(subtotal - discountAmount, 0);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + item.SoLuong, 0);
  }, [items]);

  const handleCheckout = () => {
    if (items.length === 0 || total <= 0) return;

    onCheckout(paymentMethod, discountAmount);
    setDiscount("");
  };

  const handleClearOrder = () => {
    onClearOrder();
    setDiscount("");
  };

  return (
    <div className="flex h-full flex-col rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Hóa đơn mới</h3>

          <span className="text-sm font-medium text-primary">#Đơn mới</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <p className="text-sm">Chưa có sản phẩm nào</p>
            <p className="text-xs">Chọn sản phẩm từ danh sách bên trái</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.MaSP}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {item.TenSP}
                      </p>

                      {item.IsTopping && (
                        <span className="rounded-md bg-[#FFF3CD] px-2 py-0.5 text-[10px] font-medium text-[#856404]">
                          Topping
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">{item.MaSP}</p>

                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.GiaBanTaiThoiDiem)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.MaSP, item.SoLuong - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <span className="w-8 text-center text-sm font-medium">
                      {item.SoLuong}
                    </span>

                    <button
                      onClick={() =>
                        onUpdateQuantity(item.MaSP, item.SoLuong + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-24 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(item.GiaBanTaiThoiDiem * item.SoLuong)}
                    </span>

                    <button
                      onClick={() => onRemoveItem(item.MaSP)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Input
                  value={item.GhiChu}
                  onChange={(event) =>
                    onUpdateNote(item.MaSP, event.target.value)
                  }
                  placeholder="Ghi chú cho món này..."
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Giảm giá
          </label>

          <Input
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            placeholder="Nhập số tiền hoặc %, ví dụ 10000 hoặc 10%"
            disabled={items.length === 0}
          />
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tổng số món</span>
            <span className="font-medium">{totalQuantity}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tạm tính</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Giảm giá</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-lg font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setPaymentMethod("cash")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors",
              paymentMethod === "cash"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            <Banknote className="h-4 w-4" />
            Tiền mặt
          </button>

          <button
            onClick={() => setPaymentMethod("transfer")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors",
              paymentMethod === "transfer"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            <CreditCard className="h-4 w-4" />
            Chuyển khoản
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClearOrder}
            disabled={items.length === 0}
          >
            Hủy đơn
          </Button>

          <Button
            className="flex-[2]"
            disabled={items.length === 0 || total <= 0}
            onClick={handleCheckout}
          >
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
