import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function renderBootError(error: unknown) {
  const root = document.getElementById("root");
  if (!root) return;

  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const stack = error instanceof Error && error.stack ? error.stack : "";
  root.innerHTML = `
    <main class="zipax-boot-error">
      <h1>zipax 启动失败</h1>
      <p>前端运行时发生错误，请把下面的信息发给开发者。</p>
      <pre>${escapeHtml(message + (stack ? `\n\n${stack}` : ""))}</pre>
    </main>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

class BootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: unknown | null }
> {
  state: { error: unknown | null } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown) {
    console.error("zipax render error", error);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error instanceof Error
        ? `${this.state.error.name}: ${this.state.error.message}`
        : String(this.state.error);
      const stack = this.state.error instanceof Error ? this.state.error.stack : "";
      return (
        <main className="zipax-boot-error">
          <h1>zipax 渲染失败</h1>
          <p>React 组件渲染时发生错误。</p>
          <pre>{message}{stack ? `\n\n${stack}` : ""}</pre>
        </main>
      );
    }

    return this.props.children;
  }
}

window.addEventListener("error", (event) => {
  renderBootError(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  renderBootError(event.reason);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element #root was not found");

  import("./App")
    .then(({ default: App }) => {
      ReactDOM.createRoot(rootElement).render(
        <BootErrorBoundary>
          <App />
        </BootErrorBoundary>
      );
    })
    .catch(renderBootError);
} catch (error) {
  renderBootError(error);
}
