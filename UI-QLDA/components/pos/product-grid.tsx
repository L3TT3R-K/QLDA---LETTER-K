"use client";

import { useMemo, useState } from "react";
import { Coffee, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProductForPOS } from "@/app/pos/page";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductForPOS[];
  onAddProduct: (product: ProductForPOS) => void;
}

const categories = ["Tất cả", "Cà phê", "Trà", "Đá xay", "Bánh", "Topping"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

export function ProductGrid({ products, onAddProduct }: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.TenSP.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.MaSP.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "Tất cả" || product.Category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="flex h-full flex-col rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Tìm sản phẩm..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.MaSP}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="mb-4 flex h-28 items-center justify-center rounded-md bg-muted">
                <Coffee className="h-10 w-10 text-muted-foreground" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {product.TenSP}
                  </p>

                  {product.IsTopping && (
                    <span className="rounded-md bg-[#FFF3CD] px-2 py-1 text-[11px] font-medium text-[#856404]">
                      Topping
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">{product.MaSP}</p>

                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(product.GiaHienTai)}
                </p>
              </div>

              <Button
                className="mt-4 w-full gap-2"
                onClick={() => onAddProduct(product)}
              >
                <Plus className="h-4 w-4" />
                Thêm
              </Button>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Không có sản phẩm phù hợp
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
