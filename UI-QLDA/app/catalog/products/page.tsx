"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Coffee,
  Pencil,
  X,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Product {
  MaSP: string;
  TenSP: string;
  GiaHienTai: number;
  IsTopping: boolean;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

const storageKey = "SANPHAM";

const initialProducts: Product[] = [
  {
    MaSP: "SP001",
    TenSP: "Cà phê đen đá",
    GiaHienTai: 25000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SP002",
    TenSP: "Cà phê sữa đá",
    GiaHienTai: 30000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SP003",
    TenSP: "Bạc xỉu",
    GiaHienTai: 35000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SP004",
    TenSP: "Trà đào cam sả",
    GiaHienTai: 45000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SP005",
    TenSP: "Trà sữa truyền thống",
    GiaHienTai: 40000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SP006",
    TenSP: "Matcha đá xay",
    GiaHienTai: 55000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SP007",
    TenSP: "Bánh tiramisu",
    GiaHienTai: 45000,
    IsTopping: false,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SPT01",
    TenSP: "Trân châu đen",
    GiaHienTai: 7000,
    IsTopping: true,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SPT02",
    TenSP: "Kem cheese",
    GiaHienTai: 10000,
    IsTopping: true,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaSP: "SPT03",
    TenSP: "Thạch cà phê",
    GiaHienTai: 8000,
    IsTopping: true,
    TrangThai: 1,
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
];

const getFromStorage = <T,>(key: string, fallback: T[]): T[] => {
  if (typeof window === "undefined") return fallback;

  const data = localStorage.getItem(key);

  if (!data) return fallback;

  try {
    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
};

const saveToStorage = <T,>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const normalizeProduct = (product: Partial<Product>): Product | null => {
  const MaSP = product.MaSP;
  const TenSP = product.TenSP;
  const GiaHienTai = Number(product.GiaHienTai);

  if (!MaSP || !TenSP || Number.isNaN(GiaHienTai)) return null;

  return {
    MaSP,
    TenSP,
    GiaHienTai,
    IsTopping: Boolean(product.IsTopping),
    TrangThai: Number(product.TrangThai ?? 1),
    CreatedAt: product.CreatedAt,
    UpdatedAt: product.UpdatedAt,
  };
};

const getNextProductCode = (products: Product[], isTopping: boolean) => {
  if (isTopping) {
    const maxNumber = products.reduce((max, product) => {
      if (!product.MaSP.startsWith("SPT")) return max;

      const number = Number(product.MaSP.replace("SPT", ""));

      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    return `SPT${String(maxNumber + 1).padStart(2, "0")}`;
  }

  const maxNumber = products.reduce((max, product) => {
    if (!product.MaSP.startsWith("SP")) return max;
    if (product.MaSP.startsWith("SPT")) return max;

    const number = Number(product.MaSP.replace("SP", ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `SP${String(maxNumber + 1).padStart(3, "0")}`;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    TenSP: "",
    GiaHienTai: "",
    IsTopping: false,
    TrangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const storedProducts = getFromStorage<Partial<Product>>(storageKey, []);

    if (storedProducts.length > 0) {
      const normalizedProducts = storedProducts
        .map(normalizeProduct)
        .filter((item): item is Product => item !== null);

      if (normalizedProducts.length > 0) {
        setProducts(normalizedProducts);
        return;
      }
    }

    saveToStorage(storageKey, initialProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.TenSP.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.MaSP.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.TrangThai === 1) ||
        (statusFilter === "inactive" && product.TrangThai === 0);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "product" && product.IsTopping === false) ||
        (typeFilter === "topping" && product.IsTopping === true);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [products, searchQuery, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const activeCount = products.filter(
    (product) => product.TrangThai === 1,
  ).length;
  const inactiveCount = products.filter(
    (product) => product.TrangThai === 0,
  ).length;
  const toppingCount = products.filter((product) => product.IsTopping).length;

  const resetForm = () => {
    setFormData({
      TenSP: "",
      GiaHienTai: "",
      IsTopping: false,
      TrangThai: 1,
    });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const openAddDrawer = () => {
    setEditingProduct(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      TenSP: product.TenSP,
      GiaHienTai: String(product.GiaHienTai),
      IsTopping: product.IsTopping,
      TrangThai: product.TrangThai,
    });
    setIsDrawerOpen(true);
  };

  const persistProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    saveToStorage(storageKey, updatedProducts);
  };

  const toggleProductStatus = (MaSP: string) => {
    const updatedProducts = products.map((product) =>
      product.MaSP === MaSP
        ? {
            ...product,
            TrangThai: product.TrangThai === 1 ? 0 : 1,
            UpdatedAt: new Date().toISOString(),
          }
        : product,
    );

    persistProducts(updatedProducts);
  };

  const handleSave = () => {
    const tenSP = formData.TenSP.trim();
    const priceNumber = Number(formData.GiaHienTai);

    if (!tenSP || !formData.GiaHienTai) {
      alert("Vui lòng nhập đầy đủ tên sản phẩm và giá hiện tại");
      return;
    }

    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      alert("Giá hiện tại phải là số lớn hơn 0");
      return;
    }

    const duplicatedName = products.some((product) => {
      const isSameName =
        product.TenSP.trim().toLowerCase() === tenSP.toLowerCase();
      const isDifferentProduct =
        !editingProduct || product.MaSP !== editingProduct.MaSP;

      return isSameName && isDifferentProduct;
    });

    if (duplicatedName) {
      alert("Tên sản phẩm đã tồn tại");
      return;
    }

    const now = new Date().toISOString();

    if (editingProduct) {
      const updatedProducts = products.map((product) =>
        product.MaSP === editingProduct.MaSP
          ? {
              ...product,
              TenSP: tenSP,
              GiaHienTai: priceNumber,
              IsTopping: formData.IsTopping,
              TrangThai: formData.TrangThai,
              UpdatedAt: now,
            }
          : product,
      );

      persistProducts(updatedProducts);
    } else {
      const newProduct: Product = {
        MaSP: getNextProductCode(products, formData.IsTopping),
        TenSP: tenSP,
        GiaHienTai: priceNumber,
        IsTopping: formData.IsTopping,
        TrangThai: formData.TrangThai,
        CreatedAt: now,
        UpdatedAt: now,
      };

      persistProducts([...products, newProduct]);
      setCurrentPage(1);
    }

    closeDrawer();
  };

  const handleDelete = (MaSP: string) => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn ngưng bán sản phẩm này không?",
    );

    if (!isConfirmed) return;

    const updatedProducts = products.map((product) =>
      product.MaSP === MaSP
        ? {
            ...product,
            TrangThai: 0,
            UpdatedAt: new Date().toISOString(),
          }
        : product,
    );

    persistProducts(updatedProducts);
  };

  return (
    <MainLayout
      title="Quản lý sản phẩm"
      breadcrumb="Trang chủ / Danh mục / Sản phẩm"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {products.length}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang bán</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Ngừng bán</p>
            <p className="mt-1 text-2xl font-bold text-destructive">
              {inactiveCount}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Topping</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {toppingCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang bán</SelectItem>
              <SelectItem value="inactive">Ngừng bán</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Loại sản phẩm" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="product">Sản phẩm chính</SelectItem>
              <SelectItem value="topping">Topping</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded p-1.5",
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <List className="h-4 w-4" />
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded p-1.5",
                viewMode === "grid"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          <Button onClick={openAddDrawer} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {paginatedProducts.map((product) => (
              <div
                key={product.MaSP}
                className="rounded-lg border bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all hover:shadow-md"
              >
                <div className="mb-3 flex h-32 items-center justify-center rounded-md bg-muted">
                  <Coffee className="h-12 w-12 text-muted-foreground" />
                </div>

                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-primary">
                      {product.MaSP}
                    </p>

                    <h4 className="text-sm font-semibold text-foreground line-clamp-2">
                      {product.TenSP}
                    </h4>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded px-2 py-1 text-xs font-medium",
                      product.TrangThai === 1
                        ? "bg-[#D1E7DD] text-[#198754]"
                        : "bg-[#F8D7DA] text-[#DC3545]",
                    )}
                  >
                    {product.TrangThai === 1 ? "Đang bán" : "Ngừng bán"}
                  </span>
                </div>

                <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {product.IsTopping ? "Topping" : "Sản phẩm chính"}
                </span>

                <p className="mb-3 text-lg font-bold text-primary">
                  {formatCurrency(product.GiaHienTai)}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.TrangThai === 1}
                      onCheckedChange={() => toggleProductStatus(product.MaSP)}
                    />

                    <span className="text-xs text-muted-foreground">
                      {product.TrangThai === 1 ? "Bán" : "Ngưng"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditDrawer(product)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.MaSP)}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paginatedProducts.length === 0 && (
              <div className="col-span-full rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Không có sản phẩm phù hợp
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã SP
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sản phẩm
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Loại
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Giá hiện tại
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginatedProducts.map((product) => (
                  <tr key={product.MaSP} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {product.MaSP}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Coffee className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <span className="text-sm font-medium text-foreground">
                          {product.TenSP}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {product.IsTopping ? "Topping" : "Sản phẩm chính"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(product.GiaHienTai)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={product.TrangThai === 1}
                          onCheckedChange={() =>
                            toggleProductStatus(product.MaSP)
                          }
                        />

                        <span
                          className={cn(
                            "rounded px-2 py-1 text-xs font-medium",
                            product.TrangThai === 1
                              ? "bg-[#D1E7DD] text-[#198754]"
                              : "bg-[#F8D7DA] text-[#DC3545]",
                          )}
                        >
                          {product.TrangThai === 1 ? "Đang bán" : "Ngừng bán"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditDrawer(product)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(product.MaSP)}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có sản phẩm phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <p className="text-sm text-muted-foreground">
            Hiển thị{" "}
            {filteredProducts.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            –{Math.min(currentPage * pageSize, filteredProducts.length)} trong{" "}
            {filteredProducts.length} sản phẩm
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Trước
            </Button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page ? "bg-primary text-white" : ""
                  }
                >
                  {page}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />

          <div className="relative z-10 flex h-full w-[400px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>

              <button
                onClick={closeDrawer}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {editingProduct && (
                  <div>
                    <Label>Mã sản phẩm</Label>

                    <Input
                      value={editingProduct.MaSP}
                      disabled
                      className="mt-1.5"
                    />
                  </div>
                )}

                <div>
                  <Label>Tên sản phẩm *</Label>

                  <Input
                    value={formData.TenSP}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        TenSP: event.target.value,
                      })
                    }
                    placeholder="Nhập tên sản phẩm"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Giá hiện tại *</Label>

                  <Input
                    type="number"
                    min={0}
                    value={formData.GiaHienTai}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        GiaHienTai: event.target.value,
                      })
                    }
                    placeholder="Nhập giá hiện tại"
                    className="mt-1.5"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.IsTopping}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        IsTopping: checked,
                      })
                    }
                  />

                  <Label>Là topping</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.TrangThai === 1}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        TrangThai: checked ? 1 : 0,
                      })
                    }
                  />

                  <Label>Đang bán</Label>
                </div>

                <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Khi thêm mới, hệ thống sẽ tự tạo mã:
                  <br />
                  <span className="font-medium text-foreground">
                    SP001, SP002...
                  </span>{" "}
                  cho sản phẩm chính.
                  <br />
                  <span className="font-medium text-foreground">
                    SPT01, SPT02...
                  </span>{" "}
                  cho topping.
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={closeDrawer}
              >
                Hủy
              </Button>

              <Button className="flex-1" onClick={handleSave}>
                Lưu sản phẩm
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
