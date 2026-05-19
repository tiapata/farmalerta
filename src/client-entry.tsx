import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start";
import { startInstance } from "./start";
import "./styles.css";

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<StartClient start={startInstance} />);
}
