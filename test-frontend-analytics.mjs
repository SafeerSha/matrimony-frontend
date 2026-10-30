import assert from 'node:assert';
import { z } from 'zod';

// Replicate & test the exact schemas defined in frontend
const metricAvailabilitySchema = z.enum(['available', 'unavailable']);

const metricValueSchema = z.object({
  value: z.number().nullable(),
  previous: z.number().nullable(),
  deltaPct: z.number().nullable(),
  availability: metricAvailabilitySchema,
  reason: z.string().optional(),
  source: z.string().optional(),
});

const timeSeriesPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

const analyticsPresetSchema = z.enum(['today', '7d', '30d', '90d', 'custom']);

const dateRangeInputSchema = z
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

const analyticsOverviewSchema = z.object({
  range: z.object({
    preset: analyticsPresetSchema,
    from: z.string(),
    to: z.string(),
    timezone: z.string(),
    bucket: z.enum(['day', 'week']),
    previousPeriod: z.object({
      from: z.string(),
      to: z.string(),
    }),
  }),
  metrics: z.object({
    activeUsers: metricValueSchema,
    newSignups: metricValueSchema,
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

console.log('--- RUNNING FRONTEND ANALYTICS TESTS ---');

// Test 1: Valid Analytics Overview Response
{
  const validOverview = {
    range: {
      preset: '30d',
      from: '2026-09-28T00:00:00.000Z',
      to: '2026-10-28T00:00:00.000Z',
      timezone: 'UTC',
      bucket: 'day',
      previousPeriod: {
        from: '2026-08-29T00:00:00.000Z',
        to: '2026-09-28T00:00:00.000Z',
      },
    },
    metrics: {
      activeUsers: {
        value: 1250,
        previous: 1000,
        deltaPct: 25.0,
        availability: 'available',
        source: 'User.lastActiveAt',
      },
      newSignups: {
        value: 340,
        previous: 300,
        deltaPct: 13.3,
        availability: 'available',
        source: 'User.createdAt',
      },
      revenue: {
        value: null,
        previous: null,
        deltaPct: null,
        availability: 'unavailable',
        reason: 'Billing not integrated',
      },
      churnRate: {
        value: null,
        previous: null,
        deltaPct: null,
        availability: 'unavailable',
        reason: 'Billing not integrated',
      },
    },
    timeseries: {
      activeUsers: [{ date: '2026-10-01', value: 45 }],
      newSignups: [{ date: '2026-10-01', value: 12 }],
      revenue: [],
      churnRate: [],
    },
    lastUpdated: new Date().toISOString(),
  };

  const parsed = analyticsOverviewSchema.safeParse(validOverview);
  assert.strictEqual(parsed.success, true, 'Valid overview should parse successfully');
  console.log('✓ Test 1: Valid Overview Schema passed');
}

// Test 2: Gated Metric contract verification
{
  const unavailableMetric = {
    value: null,
    previous: null,
    deltaPct: null,
    availability: 'unavailable',
    reason: 'Billing and subscription provider not yet integrated',
  };
  const parsed = metricValueSchema.safeParse(unavailableMetric);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.data.value, null);
  assert.strictEqual(parsed.data.availability, 'unavailable');
  console.log('✓ Test 2: Gated Metric null enforcement passed');
}

// Test 3: Date Range Input Validation
{
  // Valid preset
  assert.strictEqual(dateRangeInputSchema.safeParse({ preset: '7d' }).success, true);
  // Default preset fallback
  const def = dateRangeInputSchema.parse({});
  assert.strictEqual(def.preset, '30d');
  assert.strictEqual(def.timezone, 'UTC');

  // Valid custom range
  const validCustom = dateRangeInputSchema.safeParse({
    preset: 'custom',
    from: '2026-01-01',
    to: '2026-03-01',
  });
  assert.strictEqual(validCustom.success, true);

  // Invalid custom range: from > to
  const invalidCustomOrder = dateRangeInputSchema.safeParse({
    preset: 'custom',
    from: '2026-05-01',
    to: '2026-01-01',
  });
  assert.strictEqual(invalidCustomOrder.success, false);

  // Invalid custom range: > 366 days
  const invalidCustomSpan = dateRangeInputSchema.safeParse({
    preset: 'custom',
    from: '2024-01-01',
    to: '2026-01-01',
  });
  assert.strictEqual(invalidCustomSpan.success, false);
  console.log('✓ Test 3: DateRangeInput refinement validation passed');
}

// Test 4: Middleware Role Casing Normalization
{
  function isAllowedAdminPath(sessionRole, pathname) {
    const normalizedRole = typeof sessionRole === 'string' ? sessionRole.toUpperCase() : '';
    if (pathname.startsWith('/admin') && normalizedRole !== 'ADMIN') {
      return false;
    }
    if (pathname.startsWith('/rm') && normalizedRole !== 'RM' && normalizedRole !== 'ADMIN') {
      return false;
    }
    return true;
  }

  // Admin uppercase (backend standard)
  assert.strictEqual(isAllowedAdminPath('ADMIN', '/admin'), true);
  assert.strictEqual(isAllowedAdminPath('admin', '/admin'), true); // lowercase tolerated
  assert.strictEqual(isAllowedAdminPath('Admin', '/admin'), true); // titlecase tolerated

  // Non-admins blocked from /admin
  assert.strictEqual(isAllowedAdminPath('USER', '/admin'), false);
  assert.strictEqual(isAllowedAdminPath('RM', '/admin'), false);
  assert.strictEqual(isAllowedAdminPath(undefined, '/admin'), false);

  // RM role can access /rm, but NOT /admin
  assert.strictEqual(isAllowedAdminPath('RM', '/rm'), true);
  assert.strictEqual(isAllowedAdminPath('rm', '/rm'), true);
  assert.strictEqual(isAllowedAdminPath('RM', '/admin'), false);

  // Admin can access both /admin and /rm
  assert.strictEqual(isAllowedAdminPath('ADMIN', '/rm'), true);

  console.log('✓ Test 4: Middleware Role Casing & Access Control passed');
}

// Test 5: AbortSignal & Stale Response Guard Simulation
{
  let currentController = new AbortController();
  let latestResolvedId = null;

  async function mockFetch(requestId, delayMs, signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (signal.aborted) {
          reject(new DOMException('Aborted', 'AbortError'));
        } else {
          resolve(`data-${requestId}`);
        }
      }, delayMs);

      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }

  // Fire request 1 (slow)
  const req1Signal = currentController.signal;
  const p1 = mockFetch(1, 100, req1Signal)
    .then((res) => { latestResolvedId = res; })
    .catch((err) => {
      assert.strictEqual(err.name, 'AbortError');
    });

  // Rapidly switch to request 2 (fast), aborting request 1
  currentController.abort();
  currentController = new AbortController();
  const req2Signal = currentController.signal;
  const p2 = mockFetch(2, 20, req2Signal)
    .then((res) => { latestResolvedId = res; });

  await Promise.all([p1, p2]);
  assert.strictEqual(latestResolvedId, 'data-2', 'Stale response 1 must not overwrite request 2');
  console.log('✓ Test 5: AbortController race-safety simulation passed');
}

console.log('--- ALL FRONTEND ANALYTICS TESTS PASSED ---');
