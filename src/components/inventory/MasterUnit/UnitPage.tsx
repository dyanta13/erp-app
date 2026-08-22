"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import api from "@/components/lib/axios";
import Axios from "axios";
import toast from "react-hot-toast";
import Pagination from "@/components/tables/Pagination";

interface Unit {
  id: number;
  code: string;
  description: string;
}

export default function UnitPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // State Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Fetch Data Master Unit
  const fetchUnits = async (page = 1) => {
    setLoading(true);
    try {
      //const response = await api.get("/api/master_unit");
      const response = await api.get('/api/master_unit', {
        params: {
          page: page,
        },
      });
      if (response.data.success) {
        const paginatedData = response.data.data;
        setUnits(paginatedData?.data || []);
        setTotalPages(paginatedData?.last_page || 1);
        setCurrentPage(paginatedData?.current_page || 1);
        //setUnits(paginatedObject.data);
        //setUnits(response.data.data);
      }
    } catch (err) {
      toast.error("Gagal mengambil data Master Unit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // 2. Open Modal (Tambah / Edit)
  const handleOpenModal = (unit?: Unit) => {
    setErrors({});
    if (unit) {
      setEditingId(unit.id);
      setFormData({
        code: unit.code,
        description: unit.description,
      });
    } else {
      setEditingId(null);
      setFormData({ code: "", description: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Submit Form (Store / Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});

    try {
      await api.get("/sanctum/csrf-cookie");

      if (editingId) {
        // Mode Edit (PUT)
        const res = await api.put(`/api/master_unit/${editingId}`, formData);
        if (res.data.success) {
          toast.success("Master Unit berhasil diperbarui!");
        }
      } else {
        // Mode Tambah (POST)
        const res = await api.post("/api/master_unit", formData);
        if (res.data.success) {
          toast.success("Master Unit berhasil ditambahkan!");
        }
      }

      handleCloseModal();
      fetchUnits();
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
      setSubmitLoading(false);
    }
  };

  // 4. Hapus Data (DELETE)
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus unit ini?")) return;

    try {
      const res = await api.delete(`/api/master_unit/${id}`);
      if (res.data.success) {
        toast.success("Master Unit berhasil dihapus!");
        fetchUnits();
      }
    } catch (err) {
      toast.error("Gagal menghapus data unit.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        fetchUnits(page);
      //setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Management Master Unit
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          + Tambah Unit
        </button>
      </div>

      <ComponentCard title="Daftar Satuan / Unit">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">
            Memuat data unit...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Kode Unit</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Belum ada data Master Unit.
                    </td>
                  </tr>
                ) : (
                  units.map((unit, index) => (
                    <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {unit.code}
                      </td>
                      <td className="py-3 px-4">{unit.description}</td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(unit)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>

      {/* --- MODAL FORM TAMBAH / EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingId ? "Edit Master Unit" : "Tambah Master Unit"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Kode Unit (Singkatan)</Label>
                <Input
                  type="text"
                  name="code"
                  placeholder="Contoh: PCS, BOX, KG"
                  value={formData.code}
                  onChange={handleChange}
                  error={!!errors.code}
                  required
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
              </div>

              <div>
                <Label>Nama Unit</Label>
                <Input
                  type="text"
                  name="description"
                  placeholder="Contoh: Pieces, Box, Kilogram"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  required
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitLoading}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 text-gray-800 dark:text-gray-200 text-sm font-semibold rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                >
                  {submitLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Render Komponen Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-end p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}