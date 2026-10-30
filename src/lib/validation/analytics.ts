import { z } from 'zod';

export const metricAvailabilitySchema = z.enum(['available', 'unavailable']);

export const metricValueSchema = z.object({
  value: z.number().nullable(),
  previous: z.number().nullable(),
  deltaPct: z.number().nullable(),
  availability: metricAvailabilitySchema,
  reason: z.string().optional(),
  source: z.string().optional(),
});

export const timeSeriesPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const analyticsPresetSchema = z.enum(['today', '7d', '30d', '90d', 'custom']);

export const dateRangeInputSchema = z
  .object({
    preset: analyticsPresetSchema.optional().default('30d'),
    from: z.string().optional(),
    to: z.string().optional(),
    timezone: z.string().optional().default('UTC'),
  })
  .refine(
    (data) => {
      if (data.preset === 'custom') {
        if (!data.from || !data.to) return false;
        const start = new Date(data.from).getTime();
        const end = new Date(data.to).getTime();
        if (Number.isNaN(start) || Number.isNaN(end)) return false;
        if (start > end) return false;
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays > 366) return false;
      }
      return true;
    },
    {
      message: 'Custom range requires valid from <= to dates with a maximum span of 366 days',
      path: ['from'],
    }
  );

export const analyticsResolvedRangeSchema = z.object({
  preset: analyticsPresetSchema,
  from: z.string(),
  to: z.string(),
  timezone: z.string(),
  bucket: z.enum(['day', 'week']),
  previousPeriod: z.object({
    from: z.string(),
    to: z.string(),
  }),
});

export const analyticsOverviewSchema = z.object({
  range: analyticsResolvedRangeSchema,
  metrics: z.object({
    activeUsers: metricValueSchema,
    newSignups: metricValueSchema,
    paidMembers: metricValueSchema,
    premiumConversion: metricValueSchema,
    revenue: metricValueSchema,
    churnRate: metricValueSchema,
  }),
  timeseries: z.object({
    activeUsers: z.array(timeSeriesPointSchema),
    newSignups: z.array(timeSeriesPointSchema),
    revenue: z.array(timeSeriesPointSchema),
    churnRate: z.array(timeSeriesPointSchema),
  }),
  lastUpdated: z.string(),
});

export const analyticsTimeSeriesResponseSchema = z.object({
  metric: z.string(),
  range: analyticsResolvedRangeSchema,
  points: z.array(timeSeriesPointSchema),
});
