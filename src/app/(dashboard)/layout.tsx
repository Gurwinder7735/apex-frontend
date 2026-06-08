"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout/DashboardLayout";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectIsAuthenticated } from "@/store/modules/auth/authSelectors";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(APP_ROUTES.login);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
