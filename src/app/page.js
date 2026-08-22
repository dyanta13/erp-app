import { redirect } from "next/navigation";

export default function RootPage() {
  // Contoh logika autentikasi sederhana
  // Di sini kamu bisa cek session / cookie server-side
  const isAuthenticated = false; // Ganti sesuai status auth

  if (isAuthenticated) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}