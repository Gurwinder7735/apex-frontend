"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { hydrateAuth } from "@/store/modules/auth/authSlice";
import { storage } from "@/lib/utils/storage";
import axiosInstance from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export function HydrateAuth({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = storage.getAccessToken();
    const refreshToken = storage.getRefreshToken();
    if (token) {
      fetchUser().then((user) => {
        if (user) {
          dispatch(hydrateAuth({ token, user }));
          setReady(true);
        } else if (!refreshToken) {
          storage.clearAll();
          document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
          router.push("/login");
        } else {
          setReady(true);
        }
      });
    } else {
      setReady(true);
    }
  }, [dispatch, router]);

  if (!ready) return null;

  return <>{children}</>;
}

async function fetchUser() {
  try {
    const response = await axiosInstance.get<{ data: { id: string; name: string; email: string; roles: string[]; isActive: boolean } }>(
      API_ENDPOINTS.auth.me,
    );
    return response.data.data ?? null;
  } catch {
    return null;
  }
}
