"use client";

import { useEffect, useState } from "react";
import api from "@/components/lib/axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch data user yang sedang tersinkronisasi session/tokennya
        const response = await api.get("/api/user");
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}