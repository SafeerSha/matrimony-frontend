import { apiFetch, API_URL } from '@/lib/http/api-client';
import { authService } from './auth.service';
import type {
  RevenueOverviewResponse,
  RevenuePlanBreakdownResponse,
  RevenueMethodBreakdownResponse,
  RevenueTimeSeriesResponse,
  RevenueTransactionsResponse,
  RevenueTransactionQueryFilters,
  RevenuePreset,
} from '@/types/revenue';

export interface RevenueDateFilterParams {
  preset?: RevenuePreset;
  from?: string;
  to?: string;
  timezone?: string;
}

export const revenueService = {
  getOverview: (params: RevenueDateFilterParams = {}, signal?: AbortSignal) => {
    const sp = new URLSearchParams();
    if (params.preset) sp.set('preset', params.preset);
    if (params.from) sp.set('from', params.from);
    if (params.to) sp.set('to', params.to);
    if (params.timezone) sp.set('timezone', params.timezone);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<RevenueOverviewResponse>(`/admin/revenue/overview${query}`, { signal });
  },

  getTimeSeries: (
    params: RevenueDateFilterParams & { bucket?: 'day' | 'week' | 'month' | 'auto' } = {},
    signal?: AbortSignal,
  ) => {
    const sp = new URLSearchParams();
    if (params.preset) sp.set('preset', params.preset);
    if (params.from) sp.set('from', params.from);
    if (params.to) sp.set('to', params.to);
    if (params.timezone) sp.set('timezone', params.timezone);
    if (params.bucket) sp.set('bucket', params.bucket);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<RevenueTimeSeriesResponse>(`/admin/revenue/timeseries${query}`, { signal });
  },

  getByPlan: (params: RevenueDateFilterParams = {}, signal?: AbortSignal) => {
    const sp = new URLSearchParams();
    if (params.preset) sp.set('preset', params.preset);
    if (params.from) sp.set('from', params.from);
    if (params.to) sp.set('to', params.to);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<RevenuePlanBreakdownResponse>(`/admin/revenue/by-plan${query}`, { signal });
  },

  getByMethod: (params: RevenueDateFilterParams = {}, signal?: AbortSignal) => {
    const sp = new URLSearchParams();
    if (params.preset) sp.set('preset', params.preset);
    if (params.from) sp.set('from', params.from);
    if (params.to) sp.set('to', params.to);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<RevenueMethodBreakdownResponse>(`/admin/revenue/by-method${query}`, { signal });
  },

  getTransactions: (filters: RevenueTransactionQueryFilters = {}, signal?: AbortSignal) => {
    const sp = new URLSearchParams();
    if (filters.page) sp.set('page', String(filters.page));
    if (filters.limit) sp.set('limit', String(filters.limit));
    if (filters.status && filters.status !== 'ALL') sp.set('status', filters.status);
    if (filters.plan && filters.plan !== 'ALL') sp.set('plan', filters.plan);
    if (filters.method && filters.method !== 'ALL') sp.set('method', filters.method);
    if (filters.search && filters.search.trim()) sp.set('search', filters.search.trim());
    if (filters.from) sp.set('from', filters.from);
    if (filters.to) sp.set('to', filters.to);
    if (filters.sortBy) sp.set('sortBy', filters.sortBy);
    if (filters.sortOrder) sp.set('sortOrder', filters.sortOrder);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    return apiFetch<RevenueTransactionsResponse>(`/admin/revenue/transactions${query}`, { signal });
  },

  exportCsv: async (filters: Omit<RevenueTransactionQueryFilters, 'page' | 'limit'> = {}): Promise<void> => {
    const sp = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') sp.set('status', filters.status);
    if (filters.plan && filters.plan !== 'ALL') sp.set('plan', filters.plan);
    if (filters.method && filters.method !== 'ALL') sp.set('method', filters.method);
    if (filters.search && filters.search.trim()) sp.set('search', filters.search.trim());
    if (filters.from) sp.set('from', filters.from);
    if (filters.to) sp.set('to', filters.to);

    const query = sp.toString() ? `?${sp.toString()}` : '';
    const token = authService.getAccessToken();

    const response = await fetch(`${API_URL}/admin/revenue/export-csv${query}`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed with HTTP status ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `ishtamchat-revenue-ledger-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};
