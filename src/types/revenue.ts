export type RevenuePreset = 'today' | '7d' | '30d' | '90d' | 'ytd' | 'all' | 'custom';

export interface RevenueDateRange {
  preset: string;
  from: string;
  to: string;
  timezone?: string;
  previousPeriod?: {
    from: string;
    to: string;
  } | null;
}

export interface RevenueOverviewResponse {
  range: RevenueDateRange;
  grossRevenue: {
    current: number;
    previous: number | null;
    deltaPct: number | null;
    currency: string;
  };
  mrr: {
    current: number;
    currency: string;
  };
  arppu: {
    current: number;
    previous: number | null;
    deltaPct: number | null;
    currency: string;
    payingUsersCount: number;
  };
  paidSubscribers: {
    activePaidCount: number;
    newPaidInPeriod: number;
    prevNewPaidInPeriod: number | null;
    deltaPct: number | null;
  };
  successRate: {
    ratePct: number;
    totalAttempts: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
    droppedCount: number;
  };
  transactions: {
    successfulCount: number;
    avgTicket: number;
  };
  lastUpdated: string;
}

export interface RevenueTimeSeriesPoint {
  date: string;
  label: string;
  revenue: number;
  transactions: number;
  avgTicket: number;
}

export interface RevenueTimeSeriesResponse {
  range: {
    preset: string;
    from: string;
    to: string;
    bucket: string;
  };
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    avgOrderValue: number;
  };
  points: RevenueTimeSeriesPoint[];
}

export interface RevenuePlanBreakdownItem {
  planCode: string;
  planName: string;
  count: number;
  revenue: number;
  percentage: number;
  avgTicket: number;
}

export interface RevenuePlanBreakdownResponse {
  totalRevenue: number;
  totalCount: number;
  plans: RevenuePlanBreakdownItem[];
}

export interface RevenueMethodBreakdownItem {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface RevenueMethodBreakdownResponse {
  totalRevenue: number;
  totalCount: number;
  methods: RevenueMethodBreakdownItem[];
}

export interface RevenueTransactionUser {
  id: string;
  profileId: string;
  customerName: string;
  email: string;
  phone: string;
  subscriptionTier: string;
  avatarUrl: string | null;
}

export interface RevenueTransactionItem {
  id: string;
  orderId: string;
  cfOrderId?: string | null;
  cfPaymentId?: string | null;
  planCode: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED' | string;
  paymentMethod: string;
  paymentMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  user: RevenueTransactionUser;
}

export interface RevenueTransactionsResponse {
  items: RevenueTransactionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RevenueTransactionQueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  method?: string;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

