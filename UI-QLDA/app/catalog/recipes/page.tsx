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

interface Product {
  MaSP: string;
  TenSP: string;
  GiaHienTai: number;
  IsTopping: boolean;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface Ingredient {
  MaNL: string;
  TenNL: string;
  DonViCoBan: string;
  TonToiThieu: number;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface RecipeVersion {
  MaPB: string;
  MaSP: string;
  NgayHieuLuc: string;
  TrangThai: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface RecipeDetail {
  MaPB: string;
  MaNL: string;
  SoLuong: number;
}

const productStorageKey = "SANPHAM";
const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";
const recipeVersionStorageKey = "PHIENBANCONGTHUC";
const recipeDetailStorageKey = "DINHMUCCONGTHUC";

const initialProducts: Product[] = [
  {
    MaSP: "SP001",
    TenSP: "Cà phê đen đá",
    GiaHienTai: 25000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP002",
    TenSP: "Cà phê sữa đá",
    GiaHienTai: 30000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP003",
    TenSP: "Bạc xỉu",
    GiaHienTai: 35000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP004",
    TenSP: "Trà đào cam sả",
    GiaHienTai: 45000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP005",
    TenSP: "Trà sữa truyền thống",
    GiaHienTai: 40000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SPT01",
    TenSP: "Trân châu đen",
    GiaHienTai: 7000,
    IsTopping: true,
    TrangThai: 1,
  },
];

const initialUnits: Unit[] = [
  { MaDV: "GRAM", TenDonVi: "Gram", TrangThai: 1 },
  { MaDV: "KG", TenDonVi: "Kilogram", TrangThai: 1 },
  { MaDV: "ML", TenDonVi: "Mililít", TrangThai: 1 },
  { MaDV: "LIT", TenDonVi: "Lít", TrangThai: 1 },
  { MaDV: "CAI", TenDonVi: "Cái", TrangThai: 1 },
  { MaDV: "HOP", TenDonVi: "Hộp", TrangThai: 1 },
  { MaDV: "CHAI", TenDonVi: "Chai", TrangThai: 1 },
  { MaDV: "LON", TenDonVi: "Lon", TrangThai: 1 },
  { MaDV: "GOI", TenDonVi: "Gói", TrangThai: 1 },
];

const initialIngredients: Ingredient[] = [
  {
    MaNL: "NL001",
    TenNL: "Cà phê bột",
    DonViCoBan: "GRAM",
    TonToiThieu: 5000,
    TrangThai: 1,
  },
  {
    MaNL: "NL002",
    TenNL: "Sữa tươi",
    DonViCoBan: "ML",
    TonToiThieu: 10000,
    TrangThai: 1,
  },
  {
    MaNL: "NL003",
    TenNL: "Sữa đặc",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
  },
  {
    MaNL: "NL004",
    TenNL: "Đường",
    DonViCoBan: "GRAM",
    TonToiThieu: 5000,
    TrangThai: 1,
  },
  {
    MaNL: "NL005",
    TenNL: "Trà đào",
    DonViCoBan: "GRAM",
    TonToiThieu: 2000,
    TrangThai: 1,
  },
  {
    MaNL: "NL006",
    TenNL: "Siro đào",
    DonViCoBan: "ML",
    TonToiThieu: 2000,
    TrangThai: 1,
  },
  {
    MaNL: "NL007",
    TenNL: "Bột matcha",
    DonViCoBan: "GRAM",
    TonToiThieu: 1000,
    TrangThai: 1,
  },
  {
    MaNL: "NL008",
    TenNL: "Trân châu đen",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
  },
  {
    MaNL: "NL009",
    TenNL: "Kem cheese",
    DonViCoBan: "GRAM",
    TonToiThieu: 1500,
    TrangThai: 1,
  },
];

const initialRecipeVersions: RecipeVersion[] = [
  {
    MaPB: "PB001",
    MaSP: "SP001",
    NgayHieuLuc: "2026-05-23T00:00:00",
    TrangThai: "ACTIVE",
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaPB: "PB002",
    MaSP: "SP002",
    NgayHieuLuc: "2026-05-23T00:00:00",
    TrangThai: "ACTIVE",
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
  {
    MaPB: "PB003",
    MaSP: "SP003",
    NgayHieuLuc: "2026-05-23T00:00:00",
    TrangThai: "ACTIVE",
    CreatedAt: "2026-05-23T00:00:00",
    UpdatedAt: "2026-05-23T00:00:00",
  },
];

const initialRecipeDetails: RecipeDetail[] = [
  { MaPB: "PB001", MaNL: "NL001", SoLuong: 20 },
  { MaPB: "PB001", MaNL: "NL004", SoLuong: 10 },

  { MaPB: "PB002", MaNL: "NL001", SoLuong: 18 },
  { MaPB: "PB002", MaNL: "NL002", SoLuong: 60 },
  { MaPB: "PB002", MaNL: "NL003", SoLuong: 25 },
  { MaPB: "PB002", MaNL: "NL004", SoLuong: 8 },

  { MaPB: "PB003", MaNL: "NL001", SoLuong: 12 },
  { MaPB: "PB003", MaNL: "NL002", SoLuong: 80 },
  { MaPB: "PB003", MaNL: "NL003", SoLuong: 30 },
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatDateTime = (value: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNextCode = (
  prefix: string,
  existingCodes: Array<string | undefined | null>,
) => {
  const maxNumber = existingCodes.reduce((max, code) => {
    if (!code) return max;
    if (!String(code).startsWith(prefix)) return max;

    const number = Number(String(code).replace(prefix, ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
};

const normalizeProduct = (product: Partial<Product>): Product | null => {
  if (!product.MaSP || !product.TenSP) return null;

  return {
    MaSP: product.MaSP,
    TenSP: product.TenSP,
    GiaHienTai: Number(product.GiaHienTai ?? 0),
    IsTopping: Boolean(product.IsTopping),
    TrangThai: Number(product.TrangThai ?? 1),
    CreatedAt: product.CreatedAt,
    UpdatedAt: product.UpdatedAt,
  };
};

const normalizeIngredient = (
  ingredient: Partial<Ingredient>,
): Ingredient | null => {
  if (!ingredient.MaNL || !ingredient.TenNL || !ingredient.DonViCoBan) {
    return null;
  }

  return {
    MaNL: ingredient.MaNL,
    TenNL: ingredient.TenNL,
    DonViCoBan: ingredient.DonViCoBan,
    TonToiThieu: Number(ingredient.TonToiThieu ?? 0),
    TrangThai: Number(ingredient.TrangThai ?? 1),
    CreatedAt: ingredient.CreatedAt,
    UpdatedAt: ingredient.UpdatedAt,
  };
};

const normalizeUnit = (unit: Partial<Unit>): Unit | null => {
  if (!unit.MaDV || !unit.TenDonVi) return null;

  return {
    MaDV: unit.MaDV,
    TenDonVi: unit.TenDonVi,
    TrangThai: Number(unit.TrangThai ?? 1),
    CreatedAt: unit.CreatedAt,
    UpdatedAt: unit.UpdatedAt,
  };
};

const normalizeRecipeVersion = (
  version: Partial<RecipeVersion>,
): RecipeVersion | null => {
  if (!version.MaPB || !version.MaSP) return null;

  return {
    MaPB: version.MaPB,
    MaSP: version.MaSP,
    NgayHieuLuc: version.NgayHieuLuc || new Date().toISOString(),
    TrangThai:
      String(version.TrangThai) === "1" || version.TrangThai === "ACTIVE"
        ? "ACTIVE"
        : "INACTIVE",
    CreatedAt: version.CreatedAt,
    UpdatedAt: version.UpdatedAt,
  };
};

const normalizeRecipeDetail = (
  detail: Partial<RecipeDetail>,
): RecipeDetail | null => {
  if (!detail.MaPB || !detail.MaNL) return null;

  const soLuong = Number(detail.SoLuong);

  if (Number.isNaN(soLuong)) return null;

  return {
    MaPB: detail.MaPB,
    MaNL: detail.MaNL,
    SoLuong: soLuong,
  };
};

export default function RecipesPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [recipeVersions, setRecipeVersions] = useState<RecipeVersion[]>(
    initialRecipeVersions,
  );

  const [recipeDetails, setRecipeDetails] =
    useState<RecipeDetail[]>(initialRecipeDetails);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [recipeFilter, setRecipeFilter] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingDetails, setEditingDetails] = useState<RecipeDetail[]>([]);

  const loadData = () => {
    const storedProducts = getFromStorage<Partial<Product>>(
      productStorageKey,
      [],
    );
    const normalizedProducts = storedProducts
      .map(normalizeProduct)
      .filter((item): item is Product => item !== null);

    if (normalizedProducts.length > 0) {
      setProducts(normalizedProducts);
    } else {
      setProducts(initialProducts);
      saveToStorage(productStorageKey, initialProducts);
    }

    const storedIngredients = getFromStorage<Partial<Ingredient>>(
      ingredientStorageKey,
      [],
    );
    const normalizedIngredients = storedIngredients
      .map(normalizeIngredient)
      .filter((item): item is Ingredient => item !== null);

    if (normalizedIngredients.length > 0) {
      setIngredients(normalizedIngredients);
    } else {
      setIngredients(initialIngredients);
      saveToStorage(ingredientStorageKey, initialIngredients);
    }

    const storedUnits = getFromStorage<Partial<Unit>>(unitStorageKey, []);
    const normalizedUnits = storedUnits
      .map(normalizeUnit)
      .filter((item): item is Unit => item !== null);

    if (normalizedUnits.length > 0) {
      setUnits(normalizedUnits);
    } else {
      setUnits(initialUnits);
      saveToStorage(unitStorageKey, initialUnits);
    }

    const storedRecipeVersions = getFromStorage<Partial<RecipeVersion>>(
      recipeVersionStorageKey,
      [],
    );
    const normalizedRecipeVersions = storedRecipeVersions
      .map(normalizeRecipeVersion)
      .filter((item): item is RecipeVersion => item !== null);

    if (normalizedRecipeVersions.length > 0) {
      setRecipeVersions(normalizedRecipeVersions);
    } else {
      setRecipeVersions(initialRecipeVersions);
      saveToStorage(recipeVersionStorageKey, initialRecipeVersions);
    }

    const storedRecipeDetails = getFromStorage<Partial<RecipeDetail>>(
      recipeDetailStorageKey,
      [],
    );
    const normalizedRecipeDetails = storedRecipeDetails
      .map(normalizeRecipeDetail)
      .filter((item): item is RecipeDetail => item !== null);

    if (normalizedRecipeDetails.length > 0) {
      setRecipeDetails(normalizedRecipeDetails);
    } else {
      setRecipeDetails(initialRecipeDetails);
      saveToStorage(recipeDetailStorageKey, initialRecipeDetails);
    }
  };

  useEffect(() => {
    loadData();

    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
    };
  }, []);

  useEffect(() => {
    const activeProducts = products.filter(
      (product) => product.TrangThai === 1,
    );

    if (!selectedProduct && activeProducts.length > 0) {
      const firstProduct = activeProducts[0];
      setSelectedProduct(firstProduct);
      setEditingDetails(getRecipeDetailsByProduct(firstProduct.MaSP));
    }
  }, [products, selectedProduct]);

  const activeProducts = products.filter((product) => product.TrangThai === 1);

  const activeIngredients = ingredients.filter(
    (ingredient) => ingredient.TrangThai === 1,
  );

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const getIngredient = (MaNL: string) => {
    return ingredients.find((ingredient) => ingredient.MaNL === MaNL);
  };

  const getActiveRecipeVersion = (MaSP: string) => {
    return recipeVersions.find(
      (version) => version.MaSP === MaSP && version.TrangThai === "ACTIVE",
    );
  };

  function getRecipeDetailsByProduct(MaSP: string) {
    const version = getActiveRecipeVersion(MaSP);

    if (!version) return [];

    return recipeDetails.filter((detail) => detail.MaPB === version.MaPB);
  }

  const hasRecipe = (MaSP: string) => {
    return getRecipeDetailsByProduct(MaSP).length > 0;
  };

  const recipeIngredientCount = selectedProduct
    ? getRecipeDetailsByProduct(selectedProduct.MaSP).length
    : 0;

  const productsWithRecipe = activeProducts.filter((product) =>
    hasRecipe(product.MaSP),
  ).length;

  const productsWithoutRecipe = activeProducts.length - productsWithRecipe;

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      const matchesSearch =
        product.MaSP.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.TenSP.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "product" && !product.IsTopping) ||
        (typeFilter === "topping" && product.IsTopping);

      const matchesRecipe =
        recipeFilter === "all" ||
        (recipeFilter === "hasRecipe" && hasRecipe(product.MaSP)) ||
        (recipeFilter === "noRecipe" && !hasRecipe(product.MaSP));

      return matchesSearch && matchesType && matchesRecipe;
    });
  }, [
    activeProducts,
    searchQuery,
    typeFilter,
    recipeFilter,
    recipeVersions,
    recipeDetails,
  ]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditingDetails(getRecipeDetailsByProduct(product.MaSP));
  };

  const addIngredient = () => {
    if (!selectedProduct) return;

    const activeVersion = getActiveRecipeVersion(selectedProduct.MaSP);

    setEditingDetails([
      ...editingDetails,
      {
        MaPB: activeVersion?.MaPB || "",
        MaNL: "",
        SoLuong: 0,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setEditingDetails(editingDetails.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, MaNL: string) => {
    setEditingDetails(
      editingDetails.map((item, i) =>
        i === index
          ? {
              ...item,
              MaNL,
            }
          : item,
      ),
    );
  };

  const updateAmount = (index: number, SoLuong: number) => {
    setEditingDetails(
      editingDetails.map((item, i) =>
        i === index
          ? {
              ...item,
              SoLuong,
            }
          : item,
      ),
    );
  };

  const handleCancel = () => {
    if (!selectedProduct) return;

    setEditingDetails(getRecipeDetailsByProduct(selectedProduct.MaSP));
  };

  const handleSave = () => {
    if (!selectedProduct) return;

    if (editingDetails.length === 0) {
      alert("Vui lòng thêm ít nhất một nguyên liệu vào công thức");
      return;
    }

    const hasInvalidItem = editingDetails.some(
      (item) => !item.MaNL || item.SoLuong <= 0 || Number.isNaN(item.SoLuong),
    );

    if (hasInvalidItem) {
      alert("Vui lòng chọn nguyên liệu và nhập định mức lớn hơn 0");
      return;
    }

    const duplicatedIngredient = editingDetails.some((item, index) =>
      editingDetails.some(
        (otherItem, otherIndex) =>
          otherIndex !== index && otherItem.MaNL === item.MaNL,
      ),
    );

    if (duplicatedIngredient) {
      alert(
        "Một nguyên liệu không được xuất hiện nhiều lần trong cùng công thức",
      );
      return;
    }

    let activeVersion = getActiveRecipeVersion(selectedProduct.MaSP);
    let updatedVersions = [...recipeVersions];

    const now = new Date().toISOString();

    if (!activeVersion) {
      activeVersion = {
        MaPB: getNextCode(
          "PB",
          recipeVersions.map((version) => version.MaPB),
        ),
        MaSP: selectedProduct.MaSP,
        NgayHieuLuc: now,
        TrangThai: "ACTIVE",
        CreatedAt: now,
        UpdatedAt: now,
      };

      updatedVersions = [...updatedVersions, activeVersion];
    } else {
      updatedVersions = updatedVersions.map((version) =>
        version.MaPB === activeVersion?.MaPB
          ? {
              ...version,
              UpdatedAt: now,
            }
          : version,
      );
    }

    const newDetails = editingDetails.map((item) => ({
      MaPB: activeVersion.MaPB,
      MaNL: item.MaNL,
      SoLuong: item.SoLuong,
    }));

    const updatedDetails = [
      ...recipeDetails.filter((detail) => detail.MaPB !== activeVersion.MaPB),
      ...newDetails,
    ];

    setRecipeVersions(updatedVersions);
    setRecipeDetails(updatedDetails);
    setEditingDetails(newDetails);

    saveToStorage(recipeVersionStorageKey, updatedVersions);
    saveToStorage(recipeDetailStorageKey, updatedDetails);

    alert("Lưu công thức thành công");
  };

  const handleCreateNewVersion = () => {
    if (!selectedProduct) return;

    const isConfirmed = confirm(
      "Tạo phiên bản công thức mới sẽ ngưng áp dụng phiên bản hiện tại và tạo phiên bản mới cho sản phẩm này. Bạn muốn tiếp tục?",
    );

    if (!isConfirmed) return;

    const now = new Date().toISOString();

    const oldActiveVersion = getActiveRecipeVersion(selectedProduct.MaSP);

    const newVersion: RecipeVersion = {
      MaPB: getNextCode(
        "PB",
        recipeVersions.map((version) => version.MaPB),
      ),
      MaSP: selectedProduct.MaSP,
      NgayHieuLuc: now,
      TrangThai: "ACTIVE",
      CreatedAt: now,
      UpdatedAt: now,
    };

    const updatedVersions = recipeVersions.map((version) =>
      version.MaSP === selectedProduct.MaSP && version.TrangThai === "ACTIVE"
        ? {
            ...version,
            TrangThai: "INACTIVE",
            UpdatedAt: now,
          }
        : version,
    );

    const copiedDetails = oldActiveVersion
      ? recipeDetails
          .filter((detail) => detail.MaPB === oldActiveVersion.MaPB)
          .map((detail) => ({
            MaPB: newVersion.MaPB,
            MaNL: detail.MaNL,
            SoLuong: detail.SoLuong,
          }))
      : [];

    const finalVersions = [...updatedVersions, newVersion];
    const finalDetails = [...recipeDetails, ...copiedDetails];

    setRecipeVersions(finalVersions);
    setRecipeDetails(finalDetails);
    setEditingDetails(copiedDetails);

    saveToStorage(recipeVersionStorageKey, finalVersions);
    saveToStorage(recipeDetailStorageKey, finalDetails);

    alert("Đã tạo phiên bản công thức mới");
  };

  const activeVersion = selectedProduct
    ? getActiveRecipeVersion(selectedProduct.MaSP)
    : null;

  return (
    <MainLayout
      title="Công thức pha chế"
      breadcrumb="Trang chủ / Danh mục / Công thức"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Sản phẩm đang bán</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {activeProducts.length}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đã có công thức</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">
              {productsWithRecipe}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Chưa có công thức</p>
            <p className="mt-1 text-2xl font-bold text-[#DC3545]">
              {productsWithoutRecipe}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">
              Nguyên liệu trong CT
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {recipeIngredientCount}
            </p>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-270px)] min-h-[520px]">
          <div className="w-[380px] flex-shrink-0 rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="space-y-3 border-b border-border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Tìm mã hoặc tên sản phẩm..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Loại" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="product">Sản phẩm chính</SelectItem>
                    <SelectItem value="topping">Topping</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={recipeFilter} onValueChange={setRecipeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Công thức" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="hasRecipe">Đã có CT</SelectItem>
                    <SelectItem value="noRecipe">Chưa có CT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={loadData}
                >
                  <RefreshCw className="h-4 w-4" />
                  Làm mới
                </Button>
              </div>
            </div>

            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100% - 170px)" }}
            >
              {filteredProducts.map((product) => (
                <button
                  key={product.MaSP}
                  onClick={() => selectProduct(product)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors",
                    selectedProduct?.MaSP === product.MaSP
                      ? "bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-muted/50",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Coffee className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        {product.MaSP}
                      </span>

                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          product.IsTopping
                            ? "bg-[#CFF4FC] text-[#055160]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {product.IsTopping ? "Topping" : "SP chính"}
                      </span>
                    </div>

                    <p className="truncate text-sm font-medium text-foreground">
                      {product.TenSP}
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(product.GiaHienTai)}
                      </span>

                      <span
                        className={cn(
                          "text-xs font-medium",
                          hasRecipe(product.MaSP)
                            ? "text-[#198754]"
                            : "text-[#DC3545]",
                        )}
                      >
                        {hasRecipe(product.MaSP) ? "Đã có CT" : "Chưa có CT"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredProducts.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Không có sản phẩm phù hợp
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            {selectedProduct ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-border p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                        <Coffee className="h-8 w-8 text-muted-foreground" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">
                            {selectedProduct.MaSP}
                          </span>

                          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {selectedProduct.IsTopping
                              ? "Topping"
                              : "Sản phẩm chính"}
                          </span>
                        </div>

                        <h2 className="text-xl font-semibold text-foreground">
                          {selectedProduct.TenSP}
                        </h2>

                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-sm font-semibold text-primary">
                            {formatCurrency(selectedProduct.GiaHienTai)}
                          </span>

                          {activeVersion ? (
                            <span className="text-sm text-muted-foreground">
                              Phiên bản:{" "}
                              <span className="font-medium text-foreground">
                                {activeVersion.MaPB}
                              </span>{" "}
                              · Hiệu lực:{" "}
                              {formatDateTime(activeVersion.NgayHieuLuc)}
                            </span>
                          ) : (
                            <span className="text-sm text-[#DC3545]">
                              Chưa có phiên bản công thức
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={handleCreateNewVersion}
                    >
                      <FileText className="h-4 w-4" />
                      Tạo phiên bản mới
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nguyên liệu
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Đơn vị
                        </th>

                        <th className="w-40 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Định mức
                        </th>

                        <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {editingDetails.map((item, index) => {
                        const ingredient = getIngredient(item.MaNL);

                        return (
                          <tr
                            key={`${item.MaPB || "new"}-${item.MaNL}-${index}`}
                            className="hover:bg-muted/50"
                          >
                            <td className="px-4 py-3">
                              <Select
                                value={item.MaNL}
                                onValueChange={(value) =>
                                  updateIngredient(index, value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn nguyên liệu" />
                                </SelectTrigger>

                                <SelectContent>
                                  {activeIngredients.map((ingredient) => (
                                    <SelectItem
                                      key={ingredient.MaNL}
                                      value={ingredient.MaNL}
                                    >
                                      {ingredient.MaNL} - {ingredient.TenNL}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>

                            <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                              {ingredient
                                ? `${getUnitName(ingredient.DonViCoBan)} (${ingredient.DonViCoBan})`
                                : "-"}
                            </td>

                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={0}
                                value={item.SoLuong || ""}
                                onChange={(event) =>
                                  updateAmount(
                                    index,
                                    Number(event.target.value) || 0,
                                  )
                                }
                                className="text-center"
                              />
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => removeIngredient(index)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {editingDetails.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                          >
                            Sản phẩm này chưa có nguyên liệu trong công thức
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <Button
                    variant="outline"
                    onClick={addIngredient}
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm nguyên liệu vào công thức
                  </Button>

                  <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#CFF4FC] p-4">
                    <Info className="h-5 w-5 shrink-0 text-[#055160]" />

                    <div className="space-y-1 text-sm text-[#055160]">
                      {/* <p>
                        Công thức dùng bảng{" "}
                        <span className="font-semibold">PHIENBANCONGTHUC</span>{" "}
                        và{" "}
                        <span className="font-semibold">DINHMUCCONGTHUC</span>.
                      </p> */}

                      {/* <p>
                        Định mức này sẽ được dùng để tự động trừ kho khi bán sản
                        phẩm ở POS sau này.
                      </p> */}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-border p-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Hủy thay đổi
                  </Button>

                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" />
                    Lưu công thức
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  Chọn sản phẩm để xem công thức
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
