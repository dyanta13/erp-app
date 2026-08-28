"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import api from "@/components/lib/axios";
import Axios from "axios";
import toast from "react-hot-toast";

interface Option {
  value: string;
  label: string;
  code?: string;
}

export default function AddItem() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    segment_id: "",
    barcode: "",
    hpp: "",
    vendor_id: "",
    status: "active",
  });

  const [generatedSku, setGeneratedSku] = useState<string>("AUTOMATIC");
  const [categories, setCategories] = useState<Option[]>([]);
  const [segments, setSegments] = useState<Option[]>([]);
  const [vendors, setVendors] = useState<Option[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "nonactive", label: "Non Active" },
  ];

  // Fetch Option Dropdowns
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, segRes, venRes] = await Promise.all([
          api.get("/api/master_category"),
          api.get("/api/master_segment"),
          api.get("/api/master_vendor"),
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.data.map((c: any) => ({ value: c.id.toString(), label: c.name, code: c.code || c.name.slice(0, 3) })));
        }
        if (segRes.data.success) {
          setSegments(segRes.data.data.map((s: any) => ({ value: s.id.toString(), label: s.name, code: s.code || s.name.slice(0, 3) })));
        }
        if (venRes.data.success) {
          setVendors(venRes.data.data.map((v: any) => ({ value: v.id.toString(), label: v.name })));
        }
      } catch {
        toast.error("Gagal memuat master data.");
      }
    };

    fetchMasterData();
  }, []);

  // SKU Generator
  useEffect(() => {
    if (formData.category_id && formData.segment_id) {
      const selectedCat = categories.find((c) => c.value === formData.category_id);
      const selectedSeg = segments.find((s) => s.value === formData.segment_id);

      const catCode = (selectedCat?.code || "CAT").slice(0, 3).toUpperCase();
      const segCode = (selectedSeg?.code || "SEG").slice(0, 3).toUpperCase();

      setGeneratedSku(`${catCode}-${segCode}-XXX`);
    } else {
      setGeneratedSku("AUTOMATIC");
    }
  }, [formData.category_id, formData.segment_id, categories, segments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.get("/sanctum/csrf-cookie");
      const response = await api.post("/api/master_item", formData);

      if (response.data.success) {
        toast.success(`Item berhasil disimpan dengan SKU: ${response.data.data.sku}`);
        setTimeout(() => {
          router.push("/itemPage");
          router.refresh();
        }, 1500);
      }
    } catch (err: unknown) {
      if (Axios.isAxiosError(err) && err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        const formattedErrors: Record<string, string> = {};
        Object.keys(backendErrors).forEach((key) => {
          formattedErrors[key] = backendErrors[key][0];
        });
        setErrors(formattedErrors);
        toast.error("Periksa kembali form yang diisi.");
      } else {
        toast.error("Terjadi kesalahan pada server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Input Master Item">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Name */}
          <div className="md:col-span-2">
            <Label>Nama Item</Label>
            <Input
              type="text"
              name="name"
              placeholder="Masukkan nama item"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              required
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <Select
              options={categories}
              placeholder="Select Category"
              value={formData.category_id}
              onChange={(val) => setFormData((prev) => ({ ...prev, category_id: val }))}
              name="category_id"
            />
            {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
          </div>

          {/* Segment */}
          <div>
            <Label>Segment</Label>
            <Select
              options={segments}
              placeholder="Select Segment"
              value={formData.segment_id}
              onChange={(val) => setFormData((prev) => ({ ...prev, segment_id: val }))}
              name="segment_id"
            />
            {errors.segment_id && <p className="mt-1 text-xs text-red-500">{errors.segment_id}</p>}
          </div>

          {/* Auto Generated SKU (Read Only) */}
          <div>
            <Label>Generated SKU (Otomatis)</Label>
            <Input
              type="text"
              value={generatedSku}
              disabled
              className="bg-gray-100 font-bold text-blue-600 dark:bg-gray-800 dark:text-blue-400 cursor-not-allowed"
            />
          </div>

          {/* Barcode */}
          <div>
            <Label>Barcode (Opsional)</Label>
            <Input
              type="text"
              name="barcode"
              placeholder="Scan / Masukkan Barcode"
              value={formData.barcode}
              onChange={handleChange}
              error={!!errors.barcode}
            />
            {errors.barcode && <p className="mt-1 text-xs text-red-500">{errors.barcode}</p>}
          </div>

          {/* HPP */}
          <div>
            <Label>HPP</Label>
            <Input
              type="number"
              name="hpp"
              placeholder="Masukkan Hpp"
              value={formData.hpp}
              onChange={handleChange}
              error={!!errors.hpp}
            />
            {errors.hpp && <p className="mt-1 text-xs text-red-500">{errors.hpp}</p>}
          </div>

          {/* Vendor Dropdown */}
          <div>
            <Label>Vendor</Label>
            <Select
              options={vendors}
              placeholder="Select Vendor"
              value={formData.vendor_id}
              onChange={(val) => setFormData((prev) => ({ ...prev, vendor_id: val }))}
              name="vendor_id"
            />
            {errors.vendor_id && <p className="mt-1 text-xs text-red-500">{errors.vendor_id}</p>}
          </div>

          {/* Status Dropdown */}
          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              placeholder="Select Status"
              value={formData.status}
              onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
              name="status"
            />
            {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
          </div>
        </div>

        {/* Buttons */}
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
            {loading ? "Menyimpan..." : "Simpan Item"}
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}