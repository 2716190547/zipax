import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { MotionProvider } from "./components/motion/MotionProvider";
import "@heroui/react/styles";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/animations.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </React.StrictMode>,
);
