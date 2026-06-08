"use client";

import { Component, ReactNode } from "react";
import { Result } from "antd";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public render() {
    if (this.state.hasError) {
      return <Result status="error" title="Something went wrong." />;
    }

    return this.props.children;
  }
}
