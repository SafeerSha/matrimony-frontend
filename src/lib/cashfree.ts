/**
 * Cashfree JS SDK v3 Web Checkout Loader
 */

declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: '_modal' | '_self' | '_blank' | HTMLElement;
      }) => Promise<{
        error?: { message: string; code?: string };
        redirect?: boolean;
        paymentDetails?: any;
      }>;
    };
  }
}

let cashfreeSdkPromise: Promise<any> | null = null;

export const loadCashfree = (): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cashfree SDK can only be loaded in a browser environment'));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  if (cashfreeSdkPromise) {
    return cashfreeSdkPromise;
  }

  cashfreeSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Cashfree));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK loaded but Cashfree constructor is not available on window.'));
      }
    };
    script.onerror = () => {
      cashfreeSdkPromise = null;
      reject(new Error('Failed to load Cashfree checkout script from sdk.cashfree.com. Please check your connection.'));
    };
    document.head.appendChild(script);
  });

  return cashfreeSdkPromise;
};

export const getCashfreeMode = (): 'sandbox' | 'production' => {
  const env = (process.env.NEXT_PUBLIC_CASHFREE_ENV || 'TEST').toUpperCase();
  return env === 'PRODUCTION' || env === 'PROD' ? 'production' : 'sandbox';
};

export interface CashfreeCheckoutResult {
  error?: { message: string; code?: string };
  redirect?: boolean;
  paymentDetails?: any;
}

export const triggerCashfreeCheckout = async (
  paymentSessionId: string,
  options?: { redirectTarget?: '_modal' | '_self' },
): Promise<CashfreeCheckoutResult> => {
  const CashfreeConstructor = await loadCashfree();
  const mode = getCashfreeMode();
  const cashfree = CashfreeConstructor({ mode });

  return cashfree.checkout({
    paymentSessionId,
    redirectTarget: options?.redirectTarget || '_modal',
  });
};
