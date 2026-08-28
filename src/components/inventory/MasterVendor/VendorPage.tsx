"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import api from "@/components/lib/axios";
import Axios from "axios";
import toast from "react-hot-toast";
import Pagination from "@/components/tables/Pagination";
import { EnvelopeIcon } from "@/icons";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";

interface Vendor {
  id: number;
  code: string;
  name: string;
  phone: string; 
  address: string;
  email: string;
}

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fetchVendor = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/master_vendor");
      if (response.data.success) {
        const paginatedData = response.data.data;
        setVendors(response.data.data);
        setVendors(paginatedData?.data || []);
        setTotalPages(paginatedData?.last_page || 1);
        setCurrentPage(paginatedData?.current_page || 1);
      }
    } catch {
      toast.error("Gagal mengambil data Master Vendor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, []);

  const handleOpenModal = (vendor?: Vendor) => {
    setErrors({});
    if (vendor) {
      setEditingId(vendor.id);
      setFormData({
        code: vendor.code,
        name: vendor.name,
        phone: vendor.phone || "",
        address: vendor.phone || "",
        email: vendor.phone || "",
      });
    } else {
      setEditingId(null);
      setFormData({ code: "", name: "", phone: "", address: "", email: "" });
    }
    openModal();
    //setIsModalOpen(true);
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
        const res = await api.put(`/api/master_vendor/${editingId}`, formData);
        if (res.data.success) {
          toast.success("Master Vendor berhasil diperbarui!");
        }
      } else {
        const res = await api.post("/api/master_vendor", formData);
        if (res.data.success) {
          toast.success("Master Vendor berhasil ditambahkan!");
        }
      }

      closeModal();
      fetchVendor();

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
    if (!confirm("Apakah Anda yakin ingin menghapus vendor ini?")) return;

    try {
      const res = await api.delete(`/api/master_vendor/${id}`);
      if (res.data.success) {
        toast.success("Master Vendor berhasil dihapus!");
        fetchVendor();
      }
    } catch (err) {
      toast.error("Gagal menghapus data vendor.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        fetchVendor(page);
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
          + Tambah Vendor
        </button>
      </div>

      <ComponentCard title="Daftar Vendor">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">
            Memuat data vendor...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama vendor</th>
                  <th className="py-3 px-4">No. Telp</th>
                  <th className="py-3 px-4">Alamat</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Belum ada data Master Vendor.
                    </td>
                  </tr>
                ) : (
                  vendors.map((ven, index) => (
                    <tr key={ven.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {ven.code}
                      </td>
                      <td className="py-3 px-4 font-semibold">{ven.name}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{ven.phone || "-"}</td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          onClick={() => handleOpenModal(ven)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ven.id)}
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
       <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 mb-2 dark:bg-gray-900 lg:p-11">
            <div className="flex justify-between items-center pb-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                {editingId ? "Edit Master Vendor" : "Tambah Master Vendor"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Kode Vendor</Label>
                <Input
                  type="text"
                  name="code"
                  placeholder="Contoh: 001, 101, 1001"
                  value={formData.code}
                  onChange={handleChange}
                  error={!!errors.code}
                  required
                />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
              </div>

              <div>
                <Label>Nama Vendor</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder=""
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  required
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <Label>Phone</Label>
                <Input
                  type="number"
                  name="phone"
                  placeholder="Nomor Hp/Telp Vendor"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  required
                />
              </div>

              <div>
                <Label>Alamat</Label>
                <Input
                  type="text"
                  name="address"
                  placeholder="Jl..."
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  required
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              <div>
                  <Label>Email</Label>
                    <div className="relative">
                        <Input
                        name="email"
                        placeholder="info@gmail.com"
                        type="text"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!errors.email}
                        className="pl-[62px]"
                        />
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            <EnvelopeIcon />
                        </span>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                   </div>
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