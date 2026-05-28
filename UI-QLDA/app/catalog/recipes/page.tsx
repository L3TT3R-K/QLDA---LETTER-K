"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Plus,
  Coffee,
  Trash2,
  Info,
  RefreshCw,
  Save,
  FileText,
} from "lucide-react";
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
import api from "@/services/api"; // Import API instance

// --- INTERFACES (Chuẩn hóa camelCase theo Backend DTO) ---
interface Product {
  maSP: string;
  tenSP: string;
  giaHienTai: number;
  isTopping: boolean;
  trangThai: number;
}

interface Ingredient {
  maNL: string;
  tenNL: string;
  donViCoBan: string;
  tonToiThieu: number;
  trangThai: number;
}

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
}

interface RecipeDetail {
  maNL: string;
  tenNL?: string;
  donViCoBan?: string;
  soLuong: number;
}

interface ActiveRecipe {
  maPB: string;
  maSP: string;
  tenSP: string;
  chiTiet: RecipeDetail[];
}

const unitStorageKey = "DONVI";
const initialUnits: Unit[] = [
  { MaDV: "GRAM", TenDonVi: "Gram", TrangThai: 1 },
  { MaDV: "KG", TenDonVi: "Kilogram", TrangThai: 1 },
  { MaDV: "ML", TenDonVi: "Mililít", TrangThai: 1 },
  { MaDV: "LIT", TenDonVi: "Lít", TrangThai: 1 },
  { MaDV: "CAI", TenDonVi: "Cái", TrangThai: 1 },
  { MaDV: "HOP", TenDonVi: "Hộp", TrangThai: 1 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: unknown } }).response;
    const data = response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (typeof data === "object" && data !== null && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return "Co loi xay ra khi luu cong thuc!";
};

