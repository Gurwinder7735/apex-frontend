"use client";

import { useEffect } from "react";
import { Card, Typography, Alert } from "antd";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/forms/RegisterForm/RegisterForm";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { registerRequest, clearError } from "@/store/modules/auth/authSlice";
import { selectAuth } from "@/store/modules/auth/authSelectors";
import type { RegisterSchemaValues } from "@/lib/utils/validators";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, error } = useAppSelector(selectAuth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.clients);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleSubmit = (values: RegisterSchemaValues) => {
    dispatch(registerRequest({
      name: values.name,
      email: values.email,
      password: values.password,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <Typography.Title level={3}>Create account</Typography.Title>
        {error && (
          <Alert message={error} type="error" showIcon closable className="mb-4" />
        )}
        <RegisterForm isLoading={isLoading} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
