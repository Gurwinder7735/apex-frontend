"use client";

import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { App, ConfigProvider, theme } from "antd";
import { store } from "@/store";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { HydrateAuth } from "@/components/common/HydrateAuth";


export default function Providers({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <HydrateAuth>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#1677ff",
              borderRadius: 8,
            },
          }}
        >
          <AntdRegistry>
          <App>{children}</App>
          </AntdRegistry>
        </ConfigProvider>
      </HydrateAuth>
    </Provider>
  );
}
