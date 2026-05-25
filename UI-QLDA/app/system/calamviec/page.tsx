"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Lock,
  Plus,
  Search,
  Unlock,
  X,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Branch {
  MaCN: string;
  TenCN: string;
  DiaChi?: string;
  TrangThai: number;
}

interface Employee {
  MaNV: string;
  TenNV: string;
  ChucVu: string;
  MaCN: string | null;
  TrangThai: number;
}

interface WorkShift {
  MaCa: string;
  MaNV: string;
  MaCN: string;
  ThoiGianMo: string;
  TienDauCa: number;
  ThoiGianDong?: string;
  TienCuoiCa?: number;
  SoTienThatThoat?: number;
  LyDoGiaiTrinh?: string;
  TrangThai: "DANG_MO" | "DA_DONG";
  CreatedAt?: string;
  UpdatedAt?: string;
}

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
  {
    MaCN: "CN04",
    TenCN: "Phụng Lộc Coffee - Thủ Đức",
    DiaChi: "45 Võ Văn Ngân, Thủ Đức, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN05",
    TenCN: "Phụng Lộc Coffee - Gò Vấp",
    DiaChi: "102 Phan Văn Trị, Gò Vấp, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN06",
    TenCN: "Phụng Lộc Coffee - Tân Bình",
    DiaChi: "70 Cộng Hòa, Tân Bình, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN07",
    TenCN: "Phụng Lộc Coffee - Quận 7",
    DiaChi: "15 Nguyễn Thị Thập, Quận 7, TP.HCM",
    TrangThai: 1,
  },
  {
    MaCN: "CN08",
    TenCN: "Phụng Lộc Coffee - Phú Nhuận",
    DiaChi: "33 Phan Đăng Lưu, Phú Nhuận, TP.HCM",
    TrangThai: 1,
  },
];

const initialEmployees: Employee[] = [
  {
    MaNV: "NV001",
    TenNV: "Nguyễn Văn An",
    ChucVu: "ADMIN",
    MaCN: null,
    TrangThai: 1,
  },
  {
    MaNV: "NV002",
    TenNV: "Trần Thị Bình",
    ChucVu: "QUANLY_CHINHANH",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV003",
    TenNV: "Lê Văn Cường",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV004",
    TenNV: "Phạm Thị Dung",
    ChucVu: "PHA_CHE",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV005",
    TenNV: "Hoàng Văn Em",
    ChucVu: "NHANVIEN_KHO",
    MaCN: "CN01",
    TrangThai: 1,
  },
  {
    MaNV: "NV006",
    TenNV: "Đỗ Thị Hoa",
    ChucVu: "QUANLY_CHINHANH",
    MaCN: "CN02",
    TrangThai: 1,
  },
  {
    MaNV: "NV007",
    TenNV: "Võ Văn Khang",
    ChucVu: "NHANVIEN_BANHANG",
    MaCN: "CN02",
    TrangThai: 1,
  },
  {
    MaNV: "NV008",
    TenNV: "Ngô Thị Lan",
    ChucVu: "KETOAN",
    MaCN: null,
    TrangThai: 1,
  },
];

