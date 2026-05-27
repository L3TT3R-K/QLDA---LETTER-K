"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductGrid } from "@/components/pos/product-grid";
import { OrderPanel } from "@/components/pos/order-panel";
import { AlertTriangle, WifiOff } from "lucide-react";
import api from "@/services/api";
import { getCurrentUser } from "@/lib/auth";

export interface Product {
  MaSP: string;
  TenSP: string;
  GiaHienTai: number;
  IsTopping: boolean;
  TrangThai: number;
}

export interface ProductForPOS extends Product {
  Category: string;
}

export interface OrderItem {
  MaSP: string;
  TenSP: string;
  GiaBanTaiThoiDiem: number;
  SoLuong: number;
  IsTopping: boolean;
  GhiChu: string;
}

type PaymentMethod = "cash" | "transfer";

interface HoaDonRequest {
  maCN: string;
  maCa: string;
  giamGia: number;
  danhSachMon: {
    maSP: string;
    soLuong: number;
    ghiChu: string;
  }[];
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

interface ChiTietHoaDonResponse {
  maHD: string;
  tenChiNhanh: string;
  tongTien: number | string;
  trangThai: number;
}

interface ThanhToanResponse {
  maTT: string;
  maHD: string;
  soTien: number | string;
  phuongThuc: string;
  message: string;
}

interface ProductApiDto {
  maSP?: string;
  tenSP?: string;
  giaHienTai?: number | string;
  isTopping?: boolean;
  trangThai?: number;
  MaSP?: string;
  TenSP?: string;
  GiaHienTai?: number | string;
  IsTopping?: boolean;
  TrangThai?: number;
}

interface CaLamViecApiDto {
  maCa?: string;
  maNV?: string;
  maCN?: string;
  thoiGianMo?: string;
  thoiGianDong?: string | null;
  MaCa?: string;
  MaNV?: string;
  MaCN?: string;
  ThoiGianMo?: string;
  ThoiGianDong?: string | null;
}

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
    MaSP: "SP006",
    TenSP: "Matcha đá xay",
    GiaHienTai: 55000,
    IsTopping: false,
    TrangThai: 1,
  },
  {
    MaSP: "SP007",
    TenSP: "Bánh tiramisu",
    GiaHienTai: 45000,
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
  {
    MaSP: "SPT02",
    TenSP: "Kem cheese",
    GiaHienTai: 10000,
    IsTopping: true,
    TrangThai: 1,
  },
  {
    MaSP: "SPT03",
    TenSP: "Thạch cà phê",
    GiaHienTai: 8000,
    IsTopping: true,
    TrangThai: 1,
  },
];

const getProductCategory = (product: Product) => {
  if (product.IsTopping) return "Topping";

  const name = product.TenSP.toLowerCase();

  if (name.includes("cà phê") || name.includes("bạc xỉu")) return "Cà phê";
  if (name.includes("trà")) return "Trà";
  if (name.includes("matcha") || name.includes("đá xay")) return "Đá xay";
  if (name.includes("bánh")) return "Bánh";

  return "Khác";
};

const normalizeProduct = (product: ProductApiDto): Product | null => {
  const MaSP = product.MaSP ?? product.maSP;
  const TenSP = product.TenSP ?? product.tenSP;
  const GiaHienTai = Number(product.GiaHienTai ?? product.giaHienTai);

  if (!MaSP || !TenSP || Number.isNaN(GiaHienTai)) return null;

  return {
    MaSP,
    TenSP,
    GiaHienTai,
    IsTopping: Boolean(product.IsTopping ?? product.isTopping),
    TrangThai: Number(product.TrangThai ?? product.trangThai ?? 1),
  };
};

