"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductGrid } from "@/components/pos/product-grid";
import { OrderPanel } from "@/components/pos/order-panel";
import { AlertTriangle, WifiOff } from "lucide-react";

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

interface Invoice {
  MaHD: string;
  MaCa: string;
  MaCN: string;
  TongTien: number;
  GiamGia: number;
  TrangThai: number;
  IsSynced?: boolean;
  CreatedAt?: string;
}

interface InvoiceDetail {
  Id: string;
  MaHD: string;
  MaSP: string;
  SoLuong: number;
  GiaBanTaiThoiDiem: number;
  GhiChu?: string;
}

interface Payment {
  MaTT: string;
  MaHD: string;
  PhuongThuc: PaymentMethod;
  SoTien: number;
  TrangThai: number;
  CreatedAt: string;
  IsSynced?: boolean;
}

interface SyncLog {
  MaLog: string;
  ThucThe: string;
  RecordId: string;
  HanhDong: string;
  TrangThai: number;
  CreatedAt: string;
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

const initialInvoices: Invoice[] = [
  {
    MaHD: "HD001",
    MaCa: "CA001",
    MaCN: "CN01",
    TongTien: 74000,
    GiamGia: 0,
    TrangThai: 2,
  },
  {
    MaHD: "HD002",
    MaCa: "CA002",
    MaCN: "CN02",
    TongTien: 70000,
    GiamGia: 0,
    TrangThai: 2,
  },
];

const initialInvoiceDetails: InvoiceDetail[] = [
  {
    Id: "CTHD001",
    MaHD: "HD001",
    MaSP: "SP002",
    SoLuong: 2,
    GiaBanTaiThoiDiem: 30000,
    GhiChu: "",
  },
  {
    Id: "CTHD002",
    MaHD: "HD001",
    MaSP: "SPT01",
    SoLuong: 2,
    GiaBanTaiThoiDiem: 7000,
    GhiChu: "",
  },
  {
    Id: "CTHD003",
    MaHD: "HD002",
    MaSP: "SP001",
    SoLuong: 1,
    GiaBanTaiThoiDiem: 25000,
    GhiChu: "",
  },
  {
    Id: "CTHD004",
    MaHD: "HD002",
    MaSP: "SP004",
    SoLuong: 1,
    GiaBanTaiThoiDiem: 45000,
    GhiChu: "",
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

const getMaxCodeNumber = (
  prefix: string,
  existingCodes: Array<string | undefined | null>,
) => {
  return existingCodes.reduce((max, code) => {
    if (!code) return max;

    const text = String(code);

    if (!text.startsWith(prefix)) return max;

    const number = Number(text.replace(prefix, ""));

    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
};

const getNextCode = (
  prefix: string,
  existingCodes: Array<string | undefined | null>,
) => {
  const maxNumber = getMaxCodeNumber(prefix, existingCodes);

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
};

const getProductCategory = (product: Product) => {
  if (product.IsTopping) return "Topping";

  const name = product.TenSP.toLowerCase();

  if (name.includes("cà phê") || name.includes("bạc xỉu")) return "Cà phê";
  if (name.includes("trà")) return "Trà";
  if (name.includes("matcha") || name.includes("đá xay")) return "Đá xay";
  if (name.includes("bánh")) return "Bánh";

  return "Khác";
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
  };
};

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOffline] = useState(true);

  const currentBranch = "CN01";
  const currentShift = "CA001";

  useEffect(() => {
    const storedProducts = getFromStorage<Partial<Product>>("SANPHAM", []);

    if (storedProducts.length > 0) {
      const normalizedProducts = storedProducts
        .map(normalizeProduct)
        .filter((item): item is Product => item !== null);

      if (normalizedProducts.length > 0) {
        setProducts(normalizedProducts);
      }
    }
  }, []);

  const activeProducts = useMemo<ProductForPOS[]>(() => {
    return products
      .filter((product) => product.TrangThai === 1)
      .map((product) => ({
        ...product,
        Category: getProductCategory(product),
      }));
  }, [products]);

  const addToOrder = (product: ProductForPOS) => {
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

  const handleCheckout = (paymentMethod: PaymentMethod, giamGia: number) => {
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

    console.log("HoaDonRequest sau này gửi lên backend:", hoaDonRequest);

    const now = new Date().toISOString();

    const storedInvoices = getFromStorage<Partial<Invoice>>("HOADON", []);
    const storedInvoiceDetails = getFromStorage<Partial<InvoiceDetail>>(
      "CTHD",
      [],
    );
    const storedPayments = getFromStorage<Partial<Payment>>("THANHTOAN", []);
    const storedSyncLogs = getFromStorage<Partial<SyncLog>>("SYNCLOG", []);

    const allInvoiceCodes = [
      ...initialInvoices.map((invoice) => invoice.MaHD),
      ...storedInvoices.map((invoice) => invoice.MaHD),
    ];

    const allDetailCodes = [
      ...initialInvoiceDetails.map((detail) => detail.Id),
      ...storedInvoiceDetails.map((detail) => detail.Id),
    ];

    const allPaymentCodes = storedPayments.map((payment) => payment.MaTT);
    const allSyncLogCodes = storedSyncLogs.map((log) => log.MaLog);

    const MaHD = getNextCode("HD", allInvoiceCodes);
    const firstDetailNumber = getMaxCodeNumber("CTHD", allDetailCodes) + 1;

    const newInvoice: Invoice = {
      MaHD,
      MaCa: currentShift,
      MaCN: currentBranch,
      TongTien: total,
      GiamGia: finalDiscount,
      TrangThai: 2,
      IsSynced: !isOffline,
      CreatedAt: now,
    };

    const newInvoiceDetails: InvoiceDetail[] = orderItems.map(
      (item, index) => ({
        Id: `CTHD${String(firstDetailNumber + index).padStart(3, "0")}`,
        MaHD,
        MaSP: item.MaSP,
        SoLuong: item.SoLuong,
        GiaBanTaiThoiDiem: item.GiaBanTaiThoiDiem,
        GhiChu: item.GhiChu,
      }),
    );

    const newPayment: Payment = {
      MaTT: getNextCode("TT", allPaymentCodes),
      MaHD,
      PhuongThuc: paymentMethod,
      SoTien: total,
      TrangThai: 2,
      CreatedAt: now,
      IsSynced: !isOffline,
    };

    saveToStorage("HOADON", [...storedInvoices, newInvoice]);
    saveToStorage("CTHD", [...storedInvoiceDetails, ...newInvoiceDetails]);
    saveToStorage("THANHTOAN", [...storedPayments, newPayment]);

    if (isOffline) {
      const newSyncLog: SyncLog = {
        MaLog: getNextCode("SYNC", allSyncLogCodes),
        ThucThe: "HOADON",
        RecordId: MaHD,
        HanhDong: "CREATE",
        TrangThai: 0,
        CreatedAt: now,
      };

      saveToStorage("SYNCLOG", [...storedSyncLogs, newSyncLog]);
    }

    alert(`Thanh toán thành công hóa đơn ${MaHD}`);

    clearOrder();
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

      <div className="mb-4 rounded-lg bg-card px-4 py-3 text-sm text-muted-foreground shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        Chi nhánh hiện tại:{" "}
        <span className="font-semibold text-foreground">CN01</span>
        {" · "}
        Ca làm việc:{" "}
        <span className="font-semibold text-foreground">CA001</span>
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
          />
        </div>
      </div>
    </MainLayout>
  );
}
