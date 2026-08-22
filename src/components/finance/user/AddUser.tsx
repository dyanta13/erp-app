"use client";
import { ChevronDownIcon } from '@/icons';
import React, { useState } from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import ComponentCard from '@/components/common/ComponentCard';
import Select from '@/components/form/Select';
import Axios from "axios";
import api from "@/components/lib/axios";
import { useRouter } from "next/navigation";
import Image from 'next/image';


// Type Interface untuk Form & Error
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
  general?: string;
}

export const AddUser = () => {
  const router = useRouter();
    // State
    const [formData, setFormData] = useState<FormDataState>({
      name: "",
      email: "",
      password: "",
      role: "",
      status: "",
    });

    const [errors, setErrors] = useState<FormErrorsState>({});
    const [loading, setLoading] = useState<boolean>(false);

    const [showPassword, setShowPassword] = useState(false);
      const options = [
        { value: "admin", label: "Admin" },
        { value: "purchasing", label: "Purchasing" },
        { value: "kasir", label: "Kasir" },
        { value: "accounting", label: "Accounting" },
      ];
      const selectStatus = [
        { value: "active", label: "Active" },
        { value: "nonactive", label: "Non Active" },
      ];

      
      const handleSelectChange = (value: string) => {
        setFormData((prev) => ({
          ...prev,
          role: value,
        }));

        if (errors.role) {
          setErrors((prev) => ({
            ...prev,
            role: "",
          }));
        }
      };

      const handleSelect2Change = (value: string) => {
        setFormData((prev) => ({
          ...prev,
          status: value,
        }));

        if (errors.role) {
          setErrors((prev) => ({
            ...prev,
            status: "",
          }));
        }
      };

    // Handler Input
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name as keyof FormErrorsState] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: "",
      }));
    }
    };

    // Handler Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Ambil CSRF cookie jika menggunakan Sanctum
      await api.get("/sanctum/csrf-cookie");
      const response = await api.post("/api/users", formData);

      if (response.data.success) {
        // Redirect atau beri notifikasi sukses
        router.push("/userPage"); // Kembali ke halaman tabel user
        router.refresh();
      }
    } catch (err: unknown) {
      if (Axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 422) {
            // Tangkap validation error
            const backendErrors = err.response.data.errors || {};
            setErrors({
              name: backendErrors.name ? backendErrors.name[0] : "",
              email: backendErrors.email ? backendErrors.email[0] : "",
              password: backendErrors.password ? backendErrors.password[0] : "",
              role: backendErrors.role ? backendErrors.role[0] : "",
              status: backendErrors.status ? backendErrors.status[0] : "",
            });
          } else {
            setErrors({
              general: err.response.data.message || "Terjadi kesalahan pada server.",
            });
            //setGeneralError(
              //err.response.data.message || "Terjadi kesalahan pada server."
            //);
          }
        } else {
          setErrors({ general: "Gagal terhubung ke server backend." });
          //setGeneralError("Gagal terhubung ke server backend.");
        }
      } else {
        setErrors({ general: "Terjadi kesalahan tidak terduga." });
        //setGeneralError("Terjadi kesalahan tidak terduga.");
      }
    } finally {
      setLoading(false);
    }
  };  

  return (
    <ComponentCard title="Add User">
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-6">
        <div>
          <Label>Full Name</Label>
          <Input type="text"
            name="name"
            placeholder="Masukkan nama"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            required 
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
        </div>

        <div>
          <Label>Select Role</Label>
          <div className="relative">
            <Select
            options={options}
            placeholder="Select an option"
            className="dark:bg-dark-900"
            onChange={handleSelectChange}
            name="role"
            value={formData.role}/>
             <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon/>
             </span>
            {errors.role && (
              <p className="mt-1 text-xs text-red-500">{errors.role}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input 
          type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            required
            placeholder="info@gmail.com" />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
        </div>
        
        <div className="relative">
          <Label>Password Input</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Minimal 8 karakter"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              required
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
            </div>
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-2/3"
                 >
                {showPassword ? (
                  <Image 
                    src="/images/icons/eyes.svg" 
                    alt="icons" 
                    width={20} 
                    height={20} 
                  />
                ) : (
                  <Image 
                    src="/images/icons/eye-closed.svg" 
                    alt="icons" 
                    width={20} 
                    height={20} 
                  />
                )}
            </button>
          </div>

          <div>
              <Label>Select Status</Label>
              <div className="relative">
                <Select
                options={selectStatus}
                placeholder="Select an option"
                className="dark:bg-dark-900"
                onChange={handleSelect2Change}
                name="status"
                value={formData.status}/>
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon/>
                </span>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-500">{errors.status}</p>
                )}
              </div>
            </div>

             {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-4 py-2 bg-gray-400 hover:bg-white-700 text-black text-sm font-semibold rounded-lg transition"
              >
                Batal
              </button>
              <button type="submit" disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
                {loading ? "Menyimpan..." : "Simpan User"}
              </button>
        </div>
      </div>
      </form>
    </ComponentCard>
  );
}
