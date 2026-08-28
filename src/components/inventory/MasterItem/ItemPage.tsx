"use client";

import React, { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import api from "@/components/lib/axios";
import Axios from "axios";
import toast from "react-hot-toast";
import Pagination from "@/components/tables/Pagination";


interface Item {
  id: number;
  code: string;
  barcode: string;
  name: string;
  category: string; 
  segment: string;
  vendor: string;
}

export default function ItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [formData, setFormData] = useState({
    code: "",
    barcode: "",
    name: "",
    category: "",
    segment: "",
    vendor: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fetchItem = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/master_item");
      if (response.data.success) {
        const paginatedData = response.data.data;
        setItems(response.data.data);
        setItems(paginatedData?.data || []);
        setTotalPages(paginatedData?.last_page || 1);
        setCurrentPage(paginatedData?.current_page || 1);
      }
    } catch {
      toast.error("Gagal mengambil data Master Item.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, []);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
        fetchItem(page);
      //setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
          {/* Input Pencarian Nama */}
          <input
            type="text"
            placeholder="Cari berdasarkan nama/code/barcode..."
            //value={searchQuery}
            //onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />

          {/* Filter Dropdown Role */}
          <select
            //value={selectedRole}
            //onChange={handleRoleChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Category</option>
          </select>

          <select
            //value={selectedStatus}
            //onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="nonactive">Non Active</option>
          </select>

          <button
            onClick={() => fetchItem(currentPage)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Refresh
          </button>

          <button
          //onClick={""}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          + Tambah Item
        </button>
       </div>

      <ComponentCard title="Daftar Master Item">
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">
            Memuat data master item...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Barcode</th>
                  <th className="py-3 px-4">Nama Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Segment</th>
                  <th className="py-3 px-4">Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Belum ada data Master Item.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium">{(currentPage - 1) * 10 + index + 1}</td>
                      <td className="py-3 px-4 text-center space-x-2">
                        <button
                          //onClick={}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded transition"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                        {item.code}
                      </td>
                      <td className="py-3 px-4 font-semibold">{item.barcode}</td>
                      <td className="py-3 px-4 font-semibold">{item.name}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{item.category || "-"}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{item.segment || "-"}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{item.vendor || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>

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