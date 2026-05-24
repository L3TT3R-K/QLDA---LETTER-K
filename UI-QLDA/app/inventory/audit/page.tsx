"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Search,
  Plus,
  Download,
  X,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AuditReceipt {
  MaKK: string;
  MaCN: string;
  MaNV: string;
  NgayKiem: string;
  TrangThai: string;
  IsSynced: boolean;
  CreatedAt: string;
  UpdatedAt?: string;
}

interface AuditDetail {
  MaKK: string;
  MaNL: string;
  SoLuongHeThong: number;
  SoLuongThucTe: number;
  ChenhLech: number;
  GhiChu?: string;
}

interface AuditFormItem {
  MaNL: string;
  SoLuongHeThong: number;
  SoLuongThucTe: number;
  GhiChu: string;
}

interface InventoryStock {
  MaCN: string;
  MaNL: string;
  SoLuongTon: number;
  UpdatedAt?: string;
}

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

interface Employee {
  MaNV: string;
  Username?: string;
  PasswordHash?: string;
  TenNV: string;
  ChucVu?: string;
  MaCN: string | null;
  TrangThai: number;
}

interface Unit {
  MaDV: string;
  TenDonVi: string;
  TrangThai: number;
}

interface Ingredient {
  MaNL: string;
  TenNL: string;
  DonViCoBan: string;
  TonToiThieu: number;
  TrangThai: number;
}

const receiptStorageKey = "KIEMKHO";
const detailStorageKey = "CTKK";
const inventoryStorageKey = "TONKHO";
const branchStorageKey = "CHINHANH";
const employeeStorageKey = "NHANVIEN";
const ingredientStorageKey = "NGUYENLIEU";
const unitStorageKey = "DONVI";

const statusConfig = {
  COMPLETED: {
    label: "Hoàn tất",
    className: "bg-[#D1E7DD] text-[#198754]",
  },
};

const initialBranches: Branch[] = [
  {
    MaCN: "CN01",
    TenCN: "Phụng Lộc Coffee - Quận 1",
    DiaChi: "12 Nguyễn Huệ, Quận 1, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN02",
    TenCN: "Phụng Lộc Coffee - Quận 3",
    DiaChi: "25 Võ Văn Tần, Quận 3, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN03",
    TenCN: "Phụng Lộc Coffee - Bình Thạnh",
    DiaChi: "88 Xô Viết Nghệ Tĩnh, Bình Thạnh, TP.HCM",
    TrangThai: 1,
  },
];

const initialEmployees: Employee[] = [
  {
    MaNV: "NV001",
    Username: "admin",
    PasswordHash: "123456",
    TenNV: "Nguyễn Văn An",
    ChucVu: "ADMIN",
    MaCN: null,
    TrangThai: 1,
  },
  {
    MaNV: "NV003",
    Username: "cuonglv",
    PasswordHash: "123456",
    TenNV: "Lê Văn Cường",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV005",
    Username: "emhv",
    PasswordHash: "123456",
    TenNV: "Hoàng Văn Em",
    ChucVu: "NHANVIEN_KHO",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV007",
    Username: "khangvv",
    PasswordHash: "123456",
    TenNV: "Võ Văn Khang",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN02",
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
    MaNL: "NL008",
    TenNL: "Trân châu đen",
    DonViCoBan: "GRAM",
    TonToiThieu: 3000,
    TrangThai: 1,
  },
];

const initialInventory: InventoryStock[] = [
  { MaCN: "CN01", MaNL: "NL001", SoLuongTon: 25000 },
  { MaCN: "CN01", MaNL: "NL002", SoLuongTon: 45000 },
  { MaCN: "CN01", MaNL: "NL003", SoLuongTon: 8000 },
  { MaCN: "CN01", MaNL: "NL004", SoLuongTon: 12000 },
  { MaCN: "CN01", MaNL: "NL008", SoLuongTon: 2500 },
  { MaCN: "CN02", MaNL: "NL001", SoLuongTon: 18000 },
  { MaCN: "CN02", MaNL: "NL002", SoLuongTon: 9000 },
];