const mapPaymentMethod = (method: PaymentMethod) => {
  return method === "cash" ? "TIEN_MAT" : "CHUYEN_KHOAN";
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingShiftContext, setIsLoadingShiftContext] = useState(true);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [shiftContextError, setShiftContextError] = useState<string | null>(
    null,
  );
  const [productError, setProductError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string>("");
  const [currentShift, setCurrentShift] = useState<string>("");

  const apiError = checkoutError ?? shiftContextError ?? productError;

  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);

    handleOnlineStatus();
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const resolveShiftContext = async () => {
      setIsLoadingShiftContext(true);

      try {
        const user = getCurrentUser();

        if (!user) {
          setShiftContextError(
            "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.",
          );
          return;
        }

        const userBranch = user.maCN || "";
        const userMaNV = user.maNV;

        if (!userBranch) {
          setShiftContextError(
            "Tài khoản chưa được gán chi nhánh, chưa thể bán hàng POS.",
          );
          return;
        }

        setCurrentBranch(userBranch);

        const caLamViecRes = await api.get<CaLamViecApiDto[]>("/api/calamviec");
        const dsCa = Array.isArray(caLamViecRes.data) ? caLamViecRes.data : [];

        const dsCaDangMo = dsCa.filter((ca) => {
          const thoiGianDong = ca.thoiGianDong ?? ca.ThoiGianDong;
          return !thoiGianDong;
        });

        const normalizeTime = (value?: string) => {
          if (!value) return 0;
          const time = new Date(value).getTime();
          return Number.isNaN(time) ? 0 : time;
        };

        const caCuaNhanVien = dsCaDangMo
          .filter((ca) => {
            const maNV = ca.maNV ?? ca.MaNV;
            const maCN = ca.maCN ?? ca.MaCN;
            return maNV === userMaNV && maCN === userBranch;
          })
          .sort(
            (a, b) =>
              normalizeTime(b.thoiGianMo ?? b.ThoiGianMo) -
              normalizeTime(a.thoiGianMo ?? a.ThoiGianMo),
          );

        const caTheoChiNhanh = dsCaDangMo
          .filter((ca) => (ca.maCN ?? ca.MaCN) === userBranch)
          .sort(
            (a, b) =>
              normalizeTime(b.thoiGianMo ?? b.ThoiGianMo) -
              normalizeTime(a.thoiGianMo ?? a.ThoiGianMo),
          );

        const caDangMo = caCuaNhanVien[0] ?? caTheoChiNhanh[0];
        const maCaDangMo = caDangMo ? caDangMo.maCa ?? caDangMo.MaCa : "";

        if (!maCaDangMo) {
          setShiftContextError("Không tìm thấy ca đang mở cho chi nhánh hiện tại.");
          return;
        }

        setCurrentShift(maCaDangMo);
        setShiftContextError(null);
      } catch {
        setShiftContextError("Không thể lấy thông tin ca làm việc đang mở.");
      } finally {
        setIsLoadingShiftContext(false);
      }
    };

    resolveShiftContext();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);

      try {
        const [allRes, activeRes, toppingRes, nonToppingRes] = await Promise.all([
          api.get<ProductApiDto[]>("/api/sanpham"),
          api.get<ProductApiDto[]>("/api/sanpham/trangthai/1"),
          api.get<ProductApiDto[]>("/api/sanpham/topping/true"),
          api.get<ProductApiDto[]>("/api/sanpham/topping/false"),
        ]);

        const mergedProducts = [
          ...allRes.data,
          ...activeRes.data,
          ...toppingRes.data,
          ...nonToppingRes.data,
        ];

        const uniqueMap = new Map<string, Product>();

        mergedProducts.forEach((item) => {
          const normalized = normalizeProduct(item);

          if (normalized && normalized.TrangThai === 1) {
            uniqueMap.set(normalized.MaSP, normalized);
          }
        });

        if (uniqueMap.size > 0) {
          setProducts(Array.from(uniqueMap.values()));
        }
      } catch (error) {
        try {
          const allProductsRes = await api.get<ProductApiDto[]>("/api/sanpham");
          const fallbackProducts = allProductsRes.data
            .map(normalizeProduct)
            .filter((item): item is Product => item !== null)
            .filter((item) => item.TrangThai === 1);

          if (fallbackProducts.length > 0) {
            setProducts(fallbackProducts);
            return;
          }
        } catch {
          setProductError("Không thể tải danh sách sản phẩm từ hệ thống.");
        }

        console.error("Không tải được sản phẩm", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const activeProducts = useMemo<ProductForPOS[]>(() => {
    return products
      .filter((product) => product.TrangThai === 1)
      .map((product) => ({
        ...product,
        Category: getProductCategory(product),
      }));
  }, [products]);

  const addToOrderState = (product: ProductForPOS) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.MaSP === product.MaSP);

      if (existing) {
        return prev.map((item) =>
          item.MaSP === product.MaSP
            ? {
                ...item,
                SoLuong: item.SoLuong + 1,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          MaSP: product.MaSP,
          TenSP: product.TenSP,
          GiaBanTaiThoiDiem: product.GiaHienTai,
          SoLuong: 1,
          IsTopping: product.IsTopping,
          GhiChu: "",
        },
      ];
    });
  };

  const addToOrder = async (product: ProductForPOS) => {
    try {
      const detailRes = await api.get<ProductApiDto>(`/api/sanpham/${product.MaSP}`);
      const normalized = normalizeProduct(detailRes.data);

      if (normalized) {
        addToOrderState({
          ...normalized,
          Category: getProductCategory(normalized),
        });
        return;
      }
    } catch {
      // Nếu API chi tiết lỗi, vẫn cho phép thêm món từ danh sách hiện tại.
    }

    addToOrderState(product);
  };

  const updateQuantity = (MaSP: string, SoLuong: number) => {
    if (SoLuong <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.MaSP !== MaSP));
      return;
    }

    setOrderItems((prev) =>
      prev.map((item) =>
        item.MaSP === MaSP
          ? {
              ...item,
              SoLuong,
            }
          : item,
      ),
    );
  };

  const updateNote = (MaSP: string, GhiChu: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.MaSP === MaSP
          ? {
              ...item,
              GhiChu,
            }
          : item,
      ),
    );
  };

  const removeItem = (MaSP: string) => {
    setOrderItems((prev) => prev.filter((item) => item.MaSP !== MaSP));
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const handleCheckout = async (
    paymentMethod: PaymentMethod,
    giamGia: number,
  ) => {
    if (!currentBranch) {
      alert("Không xác định được chi nhánh đăng nhập hiện tại.");
      return;
    }

    if (!currentShift) {
      alert("Chưa có ca làm việc đang mở. Vui lòng mở ca trước khi thanh toán.");
      return;
    }

    if (orderItems.length === 0) {
      alert("Vui lòng chọn sản phẩm trước khi thanh toán");
      return;
    }

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.GiaBanTaiThoiDiem * item.SoLuong,
      0,
    );

    const finalDiscount = Math.min(Math.max(giamGia, 0), subtotal);
    const total = subtotal - finalDiscount;

    if (total <= 0) {
      alert("Tổng tiền phải lớn hơn 0");
      return;
    }

    setIsSubmittingCheckout(true);
    setCheckoutError(null);

    try {
      const hoaDonRequest: HoaDonRequest = {
        maCN: currentBranch,
        maCa: currentShift,
        giamGia: finalDiscount,
        danhSachMon: orderItems.map((item) => ({
          maSP: item.MaSP,
          soLuong: item.SoLuong,
          ghiChu: item.GhiChu,
        })),
      };

      const taoHoaDonRes = await api.post<ApiResponse<ChiTietHoaDonResponse>>(
        "/api/hoadon",
        hoaDonRequest,
      );

      const maHD = taoHoaDonRes.data?.data?.maHD;

      if (!maHD) {
        throw new Error("Không nhận được mã hóa đơn từ hệ thống");
      }

      const chiTietHoaDonRes = await api.get<ApiResponse<ChiTietHoaDonResponse>>(
        `/api/hoadon/${maHD}`,
      );

      const soTienThanhToan = Number(
        chiTietHoaDonRes.data?.data?.tongTien ?? taoHoaDonRes.data?.data?.tongTien,
      );

      if (Number.isNaN(soTienThanhToan) || soTienThanhToan <= 0) {
        throw new Error("Tổng tiền hóa đơn không hợp lệ");
      }

      const thanhToanRes = await api.post<ApiResponse<ThanhToanResponse>>(
        "/api/thanhtoan",
        {
          maHD,
          phuongThuc: mapPaymentMethod(paymentMethod),
          soTien: soTienThanhToan,
        },
      );

      if (!thanhToanRes.data || thanhToanRes.data.status !== 200) {
        throw new Error(thanhToanRes.data?.message || "Thanh toán thất bại");
      }

      alert(`Thanh toán thành công hóa đơn ${maHD}`);
      clearOrder();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể hoàn tất thanh toán. Vui lòng thử lại.";

      setCheckoutError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  return (
    <MainLayout title="POS Bán hàng" breadcrumb="Trang chủ / POS Bán hàng">
      {isOffline && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#FFF3CD] px-4 py-3 text-sm text-[#856404]">
          <WifiOff className="h-4 w-4" />
          <AlertTriangle className="h-4 w-4" />

          <span className="font-medium">
            Đang offline — Hóa đơn sẽ được đồng bộ khi có mạng
          </span>
        </div>
      )}

      {apiError && (
        <div className="mb-4 rounded-lg bg-[#F8D7DA] px-4 py-3 text-sm text-[#842029]">
          {apiError}
        </div>
      )}

      <div className="mb-4 rounded-lg bg-card px-4 py-3 text-sm text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        Chi nhánh hiện tại:{" "}
        <span className="font-semibold text-foreground">
          {currentBranch || "Chưa xác định"}
        </span>
        {" · "}
        Ca làm việc:{" "}
        <span className="font-semibold text-foreground">
          {isLoadingShiftContext
            ? "Đang tải ca..."
            : currentShift || "Chưa có ca đang mở"}
        </span>
        {" · "}
        Trạng thái dữ liệu:{" "}
        <span className="font-semibold text-foreground">
          {isLoadingProducts ? "Đang tải sản phẩm..." : "Đã đồng bộ API"}
        </span>
      </div>

      <div className="flex h-[calc(100vh-230px)] gap-6">
        <div className="flex-1 overflow-hidden">
          <ProductGrid products={activeProducts} onAddProduct={addToOrder} />
        </div>

        <div className="w-[420px] flex-shrink-0">
          <OrderPanel
            items={orderItems}
            onUpdateQuantity={updateQuantity}
            onUpdateNote={updateNote}
            onRemoveItem={removeItem}
            onClearOrder={clearOrder}
            onCheckout={handleCheckout}
            isProcessingCheckout={isSubmittingCheckout}
          />
        </div>
      </div>
    </MainLayout>
  );
}
