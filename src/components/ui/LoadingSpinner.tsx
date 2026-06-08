"use client";

import { Spin } from "antd";

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <Spin size="large" />
    </div>
  );
}