const initialShifts: WorkShift[] = [
  {
    MaCa: "CA001",
    MaNV: "NV003",
    MaCN: "CN01",
    ThoiGianMo: "2026-05-13T07:00",
    TienDauCa: 1000000,
    ThoiGianDong: "",
    TienCuoiCa: undefined,
    SoTienThatThoat: undefined,
    LyDoGiaiTrinh: "",
    TrangThai: "DANG_MO",
    CreatedAt: "2026-05-13T07:00:00",
    UpdatedAt: "2026-05-13T07:00:00",
  },
  {
    MaCa: "CA002",
    MaNV: "NV007",
    MaCN: "CN02",
    ThoiGianMo: "2026-05-13T07:00",
    TienDauCa: 800000,
    ThoiGianDong: "",
    TienCuoiCa: undefined,
    SoTienThatThoat: undefined,
    LyDoGiaiTrinh: "",
    TrangThai: "DANG_MO",
    CreatedAt: "2026-05-13T07:00:00",
    UpdatedAt: "2026-05-13T07:00:00",
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

const getNextShiftCode = (shifts: WorkShift[]) => {
  const maxNumber = shifts.reduce((max, shift) => {
    const number = Number(shift.MaCa.replace("CA", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `CA${String(maxNumber + 1).padStart(3, "0")}`;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toInputDateTime = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

export default function WorkShiftsPage() {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [shifts, setShifts] = useState<WorkShift[]>(initialShifts);

  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isCloseDrawer, setIsCloseDrawer] = useState(false);
  const [closingShift, setClosingShift] = useState<WorkShift | null>(null);

  const [openForm, setOpenForm] = useState({
    MaNV: "NV003",
    MaCN: "CN01",
    TienDauCa: "1000000",
    ThoiGianMo: toInputDateTime(new Date()),
  });

  const [closeForm, setCloseForm] = useState({
    TienCuoiCa: "",
    SoTienThatThoat: "0",
    LyDoGiaiTrinh: "",
    ThoiGianDong: toInputDateTime(new Date()),
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const storedBranches = getFromStorage<Branch>("CHINHANH", []);
    const storedEmployees = getFromStorage<Employee>("NHANVIEN", []);
    const storedShifts = getFromStorage<WorkShift>("CALAMVIEC", []);

    if (storedBranches.length > 0) {
      setBranches(storedBranches);
    }

    if (storedEmployees.length > 0) {
      setEmployees(storedEmployees);
    }

    if (storedShifts.length > 0) {
      setShifts(storedShifts);
    } else {
      saveToStorage("CALAMVIEC", initialShifts);
    }
  }, []);

  const activeBranches = branches.filter((branch) => branch.TrangThai === 1);
  const activeEmployees = employees.filter(
    (employee) => employee.TrangThai === 1,
  );

  const getBranchName = (MaCN: string) => {
    return branches.find((branch) => branch.MaCN === MaCN)?.TenCN || MaCN;
  };

  const getEmployeeName = (MaNV: string) => {
    return employees.find((employee) => employee.MaNV === MaNV)?.TenNV || MaNV;
  };

  const getEmployeePosition = (MaNV: string) => {
    return employees.find((employee) => employee.MaNV === MaNV)?.ChucVu || "";
  };

  const filteredEmployeesByBranch = useMemo(() => {
    return activeEmployees.filter((employee) => {
      return employee.MaCN === openForm.MaCN || employee.MaCN === null;
    });
  }, [activeEmployees, openForm.MaCN]);

  useEffect(() => {
    const exists = filteredEmployeesByBranch.some(
      (employee) => employee.MaNV === openForm.MaNV,
    );

    if (!exists && filteredEmployeesByBranch.length > 0) {
      setOpenForm((prev) => ({
        ...prev,
        MaNV: filteredEmployeesByBranch[0].MaNV,
      }));
    }
  }, [filteredEmployeesByBranch, openForm.MaNV]);

  const openedShiftCount = shifts.filter(
    (shift) => shift.TrangThai === "DANG_MO",
  ).length;

  const closedShiftCount = shifts.filter(
    (shift) => shift.TrangThai === "DA_DONG",
  ).length;

  const totalStartCash = shifts
    .filter((shift) => shift.TrangThai === "DANG_MO")
    .reduce((sum, shift) => sum + shift.TienDauCa, 0);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const branchName = getBranchName(shift.MaCN).toLowerCase();
      const employeeName = getEmployeeName(shift.MaNV).toLowerCase();

      const matchesSearch =
        shift.MaCa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.MaNV.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shift.MaCN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branchName.includes(searchQuery.toLowerCase()) ||
        employeeName.includes(searchQuery.toLowerCase());

      const matchesBranch =
        branchFilter === "all" || shift.MaCN === branchFilter;

      const matchesStatus =
        statusFilter === "all" || shift.TrangThai === statusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [shifts, searchQuery, branchFilter, statusFilter, branches, employees]);

  const totalPages = Math.ceil(filteredShifts.length / pageSize);

  const paginatedShifts = filteredShifts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const resetOpenForm = () => {
    setOpenForm({
      MaNV: "NV003",
      MaCN: "CN01",
      TienDauCa: "1000000",
      ThoiGianMo: toInputDateTime(new Date()),
    });
  };

  const handleOpenShiftDrawer = () => {
    resetOpenForm();
    setIsOpenDrawer(true);
  };

  const handleCreateShift = () => {
    const tienDauCa = Number(openForm.TienDauCa);

    if (!openForm.MaCN || !openForm.MaNV || !openForm.ThoiGianMo) {
      alert("Vui lòng nhập đầy đủ thông tin mở ca");
      return;
    }

    if (Number.isNaN(tienDauCa) || tienDauCa < 0) {
      alert("Tiền đầu ca không hợp lệ");
      return;
    }

    const employee = employees.find((item) => item.MaNV === openForm.MaNV);

    if (!employee) {
      alert("Nhân viên không tồn tại");
      return;
    }

    if (employee.MaCN && employee.MaCN !== openForm.MaCN) {
      alert("Nhân viên không thuộc chi nhánh đã chọn");
      return;
    }

    const existedOpenShift = shifts.find(
      (shift) => shift.MaNV === openForm.MaNV && shift.TrangThai === "DANG_MO",
    );

    if (existedOpenShift) {
      alert("Nhân viên này đang có ca chưa đóng");
      return;
    }

    const now = new Date().toISOString();

    const newShift: WorkShift = {
      MaCa: getNextShiftCode(shifts),
      MaNV: openForm.MaNV,
      MaCN: openForm.MaCN,
      ThoiGianMo: openForm.ThoiGianMo,
      TienDauCa: tienDauCa,
      ThoiGianDong: "",
      TienCuoiCa: undefined,
      SoTienThatThoat: undefined,
      LyDoGiaiTrinh: "",
      TrangThai: "DANG_MO" as const,
      CreatedAt: now,
      UpdatedAt: now,
    };

    const updatedShifts = [...shifts, newShift];

    setShifts(updatedShifts);
    saveToStorage("CALAMVIEC", updatedShifts);

    setIsOpenDrawer(false);
    resetOpenForm();
    setCurrentPage(1);
  };

  const handleOpenCloseDrawer = (shift: WorkShift) => {
    setClosingShift(shift);
    setCloseForm({
      TienCuoiCa: String(shift.TienDauCa),
      SoTienThatThoat: "0",
      LyDoGiaiTrinh: "",
      ThoiGianDong: toInputDateTime(new Date()),
    });
    setIsCloseDrawer(true);
  };

  const handleCloseShift = () => {
    if (!closingShift) return;

    const tienCuoiCa = Number(closeForm.TienCuoiCa);
    const soTienThatThoat = Number(closeForm.SoTienThatThoat);

    if (!closeForm.ThoiGianDong) {
      alert("Vui lòng nhập thời gian đóng ca");
      return;
    }

    if (Number.isNaN(tienCuoiCa) || tienCuoiCa < 0) {
      alert("Tiền cuối ca không hợp lệ");
      return;
    }

    if (Number.isNaN(soTienThatThoat) || soTienThatThoat < 0) {
      alert("Số tiền thất thoát không hợp lệ");
      return;
    }

    if (soTienThatThoat > 0 && !closeForm.LyDoGiaiTrinh.trim()) {
      alert("Vui lòng nhập lý do giải trình khi có thất thoát");
      return;
    }

    const updatedShifts: WorkShift[] = shifts.map((shift) =>
      shift.MaCa === closingShift.MaCa
        ? {
            ...shift,
            ThoiGianDong: closeForm.ThoiGianDong,
            TienCuoiCa: tienCuoiCa,
            SoTienThatThoat: soTienThatThoat,
            LyDoGiaiTrinh: closeForm.LyDoGiaiTrinh,
            TrangThai: "DA_DONG" as const,
            UpdatedAt: new Date().toISOString(),
          }
        : shift,
    );

    setShifts(updatedShifts);
    saveToStorage("CALAMVIEC", updatedShifts);

    setIsCloseDrawer(false);
    setClosingShift(null);
  };

  return (
    <MainLayout
      title="Ca làm việc"
      breadcrumb="Trang chủ / Hệ thống / Ca làm việc"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarClock className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tổng số ca</p>
                <p className="text-2xl font-bold text-foreground">
                  {shifts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1E7DD]">
                <Unlock className="h-5 w-5 text-[#198754]" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Đang mở</p>
                <p className="text-2xl font-bold text-[#198754]">
                  {openedShiftCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Đã đóng</p>
                <p className="text-2xl font-bold text-foreground">
                  {closedShiftCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF3CD]">
                <DollarSign className="h-5 w-5 text-[#856404]" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Tiền đầu ca đang mở
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(totalStartCash)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Tìm theo mã ca, nhân viên, chi nhánh..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(event) => {
              setBranchFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tất cả chi nhánh</option>
            {activeBranches.map((branch) => (
              <option key={branch.MaCN} value={branch.MaCN}>
                {branch.TenCN}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="DANG_MO">Đang mở</option>
            <option value="DA_DONG">Đã đóng</option>
          </select>

          <Button onClick={handleOpenShiftDrawer} className="gap-2">
            <Plus className="h-4 w-4" />
            Mở ca
          </Button>
        </div>

        <div className="rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã ca
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nhân viên
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chi nhánh
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thời gian mở
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tiền đầu ca
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Thời gian đóng
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tiền cuối ca
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
                {paginatedShifts.map((shift) => (
                  <tr key={shift.MaCa} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold text-primary">
                      {shift.MaCa}
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {getEmployeeName(shift.MaNV)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shift.MaNV} · {getEmployeePosition(shift.MaNV)}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">
                        {getBranchName(shift.MaCN)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shift.MaCN}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {formatDateTime(shift.ThoiGianMo)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {formatCurrency(shift.TienDauCa)}
                    </td>

                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {formatDateTime(shift.ThoiGianDong)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {shift.TienCuoiCa !== undefined
                        ? formatCurrency(shift.TienCuoiCa)
                        : "—"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                          shift.TrangThai === "DANG_MO"
                            ? "bg-[#D1E7DD] text-[#198754]"
                            : "bg-[#E2E3E5] text-[#383D41]",
                        )}
                      >
                        {shift.TrangThai === "DANG_MO" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {shift.TrangThai === "DANG_MO" ? "Đang mở" : "Đã đóng"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {shift.TrangThai === "DANG_MO" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCloseDrawer(shift)}
                        >
                          Đóng ca
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Hoàn tất
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {paginatedShifts.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không có ca làm việc phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị{" "}
              {filteredShifts.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredShifts.length)} trong{" "}
              {filteredShifts.length} ca
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

      {isOpenDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpenDrawer(false)}
          />

          <div className="relative z-10 flex h-full w-[430px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">Mở ca làm việc</h3>

              <button
                onClick={() => setIsOpenDrawer(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <Label>Chi nhánh *</Label>

                <select
                  value={openForm.MaCN}
                  onChange={(event) =>
                    setOpenForm({
                      ...openForm,
                      MaCN: event.target.value,
                    })
                  }
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {activeBranches.map((branch) => (
                    <option key={branch.MaCN} value={branch.MaCN}>
                      {branch.TenCN}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Nhân viên mở ca *</Label>

                <select
                  value={openForm.MaNV}
                  onChange={(event) =>
                    setOpenForm({
                      ...openForm,
                      MaNV: event.target.value,
                    })
                  }
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {filteredEmployeesByBranch.map((employee) => (
                    <option key={employee.MaNV} value={employee.MaNV}>
                      {employee.MaNV} - {employee.TenNV} ({employee.ChucVu})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Thời gian mở ca *</Label>

                <Input
                  type="datetime-local"
                  value={openForm.ThoiGianMo}
                  onChange={(event) =>
                    setOpenForm({
                      ...openForm,
                      ThoiGianMo: event.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Tiền đầu ca *</Label>

                <Input
                  type="number"
                  min={0}
                  value={openForm.TienDauCa}
                  onChange={(event) =>
                    setOpenForm({
                      ...openForm,
                      TienDauCa: event.target.value,
                    })
                  }
                  placeholder="Nhập tiền đầu ca"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpenDrawer(false)}
              >
                Hủy
              </Button>

              <Button className="flex-1" onClick={handleCreateShift}>
                Mở ca
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCloseDrawer && closingShift && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCloseDrawer(false)}
          />

          <div className="relative z-10 flex h-full w-[430px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                Đóng ca {closingShift.MaCa}
              </h3>

              <button
                onClick={() => setIsCloseDrawer(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Nhân viên:</span>{" "}
                  <span className="font-medium">
                    {getEmployeeName(closingShift.MaNV)}
                  </span>
                </p>

                <p>
                  <span className="text-muted-foreground">Chi nhánh:</span>{" "}
                  <span className="font-medium">
                    {getBranchName(closingShift.MaCN)}
                  </span>
                </p>

                <p>
                  <span className="text-muted-foreground">Tiền đầu ca:</span>{" "}
                  <span className="font-medium">
                    {formatCurrency(closingShift.TienDauCa)}
                  </span>
                </p>
              </div>

              <div>
                <Label>Thời gian đóng ca *</Label>

                <Input
                  type="datetime-local"
                  value={closeForm.ThoiGianDong}
                  onChange={(event) =>
                    setCloseForm({
                      ...closeForm,
                      ThoiGianDong: event.target.value,
                    })
                  }
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Tiền cuối ca *</Label>

                <Input
                  type="number"
                  min={0}
                  value={closeForm.TienCuoiCa}
                  onChange={(event) =>
                    setCloseForm({
                      ...closeForm,
                      TienCuoiCa: event.target.value,
                    })
                  }
                  placeholder="Nhập tiền cuối ca"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Số tiền thất thoát</Label>

                <Input
                  type="number"
                  min={0}
                  value={closeForm.SoTienThatThoat}
                  onChange={(event) =>
                    setCloseForm({
                      ...closeForm,
                      SoTienThatThoat: event.target.value,
                    })
                  }
                  placeholder="Nhập số tiền thất thoát nếu có"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Lý do giải trình</Label>

                <Textarea
                  value={closeForm.LyDoGiaiTrinh}
                  onChange={(event) =>
                    setCloseForm({
                      ...closeForm,
                      LyDoGiaiTrinh: event.target.value,
                    })
                  }
                  placeholder="Nhập lý do nếu có thất thoát"
                  className="mt-1.5"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCloseDrawer(false)}
              >
                Hủy
              </Button>

              <Button className="flex-1" onClick={handleCloseShift}>
                Đóng ca
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