export default function RecipesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  // Lưu trạng thái sản phẩm nào đã có công thức để hiển thị Sidebar
  const [hasRecipeMap, setHasRecipeMap] = useState<Record<string, boolean>>({});

  const [activeRecipe, setActiveRecipe] = useState<ActiveRecipe | null>(null);
  const [editingDetails, setEditingDetails] = useState<RecipeDetail[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [recipeFilter, setRecipeFilter] = useState("all");

  // --- HÀM LOAD DỮ LIỆU TỪ BACKEND ---
  const loadData = async () => {
    try {
      // 1. Gọi API lấy Sản phẩm và Nguyên liệu cùng lúc
      const [prodRes, ingRes] = await Promise.all([
        api.get("/api/sanpham"),
        api.get("/api/nguyenlieu")
      ]);
      
      const loadedProducts = prodRes.data || [];
      setProducts(loadedProducts);
      setIngredients(ingRes.data || []);

      // 2. Chạy ngầm API check công thức để hiển thị badge "Đã có CT / Chưa có CT"
      const activeProds = loadedProducts.filter((p: Product) => p.trangThai === 1);
      const statusMap: Record<string, boolean> = {};
      
      await Promise.all(
        activeProds.map(async (p: Product) => {
          try {
            const res = await api.get(`/api/congthuc/${p.maSP}`);
            statusMap[p.maSP] = res.data?.chiTiet?.length > 0;
          } catch (error) {
            statusMap[p.maSP] = false;
          }
        })
      );
      setHasRecipeMap(statusMap);

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu nền:", error);
    }

    // Load Đơn vị từ LocalStorage
    if (typeof window !== "undefined") {
      const storedUnits = localStorage.getItem(unitStorageKey);
      if (storedUnits) setUnits(JSON.parse(storedUnits));
      else localStorage.setItem(unitStorageKey, JSON.stringify(initialUnits));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tự động chọn sản phẩm đầu tiên
  useEffect(() => {
    const activeProducts = products.filter((p) => p.trangThai === 1);
    if (!selectedProduct && activeProducts.length > 0) {
      selectProduct(activeProducts[0]);
    }
  }, [products]);

  const activeProducts = products.filter((p) => p.trangThai === 1);
  const activeIngredients = ingredients.filter((i) => i.trangThai === 1);

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const getIngredient = (maNL: string) => {
    return ingredients.find((i) => i.maNL === maNL);
  };

  const hasRecipe = (maSP: string) => !!hasRecipeMap[maSP];

  // --- HÀM CHỌN SẢN PHẨM & LOAD CÔNG THỨC CHI TIẾT ---
  const selectProduct = async (product: Product) => {
    setSelectedProduct(product);
    try {
      const res = await api.get(`/api/congthuc/${product.maSP}`);
      setActiveRecipe(res.data);
      setEditingDetails(res.data.chiTiet || []);
    } catch (error) {
      setActiveRecipe(null);
      setEditingDetails([]);
    }
  };

  // --- THỐNG KÊ SIDEBAR ---
  const productsWithRecipe = activeProducts.filter((p) => hasRecipe(p.maSP)).length;
  const productsWithoutRecipe = activeProducts.length - productsWithRecipe;
  const recipeIngredientCount = editingDetails.length;

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      const matchesSearch =
        product.maSP.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tenSP.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "product" && !product.isTopping) ||
        (typeFilter === "topping" && product.isTopping);

      const matchesRecipe =
        recipeFilter === "all" ||
        (recipeFilter === "hasRecipe" && hasRecipe(product.maSP)) ||
        (recipeFilter === "noRecipe" && !hasRecipe(product.maSP));

      return matchesSearch && matchesType && matchesRecipe;
    });
  }, [activeProducts, searchQuery, typeFilter, recipeFilter, hasRecipeMap]);

  // --- THAO TÁC TRÊN BẢNG ---
  const addIngredient = () => {
    setEditingDetails([...editingDetails, { maNL: "", soLuong: 0 }]);
  };

  const removeIngredient = (index: number) => {
    setEditingDetails(editingDetails.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, maNL: string) => {
    setEditingDetails(
      editingDetails.map((item, i) => (i === index ? { ...item, maNL } : item))
    );
  };

  const updateAmount = (index: number, soLuong: number) => {
    setEditingDetails(
      editingDetails.map((item, i) => (i === index ? { ...item, soLuong } : item))
    );
  };

  const handleCancel = () => {
    if (selectedProduct) selectProduct(selectedProduct); // Load lại từ server
  };

  // --- HÀM LƯU CÔNG THỨC LÊN BACKEND ---
  const handleSave = async () => {
    if (!selectedProduct) return;

    if (editingDetails.length === 0) {
      alert("Vui lòng thêm ít nhất một nguyên liệu vào công thức");
      return;
    }

    const hasInvalidItem = editingDetails.some(
      (item) => !item.maNL || item.soLuong <= 0 || Number.isNaN(item.soLuong)
    );

    if (hasInvalidItem) {
      alert("Vui lòng chọn nguyên liệu và nhập định mức lớn hơn 0");
      return;
    }

    const duplicatedIngredient = editingDetails.some((item, index) =>
      editingDetails.some((otherItem, otherIndex) => otherIndex !== index && otherItem.maNL === item.maNL)
    );

    if (duplicatedIngredient) {
      alert("Một nguyên liệu không được xuất hiện nhiều lần trong cùng công thức");
      return;
    }

    // Backend đã tự lo việc versioning, chỉ cần đẩy list xuống
    const payload = {
      maSP: selectedProduct.maSP,
      chiTiet: editingDetails.map((item) => ({
        maNL: item.maNL,
        soLuong: item.soLuong,
      })),
    };

    try {
      await api.post("/api/congthuc", payload);
      alert("Đã cập nhật công thức thành công!");
      
      // Đánh dấu lại Sidebar và tải lại công thức mới nhất
      setHasRecipeMap((prev) => ({ ...prev, [selectedProduct.maSP]: true }));
      selectProduct(selectedProduct);
    } catch (error) {
      alert(getApiErrorMessage(error));
      console.error(error);
      return;
    }
  };

  return (
    <MainLayout title="Công thức pha chế" breadcrumb="Trang chủ / Danh mục / Công thức">
      <div className="space-y-4">
        {/* CARD THỐNG KÊ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Sản phẩm đang bán</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{activeProducts.length}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đã có công thức</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">{productsWithRecipe}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Chưa có công thức</p>
            <p className="mt-1 text-2xl font-bold text-[#DC3545]">{productsWithoutRecipe}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Nguyên liệu trong CT</p>
            <p className="mt-1 text-2xl font-bold text-primary">{recipeIngredientCount}</p>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-270px)] min-h-[520px]">
          {/* SIDEBAR SẢN PHẨM */}
          <div className="w-[380px] flex-shrink-0 rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col">
            <div className="space-y-3 border-b border-border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm mã hoặc tên sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger><SelectValue placeholder="Loại" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="product">Sản phẩm chính</SelectItem>
                    <SelectItem value="topping">Topping</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={recipeFilter} onValueChange={setRecipeFilter}>
                  <SelectTrigger><SelectValue placeholder="Công thức" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="hasRecipe">Đã có CT</SelectItem>
                    <SelectItem value="noRecipe">Chưa có CT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" className="w-full gap-2" onClick={loadData}>
                <RefreshCw className="h-4 w-4" /> Làm mới dữ liệu
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.maSP}
                  onClick={() => selectProduct(product)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors",
                    selectedProduct?.maSP === product.maSP
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Coffee className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{product.maSP}</span>
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", product.isTopping ? "bg-[#CFF4FC] text-[#055160]" : "bg-muted text-muted-foreground")}>
                        {product.isTopping ? "Topping" : "SP chính"}
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">{product.tenSP}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{formatCurrency(product.giaHienTai)}</span>
                      <span className={cn("text-xs font-medium", hasRecipe(product.maSP) ? "text-[#198754]" : "text-[#DC3545]")}>
                        {hasRecipe(product.maSP) ? "Đã có CT" : "Chưa có CT"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Không có sản phẩm phù hợp</div>}
            </div>
          </div>

          {/* MAIN CONTENT: CHI TIẾT CÔNG THỨC */}
          <div className="flex-1 rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            {selectedProduct ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-border p-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                      <Coffee className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">{selectedProduct.maSP}</span>
                        <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {selectedProduct.isTopping ? "Topping" : "Sản phẩm chính"}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-foreground">{selectedProduct.tenSP}</h2>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="text-sm font-semibold text-primary">{formatCurrency(selectedProduct.giaHienTai)}</span>
                        {activeRecipe?.maPB ? (
                          <span className="text-sm text-muted-foreground">
                            Đang áp dụng: <span className="font-medium text-foreground">{activeRecipe.maPB}</span>
                          </span>
                        ) : (
                          <span className="text-sm text-[#DC3545]">Chưa có phiên bản công thức</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Vì Backend tự động handle việc tạo version mới, ta gộp luôn chức năng Lưu và Tạo mới thành 1 nút để UX đơn giản hơn */}
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nguyên liệu</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đơn vị</th>
                        <th className="w-40 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Định mức</th>
                        <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {editingDetails.map((item, index) => {
                        const ingredient = getIngredient(item.maNL);
                        return (
                          <tr key={`${item.maNL}-${index}`} className="hover:bg-muted/50">
                            <td className="px-4 py-3">
                              <Select value={item.maNL} onValueChange={(value) => updateIngredient(index, value)}>
                                <SelectTrigger><SelectValue placeholder="Chọn nguyên liệu" /></SelectTrigger>
                                <SelectContent>
                                  {activeIngredients.map((ing) => (
                                    <SelectItem key={ing.maNL} value={ing.maNL}>{ing.maNL} - {ing.tenNL}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                              {ingredient ? `${getUnitName(ingredient.donViCoBan)} (${ingredient.donViCoBan})` : "-"}
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                value={item.soLuong || ""}
                                onChange={(e) => updateAmount(index, Number(e.target.value) || 0)}
                                className="text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => removeIngredient(index)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {editingDetails.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">Chưa có nguyên liệu trong công thức</td></tr>
                      )}
                    </tbody>
                  </table>

                  <Button variant="outline" onClick={addIngredient} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Thêm nguyên liệu
                  </Button>

                  <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#CFF4FC] p-4">
                    <Info className="h-5 w-5 shrink-0 text-[#055160]" />
                    <div className="space-y-1 text-sm text-[#055160]">
                      <p>Mỗi lần Lưu, hệ thống sẽ tự động tạo một <b>Mã phiên bản mới</b> và đóng phiên bản cũ để phục vụ Kế toán tính giá vốn sau này.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border p-4">
                  <Button variant="outline" onClick={handleCancel}>Hủy thay đổi</Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" /> Cập nhật công thức
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center"><p className="text-muted-foreground">Chọn sản phẩm để xem công thức</p></div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
