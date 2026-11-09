declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeInstance {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget?: '_modal' | '_self' | '_blank' | HTMLElement;
    }) => Promise<{
      error?: { message: string; code?: string };
      redirect?: boolean;
      paymentDetails?: any;
    }>;
  }

  export function load(options: { mode: 'sandbox' | 'production' }): Promise<CashfreeInstance>;
}

