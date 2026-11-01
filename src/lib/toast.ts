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

  public dismissAll() {
    this.toasts = [];
    this.notify();
  }

  public show(
    type: ToastType,
    title: string,
    options?: string | ToastOptions
  ): string {
    const cleanTitle = (title || "").trim();
    if (!cleanTitle) return "";

    // DEDUPLICATION: Prevent duplicate toasts with the same title from appearing at the same time
    const now = Date.now();
    const existing = this.toasts.find(
      (t) =>
        t.title.toLowerCase() === cleanTitle.toLowerCase() &&
        (t.description || "").toLowerCase() === (description || "").toLowerCase()
    );
    if (existing && now - existing.createdAt < 1500) {
      // Already showing an identical toast recently
      return existing.id;
    }

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
          JSON.stringify({ type, title: cleanTitle, description, duration })
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
      title: cleanTitle,
      description,
      duration,
      createdAt: now,
      onClick,
      avatarUrl,
      actionLabel,
    };

    // Keep up to 3 active toasts (instead of cluttering the screen)
    this.toasts = [toastItem, ...this.toasts.slice(0, 2)];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  /**
   * Stores a flash toast in sessionStorage to be displayed ONCE on the next page after redirect.
   * Does NOT show on the current page to prevent duplicate notifications.
   */
  public flash(
    type: ToastType,
    title: string,
    options?: string | ToastOptions
  ) {
    if (typeof window !== "undefined") {
      try {
        const description =
          typeof options === "string"
            ? options
            : typeof options === "object"
            ? options.description
            : undefined;
        const duration =
          typeof options === "object" && options?.duration !== undefined
            ? options.duration
            : 4500;
        sessionStorage.setItem(
          this.flashKey,
          JSON.stringify({ type, title, description, duration })
        );
      } catch {}
    }
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
