"use client";
import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import axios from '@/components/lib/axios';
import { useRouter } from "next/navigation";
import Pagination from '@/components/tables/Pagination';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export const UserPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 1. State untuk Filter Pencarian & Role
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // State Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get('/api/users', {
        params: {
          page: page,
          search: searchQuery || undefined,
          role: selectedRole !== "ALL" ? selectedRole : undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        },
      });
      if (response.data.success) {
        // Ambil data array dengan fallback array kosong `|| []` agar terhindar dari undefined
        const paginatedData = response.data.data;
        setUsers(paginatedData?.data || []);
        setTotalPages(paginatedData?.last_page || 1);
        setCurrentPage(paginatedData?.current_page || 1);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      setErrorMessage("Gagal memuat data user dari server.");
      setUsers([]); // Reset ke array kosong jika error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(currentPage);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchQuery, selectedRole, selectedStatus]);

  // Reset ke halaman 1 jika filter/search berubah
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Filter client-side sebagai perlindungan tambahan
  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter((user) => {
    const matchesName = user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;
    const matchesStatus = selectedStatus === "ALL" || user.status === selectedStatus;
    return matchesName && matchesRole && matchesStatus;
  });

  const handleNavigateToAddUser = () => {
    // Kamu bisa tambah logika di sini jika ada pengecekan sebelum navigasi
    router.push("/addUser");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">

      <div className="flex flex-col sm:flex-row gap-3 p-2">
          {/* Input Pencarian Nama */}
          <input
            type="text"
            placeholder="Cari berdasarkan nama..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />

          {/* Filter Dropdown Role */}
          <select
            value={selectedRole}
            onChange={handleRoleChange}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Role</option>
            <option value="user">User</option>
            <option value="Kasir">Kasir</option>
            <option value="Admin">Admin</option>
          </select>

          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="active">Active</option>
            <option value="nonactive">Non Active</option>
          </select>

          <button
            onClick={() => fetchUsers(currentPage)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Refresh
          </button>

          <button
          onClick={handleNavigateToAddUser}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
            Add User
          </button>
       </div>

      {/* Pesan Error */}
      {errorMessage && (
        <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* State Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 font-medium animate-pulse">Memuat data user...</p>
        </div>

      ) : (
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[750px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  No
                </TableCell>
                <TableCell isHeader className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs">
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  User
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {/* Kita gunakan 'filteredUsers' di sini, bukan 'users' */}
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="py-2 px-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {(currentPage - 1) * 10 + (index + 1)}
                  </TableCell>
                  <TableCell className="px-2 py-3 text-start">
                      <button
                        onClick={() => router.push(`/editUser/${user.id}`)}
                        className="px-1 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded transition"
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                            fill=""
                          />
                        </svg>
                      </button>
                  </TableCell>
                  <TableCell className="px-3 py-3 sm:px-4 text-start">
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {user.name}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        user.status === "active"
                          ? "success"
                          : user.status === "nonactive"
                          ? "warning"
                          : "error"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Tidak ada pengguna yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
            </TableBody>
          </Table>
        </div>
      </div>
      )}
      {/* Render Komponen Pagination */}
      {!isLoading && totalPages > 1 && (
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
