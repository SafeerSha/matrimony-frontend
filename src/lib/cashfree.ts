/**
 * Cashfree JS SDK Checkout Loader using official @cashfreepayments/cashfree-js
 */
import { load } from '@cashfreepayments/cashfree-js';

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
  const mode = getCashfreeMode();
  const cashfree = await load({ mode });

  if (!cashfree) {
    throw new Error(
      'Cashfree checkout SDK could not be loaded. Please ensure your dev server was restarted so Content-Security-Policy changes take effect.',
    );
  }

  // Auto-detect mobile device or small viewport for reliable payment completion
  const isMobile =
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 ||
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  const target = options?.redirectTarget || (isMobile ? '_self' : '_modal');

  try {
    return await cashfree.checkout({
      paymentSessionId,
      redirectTarget: target,
    });
  } catch (err: any) {
    // If modal is blocked on mobile device, gracefully fallback to full page redirect
    if (target === '_modal') {
      console.warn('Cashfree modal checkout encountered an issue, falling back to _self redirect:', err);
      return await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
      });
    }
    throw err;
  }
};
