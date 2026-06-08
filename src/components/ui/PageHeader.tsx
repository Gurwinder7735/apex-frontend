"use client";

import { Typography } from "antd";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-4">
      <Typography.Title level={3}>{title}</Typography.Title>
      {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
    </div>
  );
}
