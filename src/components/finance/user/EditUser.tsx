"use client";

import React, { useEffect, useState } from 'react';
import Alert from "@/components/ui/alert/Alert";
import { useRouter, useParams } from 'next/navigation';
import Axios from 'axios';
import api from '@/components/lib/axios';
import ComponentCard from '@/components/common/ComponentCard';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { ChevronDownIcon } from '@/icons';


interface FormDataState {
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

interface FormErrorsState {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: string;
}

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "",
  });

  const [errors, setErrors] = useState<FormErrorsState>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "purchasing", label: "Purchasing" },
    { value: "kasir", label: "Kasir" },
    { value: "accounting", label: "Accounting" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "nonactive", label: "Non Active" },
  ];

  // State untuk mengontrol Alert
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  // Fetch data user lama berdasarkan ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/api/users/${userId}`);
        if (response.data.success) {
          const u = response.data.data;
          setFormData({
            name: u.name || "",
            email: u.email || "",
            password: "", // Biarkan kosong jika tidak ingin ubah password
            role: u.role || "",
            status: u.status || "",
          });
        }
      } catch {
        //toast.error("Gagal mengambil data user.");
        setAlert({
            variant: "error",
            title: "Gagal!.",
            message: "Gagal mengambil data user.",
          });
        router.push("/userPage");
      } finally {
        setFetching(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setAlert(null);

    try {
      await api.get("/sanctum/csrf-cookie");
      // Mengirim PUT request ke backend
      const response = await api.put(`/api/users/${userId}`, formData);
      //console.log("Response dari server:", response.data);
      if (response.data.success) {
        //toast.success("Data user berhasil diperbarui!", {
            //duration: 3000,
        //});
        setAlert({
          variant: "success",
          title: "Berhasil!",
          message: response.data.message || "User berhasil diperbarui.",
        });
        setTimeout(() => {
            router.push("/userPage");
            router.refresh();
        }, 2000);
      }
    } catch (err: unknown) {
      if (Axios.isAxiosError(err) && err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        setErrors({
          name: backendErrors.name ? backendErrors.name[0] : "",
          email: backendErrors.email ? backendErrors.email[0] : "",
          password: backendErrors.password ? backendErrors.password[0] : "",
          role: backendErrors.role ? backendErrors.role[0] : "",
          status: backendErrors.status ? backendErrors.status[0] : "",
        });
        //toast.error("Periksa kembali form yang diisi.");
        setAlert({
            variant: "error",
            title: "Gagal Menyimpan",
            message: "Periksa kembali form yang diisi.",
          });
      } else {
        //toast.error("Terjadi kesalahan saat menyimpan data.");
        setAlert({
            variant: "error",
            title: "Terjadi Kesalahan",
            message: "Terjadi kesalahan pada server.",
          });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-500 animate-pulse">Memuat data user...</p>
      </div>
    );
  }

  return (
    <ComponentCard title="Edit User">
     {alert && (
        <div className="mb-6">
          <Alert
            variant={alert.variant}
            title={alert.title}
            message={alert.message}
          />
        </div>
     )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              type="text"
              name="name"
              placeholder="Masukkan nama"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              required
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Role */}
          <div>
            <Label>Select Role</Label>
            <div className="relative">
              <Select
                options={roleOptions}
                placeholder="Select Role"
                onChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}
                name="role"
                value={formData.role}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              required
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password (Opsional saat Edit) */}
          <div>
            <Label>Password Baru (Kosongkan jika tidak ingin diubah)</Label>
            <Input
              type="password"
              name="password"
              placeholder="Masukkan password baru"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          {/* Status */}
          <div>
            <Label>Select Status</Label>
            <div className="relative">
              <Select
                options={statusOptions}
                placeholder="Select Status"
                onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                name="status"
                value={formData.status}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-black text-sm font-semibold rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </div>
      </form>
    </ComponentCard>
  );
}