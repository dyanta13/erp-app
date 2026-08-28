"use client";

import { useAuth } from "@/context/authContext";


export const WelcomePage = () => {
  //const { user, loading } = useAuth();
  const { user, loading, logout } = useAuth();
  
    if (loading) return <p className="p-6 animate-pulse">Memuat data user...</p>;
    if (!user) return <p className="p-6 animate-pulse">Belum login.</p>;

  //if (loading) {
    //return <p className="p-6 animate-pulse">Memuat data user...</p>;
  //}

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Selamat Datang, {user?.name || "User"}! 👋
        </h1>
        {/*<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          User ID: <span className="font-semibold text-blue-600">{user?.id}</span> | Role: <span className="capitalize font-semibold">{user?.role}</span>
        </p>*/}    
      </div>
    </div>
  );
}