"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import api from "@/components/lib/axios";
import Axios from "axios";
import toast from "react-hot-toast";
import Pagination from "@/components/tables/Pagination";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface Category {
  id: number;
  code: string;
  name: string;
  description: string;
}

export default function CategoryPage() {
  const [categorys, setCategorys] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCategory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/master_category");
      if (response.data.success) {
        //setCategorys(response.data.data);
        const paginatedData = response.data.data;
        setCategorys(response.data.data);
        setCategorys(paginatedData?.data || []);
        setTotalPages(paginatedData?.last_page || 1);
        setCurrentPage(paginatedData?.current_page || 1);
      }
    } catch {
      toast.error("Gagal mengambil data Master Category.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const handleOpenModal = (category?: Category) => {
    setErrors({});
    if (category) {
      setEditingId(category.id);
      setFormData({
        code: category.code,
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({ code: "", name: "", description: "" });
    }
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);
    setErrors({});

    try {
      await api.get("/sanctum/csrf-cookie");

      if (editingId) {
        const res = await api.put(`/api/master_category/${editingId}`, formData);
        if (res.data.success) {
          toast.success("Master Category berhasil diperbarui!");
        }
      } else {
        const res = await api.post("/api/master_category", formData);
        if (res.data.success) {
          toast.success("Master Category berhasil ditambahkan!");
        }
      }

      handleCloseModal();
      fetchCategory();
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

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus category ini?")) return;

    try {
      const res = await api.delete(`/api/master_category/${id}`);
      if (res.data.success) {
        toast.success("Master Category berhasil dihapus!");
        fetchCategory();
      }
    } catch (err) {
      toast.error("Gagal menghapus data category.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        fetchCategory(page);
      //setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          + Tambah Category
        </button>
      </div>

      <ComponentCard title="Daftar Category">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">
            Memuat data category...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Category</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {categorys.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Belum ada data Master Category.
                    </td>
                  </tr>
                ) : (
                  categorys.map((cat, index) => (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {cat.code}
                      </td>
                      <td className="py-3 px-4 font-semibold">{cat.name}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{cat.description || "-"}</td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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

      {/* --- MODAL FORM --- */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[450px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 mb-2 dark:bg-gray-900 lg:p-11">
            <div className="flex justify-between items-center p-2 pb-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingId ? "Edit Master Segment" : "Tambah Master Segment"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Kode Category (Max 10 Char)</Label>
                <Input
                  type="text"
                  name="code"
                  placeholder="Contoh: ACC, PRT, DRK"
                  value={formData.code}
                  onChange={handleChange}
                  error={!!errors.code}
                  required
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
              </div>

              <div>
                <Label>Nama Category</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Contoh: Accessories, Peralatan"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <Label>Deskripsi (Opsional)</Label>
                <Input
                  type="text"
                  name="description"
                  placeholder="Keterangan singkat"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                />
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
      </Modal>
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