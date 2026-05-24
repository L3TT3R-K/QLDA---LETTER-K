"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Search, Plus, Pencil, X, Shield, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

const allPermissions = [
  "Xem dashboard",
  "POS bán hàng",
  "Quản lý tồn kho",
  "Nhập kho",
  "Xuất/Hủy kho",
  "Điều chuyển kho",
  "Kiểm kho",
  "Quản lý sản phẩm",
  "Quản lý nguyên liệu",
  "Công thức",
  "Nhà cung cấp",
  "Quản lý chi nhánh",
  "Quản lý nhân viên",
  "Phân quyền",
  "Xem báo cáo",
  "Xuất báo cáo",
  "Nhật ký hệ thống",
];

const initialRoles: Role[] = [
  {
    id: "R001",
    name: "Quản trị hệ thống",
    description: "Toàn quyền truy cập hệ thống",
    userCount: 2,
    permissions: allPermissions,
  },
  {
    id: "R002",
    name: "Quản lý chi nhánh",
    description: "Quản lý vận hành chi nhánh",
    userCount: 5,
    permissions: [
      "Xem dashboard",
      "POS bán hàng",
      "Quản lý tồn kho",
      "Nhập kho",
      "Xuất/Hủy kho",
      "Điều chuyển kho",
      "Kiểm kho",
      "Quản lý sản phẩm",
      "Xem báo cáo",
    ],
  },
  {
    id: "R003",
    name: "Pha chế",
    description: "Thao tác POS và xem kho",
    userCount: 18,
    permissions: ["POS bán hàng", "Quản lý tồn kho"],
  },
  {
    id: "R004",
    name: "Thu ngân",
    description: "Thực hiện bán hàng tại quầy",
    userCount: 12,
    permissions: ["POS bán hàng"],
  },
];

export default function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });
  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const handleOpenAdd = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsDrawerOpen(true);
  };

  const handleTogglePermission = (permission: string) => {
    const hasPermission = formData.permissions.includes(permission);

    setFormData({
      ...formData,
      permissions: hasPermission
        ? formData.permissions.filter((p) => p !== permission)
        : [...formData.permissions, permission],
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên vai trò");
      return;
    }

    if (selectedRole) {
      setRoles(
        roles.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
              }
            : role,
        ),
      );
    } else {
      const newRole: Role = {
        id: `R${String(roles.length + 1).padStart(3, "0")}`,
        name: formData.name,
        description: formData.description || "Chưa có mô tả",
        userCount: 0,
        permissions: formData.permissions,
      };

      setRoles([...roles, newRole]);
    }

    setIsDrawerOpen(false);
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
  };

  const handleDelete = (id: string) => {
    const isConfirmed = confirm("Bạn có chắc muốn xóa vai trò này không?");

    if (!isConfirmed) return;

    setRoles(roles.filter((role) => role.id !== id));
  };
  return (
    <MainLayout
      title="Tài khoản & Phân quyền"
      breadcrumb="Trang chủ / Hệ thống / Tài khoản & Quyền"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm vai trò..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm vai trò
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {role.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(role)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 5).map((p) => (
                  <span
                    key={p}
                    className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
                {role.permissions.length > 5 && (
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    +{role.permissions.length - 5} quyền khác
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground border-t border-border pt-2">
                {role.userCount} người dùng có vai trò này
              </p>
            </div>
          ))}
        </div>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative z-10 flex h-full w-[480px] flex-col bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-lg font-semibold">
                {selectedRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
              </h3>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedRole(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <Label>Tên vai trò *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên vai trò"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả vai trò"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="mb-2 block">Phân quyền</Label>
                <div className="space-y-2 rounded-lg border border-border p-3">
                  {allPermissions.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-foreground">{perm}</span>
                      <Switch
                        checked={formData.permissions.includes(perm)}
                        onCheckedChange={() => handleTogglePermission(perm)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 border-t border-border p-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setSelectedRole(null);
                }}
              >
                Hủy
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
