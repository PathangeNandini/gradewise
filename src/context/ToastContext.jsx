import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "info", duration = 2800) => {
    const id = ++idCounter;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="gw-toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`gw-toast gw-toast--${t.type}`} onClick={() => dismiss(t.id)}>
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);