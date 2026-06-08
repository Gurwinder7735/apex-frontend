"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Result, Button } from "antd";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectIsAuthenticated, selectIsAdmin } from "@/store/modules/auth/authSelectors";
import { APP_ROUTES } from "@/lib/constants/appConstants";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback }: AdminGuardProps) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(APP_ROUTES.login);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle="You do not have admin privileges to view this page."
        extra={
          <Button type="primary" onClick={() => router.push(APP_ROUTES.clients)}>
            Back to Clients
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
