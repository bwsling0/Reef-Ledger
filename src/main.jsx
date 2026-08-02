import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AuthGate from "./AuthGate.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthGate>
      {(user, onSignOut) => <App user={user} onSignOut={onSignOut} />}
    </AuthGate>
  </StrictMode>
);