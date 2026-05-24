"use client";

import Image from "next/image";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCurrentUser } from "@/lib/auth";
import { getDefaultRouteByRole, type UserRole } from "@/lib/permissions";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    let role: UserRole | null = null;
    let maNV = "";
    let tenNV = "";
    let maCN: string | null = null;

    if (normalizedUsername === "admin" && normalizedPassword === "123") {
      role = "ADMIN";
      maNV = "NV001";
      tenNV = "Nguyễn Văn A";
      maCN = null;
    } else if (
      normalizedUsername === "quanly" &&
      normalizedPassword === "123"
    ) {
      role = "QUANLY";
      maNV = "NV002";
      tenNV = "Trần Thị B";
      maCN = "CN01";
    } else if (normalizedUsername === "kho" && normalizedPassword === "123") {
      role = "NHANVIEN_KHO";
      maNV = "NV005";
      tenNV = "Hoàng Văn E";
      maCN = "CN01";
    } else if (
      normalizedUsername === "banhang" &&
      normalizedPassword === "123"
    ) {
      role = "NHANVIEN_BANHANG";
      maNV = "NV003";
      tenNV = "Lê Văn C";
      maCN = "CN01";
    }

    if (!role) {
      alert("Sai tài khoản hoặc mật khẩu");
      return;
    }

    saveCurrentUser({
      token: "mock-token",
      maNV,
      tenNV,
      chucVu: role,
      maCN,
    });

    router.push(getDefaultRouteByRole(role));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-[#1A1A2E] to-[#0f1419] text-foreground">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="absolute left-10 top-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

          <div className="relative w-full max-w-lg rounded-[2rem] border border-white/20 bg-white/10 p-8 text-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="relative flex size-20 items-center justify-center overflow-visible bg-transparent md:size-24">
                <Image
                  src="/PHUNG_LOC_final_-removebg-preview.png"
                  alt="Phụng Lộc Coffee"
                  fill
                  priority
                  sizes="96px"
                  className="object-contain object-center scale-[1.6]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                  <strong>Phụng Lộc Coffee</strong>
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  Brew the moment
                </h1>
              </div>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-white/80">
              Coffee Management
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-8 shadow-[0_24px_70px_-35px_rgba(7,16,79,0.35)] md:p-10">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <span>Đăng nhập</span>
            </div>

            <div className="mt-6">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Chào mừng !
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Vui lòng đăng nhập
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleLogin();
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Email hoặc tên đăng nhập
                </span>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    type="text"
                    placeholder="Nhập tài khoản..."
                    className="h-11 rounded-xl pl-10"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Mật khẩu
                </span>

                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    className="h-11 rounded-xl pl-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
              </label>

              {/* <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Tài khoản test:</p>
                <p>admin / 123 — Admin</p>
                <p>quanly / 123 — Quản lý</p>
                <p>kho / 123 — Nhân viên kho</p>
                <p>banhang / 123 — Nhân viên bán hàng</p>
              </div> */}

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Ghi nhớ đăng nhập
                </label>

                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#1a1e54] text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-[#23388d]"
              >
                Đăng nhập
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
