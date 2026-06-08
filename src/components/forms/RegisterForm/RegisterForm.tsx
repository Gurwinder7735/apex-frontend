"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input } from "antd";
import { Controller, useForm } from "react-hook-form";
import { registerSchema, type RegisterSchemaValues } from "@/lib/utils/validators";

interface RegisterFormProps {
  isLoading?: boolean;
  onSubmit: (values: RegisterSchemaValues) => void;
}

export function RegisterForm({ isLoading, onSubmit }: RegisterFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="w-full">
      <Form.Item
        label="Name"
        validateStatus={errors.name ? "error" : ""}
        help={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} size="large" placeholder="John Doe" />}
        />
      </Form.Item>
      <Form.Item
        label="Email"
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input {...field} size="large" placeholder="name@example.com" />
          )}
        />
      </Form.Item>
      <Form.Item
        label="Password"
        validateStatus={errors.password ? "error" : ""}
        help={errors.password?.message}
      >
        <Controller
          name="password"
          control={control}
          render={({ field }) => <Input.Password {...field} size="large" placeholder="Min. 8 characters" />}
        />
      </Form.Item>
      <Form.Item
        label="Confirm Password"
        validateStatus={errors.confirmPassword ? "error" : ""}
        help={errors.confirmPassword?.message}
      >
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => <Input.Password {...field} size="large" placeholder="Repeat your password" />}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
        Create account
      </Button>
    </Form>
  );
}
