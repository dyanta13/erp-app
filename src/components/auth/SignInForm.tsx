"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Axios from "axios";
import api from "@/components/lib/axios"
import { useAuth } from "@/context/authContext";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { setUser } = useAuth();

  // State data input
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // State error validasi per-field
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
   
    // Handler untuk mengubah nilai input & menghapus error saat mengetik
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Hapus peringatan error khusus field ini jika user sudah mulai mengisi
        if (errors[name as keyof typeof errors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: '', password: '' };

        // Cek Email
        if (!formData.email.trim()) {
            newErrors.email = 'Email tidak boleh kosong!';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid!';
            isValid = false;
        }
        // Cek Password
        if (!formData.password) {
            newErrors.password = 'Password tidak boleh kosong!';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError('');

        // validasi frontend
        if (!validateForm()) {
            return; // Hentikan proses jika ada input yang belum diisi
        }
        setLoading(true);
        try {
            // 1. Ambil CSRF cookie dulu (wajib untuk Sanctum SPA)
            await api.get("/sanctum/csrf-cookie");

            // 2. Login
            await api.post("/api/login", formData);

            // 3. Ambil data user, simpan ke context
            const userRes = await api.get("/api/user");
            setUser(userRes.data);

            //await api.get('/sanctum/csrf-cookie');
            //await api.post('/api/login', formData);
            //await api.get('/api/user');
            router.push('/dashboard');
        } catch (err) {
            if (Axios.isAxiosError(err)) {
              if (err.response) {
                if (err.response.status === 422) {
                    // Tangkap error validasi dari Laravel (jika lolos dari frontend)
                    const backendErrors = err.response.data.errors || {};
                    setErrors({
                        email: backendErrors.email ? backendErrors.email[0] : '',
                        password: backendErrors.password ? backendErrors.password[0] : '',
                    });
                } else if (err.response.status === 401) {
                    setServerError('Email atau password salah.');
                } else {
                    setServerError('Terjadi kesalahan pada server.');
                }
              } else {
                  // Jika err.response undefined (misal server mati / CORS error)
                  setServerError('Gagal terhubung ke server backend.');
              }
            } else {
                setServerError('Terjadi kesalahan tidak terduga.');
            }
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">

        {serverError && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md flex items-center justify-between">
            <span>{serverError}</span>
            <button 
              type="button" 
              onClick={() => setServerError("")}
              className="text-red-700 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              ERP SYSTEM
            </h1>
        </div>
        
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                  placeholder="info@gmail.com" 
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required/>
                    {errors.email && (
                        <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
                            {errors.email}
                        </p>
                    )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      id="password"
                    />
                      {errors.password && (
                          <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', margin: '4px 0 0 0' }}>
                              {errors.password}
                          </p>
                      )}
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  {/*<Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>*/}
                </div>
                <div>
                  <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="sm">
                    {loading ? 'Memproses...' : ''}
                    Login
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-20">
              <p className="text-sm font-normal text-center text-gray-500 dark:text-gray-400 sm:text-center">
                © 2026 Erp System Integrated. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
