"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: "border-gain text-gain",
  error: "border-loss text-loss",
  warning: "border-brand-accent text-brand-accent",
  info: "border-brand-primary text-brand-primary",
};

const durations: Record<ToastType, number | null> = {
  success: 4000,
  error: null,
  warning: 6000,
  info: 4000,
};

let addToastExternal: ((toast: Omit<Toast, "id">) => void) | null = null;

export function toast(props: Omit<Toast, "id">) {
  addToastExternal?.(props);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((props: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-2), { ...props, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = icons[t.type];
  const duration = durations[t.type];

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onDismiss(t.id), duration);
      return () => clearTimeout(timer);
    }
  }, [t.id, duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      className={cn(
        "bg-bg-elevated border-l-4 rounded-lg p-3 shadow-lg flex items-start gap-3",
        styles[t.type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{t.title}</p>
        {t.description && (
          <p className="text-xs text-text-secondary mt-0.5">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-text-secondary hover:text-text-primary shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
      {duration && (
        <motion.div
          className={cn("absolute bottom-0 left-0 h-0.5 rounded-b-lg", {
            "bg-gain": t.type === "success",
            "bg-loss": t.type === "error",
            "bg-brand-accent": t.type === "warning",
            "bg-brand-primary": t.type === "info",
          })}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}
