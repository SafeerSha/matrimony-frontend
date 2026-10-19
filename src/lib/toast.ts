export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  persistOnRedirect?: boolean;
  onClick?: () => void;
  avatarUrl?: string | null;
  actionLabel?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
  createdAt: number;
  onClick?: () => void;
  avatarUrl?: string | null;
  actionLabel?: string;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private flashKey = "matrimony_flash_toast";

  constructor() {
    if (typeof window !== "undefined") {
      // Check for flash toast on load
      try {
        const stored = sessionStorage.getItem(this.flashKey);
        if (stored) {
          sessionStorage.removeItem(this.flashKey);
          const parsed = JSON.parse(stored);
          if (parsed && parsed.title) {
            setTimeout(() => {
              this.show(parsed.type || "success", parsed.title, parsed);
            }, 300);
          }
        }
      } catch {
        // Ignore sessionStorage access errors
      }
    }
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const copy = [...this.toasts];
    this.listeners.forEach((listener) => listener(copy));
  }

  public dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  public show(
    type: ToastType,
    title: string,
    options?: string | ToastOptions
  ): string {
    const id = (typeof options === "object" && options?.id) || Math.random().toString(36).substring(2, 9);
    const description =
      typeof options === "string"
        ? options
        : typeof options === "object"
        ? options.description
        : undefined;
    const duration =
      typeof options === "object" && options && options.duration !== undefined
        ? options.duration
        : 4500;
    const persistOnRedirect =
      typeof options === "object" && options ? options.persistOnRedirect : false;

    if (persistOnRedirect && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          this.flashKey,
          JSON.stringify({ type, title, description, duration })
        );
      } catch {
        // ignore
      }
    }

    const onClick = typeof options === "object" && options ? options.onClick : undefined;
    const avatarUrl = typeof options === "object" && options ? options.avatarUrl : undefined;
    const actionLabel = typeof options === "object" && options ? options.actionLabel : undefined;

    const toastItem: ToastItem = {
      id,
      type,
      title,
      description,
      duration,
      createdAt: Date.now(),
      onClick,
      avatarUrl,
      actionLabel,
    };

    // Keep up to 5 toasts active
    this.toasts = [toastItem, ...this.toasts.slice(0, 4)];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  public flash(
    type: ToastType,
    title: string,
    options?: string | ToastOptions
  ) {
    const opts = typeof options === "string" ? { description: options } : options || {};
    return this.show(type, title, { ...opts, persistOnRedirect: true });
  }

  public success(title: string, options?: string | ToastOptions) {
    return this.show("success", title, options);
  }

  public error(title: string, options?: string | ToastOptions) {
    return this.show("error", title, options);
  }

  public warning(title: string, options?: string | ToastOptions) {
    return this.show("warning", title, options);
  }

  public info(title: string, options?: string | ToastOptions) {
    return this.show("info", title, options);
  }
}

export const toast = new ToastManager();
