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
    // 10-second timeout guard to prevent UI hanging if CDN or network is blocked
    const timeoutId = setTimeout(() => {
      cashfreeSdkPromise = null;
      reject(new Error('Cashfree checkout script timed out. Please check your connection or ad blocker.'));
    }, 10000);

    const existingScript = document.querySelector('script[src*="cashfree.js"]');
    if (existingScript) {
      if (window.Cashfree) {
        clearTimeout(timeoutId);
        return resolve(window.Cashfree);
      }
      existingScript.addEventListener('load', () => {
        clearTimeout(timeoutId);
        resolve(window.Cashfree);
      });
      existingScript.addEventListener('error', (err) => {
        clearTimeout(timeoutId);
        cashfreeSdkPromise = null;
        reject(err);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      clearTimeout(timeoutId);
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        cashfreeSdkPromise = null;
        reject(new Error('Cashfree SDK loaded but Cashfree constructor is not available on window.'));
      }
    };
    script.onerror = () => {
      clearTimeout(timeoutId);
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

  const target = options?.redirectTarget || '_modal';

  try {
    return await cashfree.checkout({
      paymentSessionId,
      redirectTarget: target,
    });
  } catch (err: any) {
    // If modal checkout is blocked by browser/mobile device, fallback to full page redirect
    if (target === '_modal') {
      console.warn('Cashfree modal checkout issue, attempting _self redirect fallback:', err);
      return await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    }
    throw err;
  }
};
