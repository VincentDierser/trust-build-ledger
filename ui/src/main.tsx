import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set HTML language to English to ensure wallet connection UI uses English
document.documentElement.lang = "en";

createRoot(document.getElementById("root")!).render(<App />);