const initialReceipts: AuditReceipt[] = [
  {
    MaKK: "KK001",
    MaCN: "CN01",
    MaNV: "NV005",
    NgayKiem: "2026-05-23T10:00",
    TrangThai: "COMPLETED",
    IsSynced: false,
    CreatedAt: "2026-05-23T10:00:00",
    UpdatedAt: "2026-05-23T10:00:00",
  },
];

const initialDetails: AuditDetail[] = [
  {
    MaKK: "KK001",
    MaNL: "NL001",
    SoLuongHeThong: 25000,
    SoLuongThucTe: 25000,
    ChenhLech: 0,
    GhiChu: "",
  },
  {
    MaKK: "KK001",
    MaNL: "NL002",
    SoLuongHeThong: 45000,
    SoLuongThucTe: 44000,
    ChenhLech: -1000,
    GhiChu: "Thiếu 1000 ml",
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

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const formatDateTime = (value: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toInputDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
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

const mergeInventoryStocks = (stocks: InventoryStock[]) => {
  const stockMap = new Map<string, InventoryStock>();

  stocks.forEach((stock) => {
    const key = `${stock.MaCN}-${stock.MaNL}`;
    const oldStock = stockMap.get(key);

    if (oldStock) {
      stockMap.set(key, {
        ...oldStock,
        SoLuongTon: oldStock.SoLuongTon + stock.SoLuongTon,
        UpdatedAt: stock.UpdatedAt || oldStock.UpdatedAt,
      });
    } else {
      stockMap.set(key, stock);
    }
  });

  return Array.from(stockMap.values());
};

const downloadCsv = (
  fileName: string,
  headers: string[],
  rows: unknown[][],
) => {
  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};

export default function InventoryAuditPage() {
  const [receipts, setReceipts] = useState<AuditReceipt[]>(initialReceipts);
  const [details, setDetails] = useState<AuditDetail[]>(initialDetails);
  const [inventory, setInventory] =
    useState<InventoryStock[]>(initialInventory);

  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [ingredients, setIngredients] =
    useState<Ingredient[]>(initialIngredients);
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("CN01");
  const [selectedEmployee, setSelectedEmployee] = useState("NV005");
  const [auditDate, setAuditDate] = useState(toInputDateTime(new Date()));
  const [auditItems, setAuditItems] = useState<AuditFormItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = () => {
    const storedBranches = getFromStorage<Branch>(
      branchStorageKey,
      initialBranches,
    );
    const storedEmployees = getFromStorage<Employee>(
      employeeStorageKey,
      initialEmployees,
    );
    const storedIngredients = getFromStorage<Ingredient>(
      ingredientStorageKey,
      initialIngredients,
    );
    const storedUnits = getFromStorage<Unit>(unitStorageKey, initialUnits);
    const storedReceipts = getFromStorage<AuditReceipt>(
      receiptStorageKey,
      initialReceipts,
    );
    const storedDetails = getFromStorage<AuditDetail>(
      detailStorageKey,
      initialDetails,
    );
    const storedInventory = getFromStorage<InventoryStock>(
      inventoryStorageKey,
      initialInventory,
    );

    setBranches(storedBranches);
    setEmployees(storedEmployees);
    setIngredients(storedIngredients);
    setUnits(storedUnits);
    setReceipts(storedReceipts);
    setDetails(storedDetails);
    setInventory(mergeInventoryStocks(storedInventory));

    if (!localStorage.getItem(branchStorageKey)) {
      saveToStorage(branchStorageKey, initialBranches);
    }

    if (!localStorage.getItem(employeeStorageKey)) {
      saveToStorage(employeeStorageKey, initialEmployees);
    }

    if (!localStorage.getItem(ingredientStorageKey)) {
      saveToStorage(ingredientStorageKey, initialIngredients);
    }

    if (!localStorage.getItem(unitStorageKey)) {
      saveToStorage(unitStorageKey, initialUnits);
    }

    if (!localStorage.getItem(receiptStorageKey)) {
      saveToStorage(receiptStorageKey, initialReceipts);
    }

    if (!localStorage.getItem(detailStorageKey)) {
      saveToStorage(detailStorageKey, initialDetails);
    }

    if (!localStorage.getItem(inventoryStorageKey)) {
      saveToStorage(
        inventoryStorageKey,
        mergeInventoryStocks(initialInventory),
      );
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
    setCurrentPage(1);
  }, [searchQuery, branchFilter]);

  useEffect(() => {
    const employee = employees.find(
      (item) =>
        item.MaNV === selectedEmployee &&
        item.TrangThai === 1 &&
        (item.MaCN === selectedBranch || item.MaCN === null),
    );

    if (!employee) {
      const firstEmployee = employees.find(
        (item) =>
          item.TrangThai === 1 &&
          (item.MaCN === selectedBranch || item.MaCN === null),
      );

      if (firstEmployee) {
        setSelectedEmployee(firstEmployee.MaNV);
      }
    }
  }, [selectedBranch, selectedEmployee, employees]);

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);

  const activeEmployees = employees.filter(
    (employee) =>
      employee.TrangThai === 1 &&
      (employee.MaCN === selectedBranch || employee.MaCN === null),
  );

  const nextReceiptCode = useMemo(() => {
    return getNextCode(
      "KK",
      receipts.map((receipt) => receipt.MaKK),
    );
  }, [receipts]);

  const getBranchName = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const getEmployeeName = (MaNV: string) => {
    return employees.find((employee) => employee.MaNV === MaNV)?.TenNV || MaNV;
  };

  const getIngredient = (MaNL: string) => {
    return ingredients.find((ingredient) => ingredient.MaNL === MaNL);
  };

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const buildAuditItemsByBranch = (MaCN: string) => {
    return inventory
      .filter((stock) => stock.MaCN === MaCN)
      .map((stock) => ({
        MaNL: stock.MaNL,
        SoLuongHeThong: stock.SoLuongTon,
        SoLuongThucTe: stock.SoLuongTon,
        GhiChu: "",
      }));
  };

  const resetForm = () => {
    const defaultBranch = activeBranches[0]?.MaCN || "CN01";

    setSelectedBranch(defaultBranch);
    setSelectedEmployee(activeEmployees[0]?.MaNV || "NV005");
    setAuditDate(toInputDateTime(new Date()));
    setAuditItems(buildAuditItemsByBranch(defaultBranch));
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const handleChangeBranch = (MaCN: string) => {
    setSelectedBranch(MaCN);
    setAuditItems(buildAuditItemsByBranch(MaCN));
  };

  const updateActualStock = (MaNL: string, value: number) => {
    setAuditItems(
      auditItems.map((item) =>
        item.MaNL === MaNL
          ? {
              ...item,
              SoLuongThucTe: value,
            }
          : item,
      ),
    );
  };

  const updateNote = (MaNL: string, GhiChu: string) => {
    setAuditItems(
      auditItems.map((item) =>
        item.MaNL === MaNL
          ? {
              ...item,
              GhiChu,
            }
          : item,
      ),
    );
  };

  const updateInventoryAfterAudit = (
    currentInventory: InventoryStock[],
    items: AuditFormItem[],
    MaCN: string,
  ) => {
    const updatedInventory = [...currentInventory];

    items.forEach((item) => {
      const index = updatedInventory.findIndex(
        (stock) => stock.MaCN === MaCN && stock.MaNL === item.MaNL,
      );

      if (index >= 0) {
        updatedInventory[index] = {
          ...updatedInventory[index],
          SoLuongTon: item.SoLuongThucTe,
          UpdatedAt: new Date().toISOString(),
        };
      } else {
        updatedInventory.push({
          MaCN,
          MaNL: item.MaNL,
          SoLuongTon: item.SoLuongThucTe,
          UpdatedAt: new Date().toISOString(),
        });
      }
    });

    return mergeInventoryStocks(updatedInventory);
  };

  const handleConfirmAudit = () => {
    if (!selectedBranch || !selectedEmployee || !auditDate) {
      alert("Vui lòng chọn chi nhánh, nhân viên kiểm và ngày kiểm");
      return;
    }

    if (auditItems.length === 0) {
      alert("Chi nhánh này chưa có dữ liệu tồn kho để kiểm");
      return;
    }

    const hasInvalidItem = auditItems.some(
      (item) => item.SoLuongThucTe < 0 || Number.isNaN(item.SoLuongThucTe),
    );

    if (hasInvalidItem) {
      alert("Tồn thực tế phải là số lớn hơn hoặc bằng 0");
      return;
    }

    const isConfirmed = confirm(
      "Sau khi hoàn tất, tồn kho sẽ được cập nhật theo số lượng thực tế. Bạn chắc chắn muốn tiếp tục?",
    );

    if (!isConfirmed) return;

    const receiptCode = getNextCode(
      "KK",
      receipts.map((receipt) => receipt.MaKK),
    );

    const now = new Date().toISOString();

    const newReceipt: AuditReceipt = {
      MaKK: receiptCode,
      MaCN: selectedBranch,
      MaNV: selectedEmployee,
      NgayKiem: auditDate,
      TrangThai: "COMPLETED",
      IsSynced: false,
      CreatedAt: now,
      UpdatedAt: now,
    };

    const newDetails: AuditDetail[] = auditItems.map((item) => ({
      MaKK: receiptCode,
      MaNL: item.MaNL,
      SoLuongHeThong: item.SoLuongHeThong,
      SoLuongThucTe: item.SoLuongThucTe,
      ChenhLech: item.SoLuongThucTe - item.SoLuongHeThong,
      GhiChu: item.GhiChu,
    }));

    const updatedReceipts = [...receipts, newReceipt];
    const updatedDetails = [...details, ...newDetails];
    const updatedInventory = updateInventoryAfterAudit(
      inventory,
      auditItems,
      selectedBranch,
    );

    setReceipts(updatedReceipts);
    setDetails(updatedDetails);
    setInventory(updatedInventory);

    saveToStorage(receiptStorageKey, updatedReceipts);
    saveToStorage(detailStorageKey, updatedDetails);
    saveToStorage(inventoryStorageKey, updatedInventory);

    alert("Hoàn tất kiểm kho và đã cập nhật tồn kho");

    handleCloseDrawer();
  };

  const getDifferenceColor = (difference: number, percentDiff: number) => {
    if (difference === 0) return "text-[#198754]";
    if (Math.abs(percentDiff) <= 5) return "text-[#F4A261]";
    return "text-[#DC3545]";
  };

  const auditRows = useMemo(() => {
    return details.map((detail) => {
      const receipt = receipts.find((item) => item.MaKK === detail.MaKK);
      const ingredient = getIngredient(detail.MaNL);

      const percentDiff =
        detail.SoLuongHeThong > 0
          ? (detail.ChenhLech / detail.SoLuongHeThong) * 100
          : 0;

      return {
        MaKK: detail.MaKK,
        NgayKiem: receipt?.NgayKiem || "",
        MaNL: detail.MaNL,
        TenNL: ingredient?.TenNL || detail.MaNL,
        DonVi: ingredient ? getUnitName(ingredient.DonViCoBan) : "-",
        SoLuongHeThong: detail.SoLuongHeThong,
        SoLuongThucTe: detail.SoLuongThucTe,
        ChenhLech: detail.ChenhLech,
        PercentDiff: percentDiff,
        GhiChu: detail.GhiChu || "",
        MaCN: receipt?.MaCN || "",
        TenCN: receipt ? getBranchName(receipt.MaCN) : "",
        MaNV: receipt?.MaNV || "",
        TenNV: receipt ? getEmployeeName(receipt.MaNV) : "",
        TrangThai: receipt?.TrangThai || "COMPLETED",
      };
    });
  }, [details, receipts, ingredients, units, branches, employees]);

  const filteredData = useMemo(() => {
    return auditRows.filter((item) => {
      const matchesSearch =
        item.MaKK.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MaNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.TenCN.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" || item.MaCN === branchFilter;

      return matchesSearch && matchesBranch;
    });
  }, [auditRows, searchQuery, branchFilter]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalItems = auditItems.length;

  const itemsWithDifference = auditItems.filter(
    (item) => item.SoLuongThucTe - item.SoLuongHeThong !== 0,
  ).length;

  const avgDifference =
    totalItems > 0
      ? auditItems.reduce((sum, item) => {
          const difference = item.SoLuongThucTe - item.SoLuongHeThong;
          const percent =
            item.SoLuongHeThong > 0
              ? Math.abs((difference / item.SoLuongHeThong) * 100)
              : 0;

          return sum + percent;
        }, 0) / totalItems
      : 0;

  const handleExportExcel = () => {
    const headers = [
      "Mã phiếu",
      "Ngày kiểm",
      "Mã nguyên liệu",
      "Tên nguyên liệu",
      "Đơn vị",
      "Tồn hệ thống",
      "Tồn thực tế",
      "Chênh lệch",
      "% Sai lệch",
      "Ghi chú",
      "Chi nhánh",
      "Người kiểm",
      "Trạng thái",
    ];

    const rows = filteredData.map((item) => [
      item.MaKK,
      item.NgayKiem,
      item.MaNL,
      item.TenNL,
      item.DonVi,
      item.SoLuongHeThong,
      item.SoLuongThucTe,
      item.ChenhLech,
      item.PercentDiff.toFixed(2) + "%",
      item.GhiChu,
      item.TenCN,
      item.TenNV,
      statusConfig.COMPLETED.label,
    ]);

    downloadCsv("phieu-kiem-kho.csv", headers, rows);
  };

  const handleResetMockData = () => {
    const isConfirmed = confirm(
      "Bạn có chắc muốn khôi phục dữ liệu kiểm kho mẫu không?",
    );

    if (!isConfirmed) return;

    setReceipts(initialReceipts);
    setDetails(initialDetails);
    setInventory(mergeInventoryStocks(initialInventory));

    saveToStorage(receiptStorageKey, initialReceipts);
    saveToStorage(detailStorageKey, initialDetails);
    saveToStorage(inventoryStorageKey, mergeInventoryStocks(initialInventory));

    setCurrentPage(1);
  };

  return (
    <MainLayout
      title="Kiểm kho"
      breadcrumb="Trang chủ / Kho nguyên liệu / Kiểm kho"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng phiếu kiểm</p>
                <p className="text-2xl font-bold text-foreground">
                  {receipts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tổng dòng chi tiết</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {details.length}
            </p>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Dòng có chênh lệch</p>
            <p className="mt-1 text-2xl font-bold text-[#DC3545]">
              {details.filter((detail) => detail.ChenhLech !== 0).length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <Select
            value={branchFilter}
            onValueChange={(value) => {
              setBranchFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Chi nhánh" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả chi nhánh</SelectItem>
              {activeBranches.map((branch) => (
                <SelectItem key={branch.MaCN} value={branch.MaCN}>
                  {branch.TenCN}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm mã phiếu, nguyên liệu, chi nhánh..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button variant="outline" className="gap-2" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>

          <Button variant="outline" onClick={handleResetMockData}>
            Khôi phục mẫu
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportExcel}
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>

          <Button className="gap-2" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Tạo phiếu kiểm
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  {[
                    "Mã phiếu",
                    "Ngày kiểm",
                    "Nguyên liệu",
                    "Đơn vị",
                    "Tồn hệ thống",
                    "Tồn thực tế",
                    "Chênh lệch",
                    "% Sai lệch",
                    "Chi nhánh",
                    "Người kiểm",
                    "Trạng thái",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {paginatedData.map((item, index) => (
                  <tr
                    key={`${item.MaKK}-${item.MaNL}-${index}`}
                    className="hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {item.MaKK}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDateTime(item.NgayKiem)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {item.TenNL}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.MaNL}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.DonVi}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(item.SoLuongHeThong)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(item.SoLuongThucTe)}
                    </td>

                    <td
                      className={cn(
                        "px-4 py-3 text-right text-sm font-semibold",
                        getDifferenceColor(item.ChenhLech, item.PercentDiff),
                      )}
                    >
                      {item.ChenhLech > 0
                        ? `+${formatNumber(item.ChenhLech)}`
                        : formatNumber(item.ChenhLech)}
                    </td>

                    <td
                      className={cn(
                        "px-4 py-3 text-right text-sm font-semibold",
                        getDifferenceColor(item.ChenhLech, item.PercentDiff),
                      )}
                    >
                      {item.PercentDiff.toFixed(2)}%
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.TenCN}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {item.TenNV}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-1 text-xs font-medium",
                          statusConfig.COMPLETED.className,
                        )}
                      >
                        {statusConfig.COMPLETED.label}
                      </span>
                    </td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có phiếu kiểm kho phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredData.length)} trong{" "}
              {filteredData.length} dòng kiểm kho
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
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseDrawer}
          />

          <div className="relative z-10 flex h-full w-[920px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">Tạo phiếu kiểm kho</h3>

              <button
                onClick={handleCloseDrawer}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã phiếu</Label>

                  <Input
                    value={nextReceiptCode}
                    disabled
                    className="mt-1.5 bg-muted"
                  />
                </div>

                <div>
                  <Label>Ngày kiểm *</Label>

                  <Input
                    type="datetime-local"
                    value={auditDate}
                    onChange={(event) => setAuditDate(event.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Chi nhánh kiểm *</Label>

                  <Select
                    value={selectedBranch}
                    onValueChange={handleChangeBranch}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>

                    <SelectContent>
                      {activeBranches.map((branch) => (
                        <SelectItem key={branch.MaCN} value={branch.MaCN}>
                          {branch.TenCN}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Người kiểm *</Label>

                  <Select
                    value={selectedEmployee}
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>

                    <SelectContent>
                      {activeEmployees.map((employee) => (
                        <SelectItem key={employee.MaNV} value={employee.MaNV}>
                          {employee.MaNV} - {employee.TenNV}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-border">
                <div className="border-b border-border p-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi tiết kiểm kho
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nguyên liệu
                        </th>

                        <th className="w-28 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Đơn vị
                        </th>

                        <th className="w-32 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tồn hệ thống
                        </th>

                        <th className="w-36 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Tồn thực tế
                        </th>

                        <th className="w-32 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Chênh lệch
                        </th>

                        <th className="w-32 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          % Sai lệch
                        </th>

                        <th className="w-56 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Ghi chú
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {auditItems.map((item) => {
                        const ingredient = getIngredient(item.MaNL);
                        const difference =
                          item.SoLuongThucTe - item.SoLuongHeThong;
                        const percentDiff =
                          item.SoLuongHeThong > 0
                            ? (difference / item.SoLuongHeThong) * 100
                            : 0;

                        return (
                          <tr key={item.MaNL}>
                            <td className="px-3 py-2">
                              <p className="text-sm font-medium text-foreground">
                                {ingredient?.TenNL || item.MaNL}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.MaNL}
                              </p>
                            </td>

                            <td className="px-3 py-2 text-center text-sm text-muted-foreground">
                              {ingredient
                                ? getUnitName(ingredient.DonViCoBan)
                                : "-"}
                            </td>

                            <td className="px-3 py-2 text-right text-sm font-medium text-foreground">
                              {formatNumber(item.SoLuongHeThong)}
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={0}
                                value={item.SoLuongThucTe}
                                onChange={(event) =>
                                  updateActualStock(
                                    item.MaNL,
                                    Number(event.target.value) || 0,
                                  )
                                }
                                className="text-right"
                              />
                            </td>

                            <td
                              className={cn(
                                "px-3 py-2 text-right text-sm font-semibold",
                                getDifferenceColor(difference, percentDiff),
                              )}
                            >
                              {difference > 0
                                ? `+${formatNumber(difference)}`
                                : formatNumber(difference)}
                            </td>

                            <td
                              className={cn(
                                "px-3 py-2 text-right text-sm font-semibold",
                                getDifferenceColor(difference, percentDiff),
                              )}
                            >
                              {percentDiff.toFixed(2)}%
                            </td>

                            <td className="px-3 py-2">
                              <Input
                                placeholder="Ghi chú..."
                                value={item.GhiChu}
                                onChange={(event) =>
                                  updateNote(item.MaNL, event.target.value)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}

                      {auditItems.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-6 text-center text-sm text-muted-foreground"
                          >
                            Chi nhánh này chưa có dữ liệu tồn kho để kiểm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Tổng nguyên liệu kiểm:
                      </span>{" "}
                      <span className="font-semibold">{totalItems}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground">
                        Có chênh lệch:
                      </span>{" "}
                      <span className="font-semibold text-[#DC3545]">
                        {itemsWithDifference}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground">
                        Tỷ lệ sai lệch TB:
                      </span>{" "}
                      <span className="font-semibold">
                        {avgDifference.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border p-4">
              <Button variant="outline" onClick={handleCloseDrawer}>
                Hủy
              </Button>

              <Button onClick={handleConfirmAudit}>Hoàn tất kiểm kho</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
