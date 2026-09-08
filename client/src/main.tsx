import { createRoot } from "react-dom/client";
import App from "./App";
import { applyStoredTheme } from "./lib/theme";
import "./index.css";

// Before the first paint, so the login screen is themed too.
//
// `applyStoredTheme` was written for exactly this -- its docstring says
// "called once at app start so the login screen is themed too, not only the
// pages behind the navigation bar" -- and nothing called it. The whole
// palette is a deep-space one and the first screen anybody sees was rendering
// in light mode: white inputs, a grey card, and a logo in a white box.
applyStoredTheme();

createRoot(document.getElementById("root")!).render(<App />);
