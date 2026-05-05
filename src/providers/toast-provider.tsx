import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type ToastTone = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  actionHref?: string | null;
  actionLabel?: string;
};

type ShowToastInput = Omit<Toast, 'id'>;

type ToastContextValue = {
  showToast: (toast: ShowToastInput) => void;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastTone, string> = {
  success: 'border-emerald-400/25 bg-emerald-500/12 text-emerald-50',
  error: 'border-rose-400/25 bg-rose-500/12 text-rose-50',
  info: 'border-sky-400/25 bg-sky-500/12 text-sky-50',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ShowToastInput) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { ...toast, id }]);

      window.setTimeout(() => {
        dismissToast(id);
      }, 5000);
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl shadow-slate-950/30 backdrop-blur ${toneClasses[toast.tone]}`}
            key={toast.id}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm text-white/80">{toast.description}</p>
                )}
                {toast.actionHref && toast.actionLabel && (
                  <a
                    className="mt-3 inline-flex text-sm font-medium text-white underline underline-offset-4"
                    href={toast.actionHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {toast.actionLabel}
                  </a>
                )}
              </div>

              <button
                className="text-sm text-white/70 transition hover:text-white"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
