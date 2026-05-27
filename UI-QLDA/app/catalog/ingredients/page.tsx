"use client";

import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Pencil, X, Trash2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import api from "@/services/api";

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

const unitStorageKey = "DONVI";
const initialUnits: Unit[] = [
  { MaDV: "GRAM", TenDonVi: "Gram", TrangThai: 1 },
  { MaDV: "KG", TenDonVi: "Kilogram", TrangThai: 1 },
  { MaDV: "ML", TenDonVi: "Mililít", TrangThai: 1 },
  { MaDV: "LIT", TenDonVi: "Lít", TrangThai: 1 },
  { MaDV: "CAI", TenDonVi: "Cái", TrangThai: 1 },
  { MaDV: "HOP", TenDonVi: "Hộp", TrangThai: 1 },
];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

  const [formData, setFormData] = useState({
    tenNL: "",
    donViCoBan: "GRAM",
    tonToiThieu: "",
    trangThai: 1,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchIngredients = async () => {
    try {
      const response = await api.get("/api/nguyenlieu");
      setIngredients(response.data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nguyên liệu:", error);
    }
  };

  useEffect(() => {
    fetchIngredients();
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(unitStorageKey);
      if (data) {
        setUnits(JSON.parse(data));
      } else {
        localStorage.setItem(unitStorageKey, JSON.stringify(initialUnits));
      }
    }
  }, []);

  const getUnitName = (MaDV: string) => {
    return units.find((unit) => unit.MaDV === MaDV)?.TenDonVi || MaDV;
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => {
      const unitName = getUnitName(ingredient.donViCoBan);
      const matchesSearch =
        ingredient.tenNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.maNL.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unitName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUnit = unitFilter === "all" || ingredient.donViCoBan === unitFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ingredient.trangThai === 1) ||
        (statusFilter === "inactive" && ingredient.trangThai === 0);
      return matchesSearch && matchesUnit && matchesStatus;
    });
  }, [ingredients, units, searchQuery, unitFilter, statusFilter]);

  const totalPages = Math.ceil(filteredIngredients.length / pageSize);
  const paginatedIngredients = filteredIngredients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeCount = ingredients.filter((item) => item.trangThai === 1).length;
  const inactiveCount = ingredients.filter((item) => item.trangThai === 0).length;
  const lowThresholdCount = ingredients.filter((item) => item.tonToiThieu > 0 && item.trangThai === 1).length;

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
    setFormData({ tenNL: "", donViCoBan: "GRAM", tonToiThieu: "", trangThai: 1 });
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ tenNL: "", donViCoBan: "GRAM", tonToiThieu: "", trangThai: 1 });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (ingredient: Ingredient) => {
    setEditingItem(ingredient);
    setFormData({
      tenNL: ingredient.tenNL,
      donViCoBan: ingredient.donViCoBan,
      tonToiThieu: String(ingredient.tonToiThieu),
      trangThai: ingredient.trangThai,
    });
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    const tonToiThieu = Number(formData.tonToiThieu);
    if (!formData.tenNL.trim() || !formData.donViCoBan || Number.isNaN(tonToiThieu)) {
      alert("Vui lòng nhập đầy đủ và hợp lệ");
      return;
    }
    const payload = {
      maNL: editingItem?.maNL,
      tenNL: formData.tenNL.trim(),
      donViCoBan: formData.donViCoBan,
      tonToiThieu: tonToiThieu,
      trangThai: formData.trangThai,
    };
    try {
      if (editingItem) {
        await api.put(`/api/nguyenlieu/${editingItem.maNL}`, payload);
      } else {
        await api.post("/api/nguyenlieu", payload);
      }
      await fetchIngredients();
      closeDrawer();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  const handleToggleStatus = async (ingredient: Ingredient) => {
    try {
      await api.put(`/api/nguyenlieu/${ingredient.maNL}`, {
        ...ingredient,
        trangThai: ingredient.trangThai === 1 ? 0 : 1,
      });
      await fetchIngredients();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (maNL: string) => {
    if (!confirm("Bạn có chắc muốn ngưng sử dụng nguyên liệu này?")) return;
    try {
      await api.delete(`/api/nguyenlieu/${maNL}`);
      await fetchIngredients();
    } catch (error) {
      alert("Lỗi khi xóa nguyên liệu");
    }
  };

  return (
    <MainLayout title="Quản lý nguyên liệu" breadcrumb="Trang chủ / Danh mục / Nguyên liệu">
      <div className="space-y-4">
        {/* THỐNG KÊ */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Tổng nguyên liệu</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{ingredients.length}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Đang sử dụng</p>
            <p className="mt-1 text-2xl font-bold text-[#198754]">{activeCount}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Ngừng sử dụng</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{inactiveCount}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-muted-foreground">Có tồn tối thiểu</p>
            <p className="mt-1 text-2xl font-bold text-primary">{lowThresholdCount}</p>
          </div>
        </div>

        {/* BỘ LỌC */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm kiếm nguyên liệu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={handleOpenAdd} className="gap-2"><Plus className="h-4 w-4" /> Thêm nguyên liệu</Button>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="overflow-hidden rounded-lg bg-card shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <table className="w-full">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Mã NL</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Tên nguyên liệu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Đơn vị</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Tồn tối thiểu</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedIngredients.map((item) => (
                <tr key={item.maNL} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-semibold text-primary">{item.maNL}</td>
                  <td className="px-4 py-3 text-sm">{item.tenNL}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{getUnitName(item.donViCoBan)}</td>
                  <td className="px-4 py-3 text-right text-sm">{item.tonToiThieu} {getUnitName(item.donViCoBan)}</td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={item.trangThai === 1} onCheckedChange={() => handleToggleStatus(item)} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenEdit(item)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item.maNL)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM/SỬA */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} />
          <div className="relative z-10 flex h-full w-[420px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">{editingItem ? "Chỉnh sửa" : "Thêm mới"}</h3>
              <button onClick={closeDrawer}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 space-y-4 p-4">
              <div><Label>Tên nguyên liệu</Label><Input value={formData.tenNL} onChange={(e) => setFormData({...formData, tenNL: e.target.value})} className="mt-1.5"/></div>
              <div>
                <Label>Đơn vị cơ bản</Label>
                <Select value={formData.donViCoBan} onValueChange={(v) => setFormData({...formData, donViCoBan: v})}>
                  <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {units.map((u) => <SelectItem key={u.MaDV} value={u.MaDV}>{u.TenDonVi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Tồn tối thiểu</Label><Input type="number" value={formData.tonToiThieu} onChange={(e) => setFormData({...formData, tonToiThieu: e.target.value})} className="mt-1.5"/></div>
              <div className="flex gap-3 items-center"><Switch checked={formData.trangThai === 1} onCheckedChange={(c) => setFormData({...formData, trangThai: c ? 1 : 0})}/><Label>Đang sử dụng</Label></div>
            </div>
            <div className="flex gap-3 border-t p-4">
              <Button variant="outline" className="flex-1" onClick={closeDrawer}>Hủy</Button>
              <Button className="flex-1" onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}