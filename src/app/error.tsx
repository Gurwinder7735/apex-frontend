"use client";

import { Result } from "antd";

export default function Error() {
  return <Result status="error" title="Unexpected error" />;
}
