/**
 * Lazy Load Tracker
 *
 * Tracks performance of React.lazy() component loading.
 * Measures load times, detects failures, and provides statistics.
 */

import type { LazyLoadMetric, LazyLoadStats } from '../../types/performance';

// In-memory storage of lazy load metrics
const metrics: LazyLoadMetric[] = [];

// Configuration
const MAX_METRICS_IN_MEMORY = 200;

/**
 * Track a lazy-loaded component's performance
 *
 * Wraps a React.lazy() import function with performance tracking.
 *
 * @param importFn - The dynamic import function
 * @param componentName - Human-readable component name for tracking
 * @returns Promise that resolves to the loaded module
 *
 * @example
 * ```typescript
 * import { lazy } from 'react';
 * import { trackLazyLoad } from './utils/performance/lazyLoadTracker';
 *
 * const MyComponent = lazy(() =>
 *   trackLazyLoad(
 *     () => import('./components/MyComponent'),
 *     'MyComponent'
 *   )
 * );
 * ```
 */
export function trackLazyLoad<T>(
  importFn: () => Promise<T>,
  componentName: string
): Promise<T> {
  const loadStartTime = performance.now();

  return importFn()
    .then((module) => {
      const loadEndTime = performance.now();
      const duration = loadEndTime - loadStartTime;

      // Record successful load
      const metric: LazyLoadMetric = {
        componentName,
        loadStartTime,
        loadEndTime,
        duration,
        success: true,
        timestamp: Date.now(),
      };

      recordMetric(metric);

      // Log slow loads in development
      if (import.meta.env.DEV && duration > 1000) {
        console.warn(
          `⚠️ Slow lazy load: ${componentName} took ${duration.toFixed(0)}ms`
        );
      }

      return module;
    })
    .catch((error) => {
      const loadEndTime = performance.now();
      const duration = loadEndTime - loadStartTime;

      // Record failed load
      const metric: LazyLoadMetric = {
        componentName,
        loadStartTime,
        loadEndTime,
        duration,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: Date.now(),
      };

      recordMetric(metric);

      console.error(`❌ Failed to lazy load ${componentName}:`, error);

      // Re-throw so React can handle it
      throw error;
    });
}

/**
 * Record a lazy load metric
 */
function recordMetric(metric: LazyLoadMetric): void {
  metrics.push(metric);

  // Limit memory usage
  if (metrics.length > MAX_METRICS_IN_MEMORY) {
    metrics.shift();
  }

  // Log in development
  if (import.meta.env.DEV) {
    const status = metric.success ? '✅' : '❌';
    console.log(
      `${status} Lazy Load: ${metric.componentName} (${metric.duration.toFixed(0)}ms)`
    );
  }
}

/**
 * Get all recorded lazy load metrics
 *
 * @returns Array of all lazy load metrics
 */
export function getLazyLoadMetrics(): LazyLoadMetric[] {
  return [...metrics];
}

/**
 * Get lazy load statistics
 *
 * @returns Aggregated statistics about lazy loading performance
 *
 * @example
 * ```typescript
 * const stats = getLazyLoadStats();
 * console.log(`Average load time: ${stats.avgDuration}ms`);
 * console.log(`Slowest component: ${stats.slowest?.componentName}`);
 * ```
 */
export function getLazyLoadStats(): LazyLoadStats {
  if (metrics.length === 0) {
    return {
      totalLoads: 0,
      avgDuration: 0,
      medianDuration: 0,
      slowest: null,
      fastest: null,
      failures: 0,
      p95Duration: 0,
    };
  }

  const successfulLoads = metrics.filter(m => m.success);
  const durations = successfulLoads.map(m => m.duration).sort((a, b) => a - b);

  // Calculate average
  const sum = durations.reduce((acc, d) => acc + d, 0);
  const avgDuration = durations.length > 0 ? sum / durations.length : 0;

  // Calculate median
  const medianDuration = durations.length > 0
    ? durations[Math.floor(durations.length / 2)]
    : 0;

  // Calculate 95th percentile
  const p95Index = Math.floor(durations.length * 0.95);
  const p95Duration = durations.length > 0 ? durations[p95Index] || durations[durations.length - 1] : 0;

  // Find slowest and fastest
  const slowest = successfulLoads.length > 0
    ? successfulLoads.reduce((prev, curr) => prev.duration > curr.duration ? prev : curr)
    : null;

  const fastest = successfulLoads.length > 0
    ? successfulLoads.reduce((prev, curr) => prev.duration < curr.duration ? prev : curr)
    : null;

  // Count failures
  const failures = metrics.filter(m => !m.success).length;

  return {
    totalLoads: metrics.length,
    avgDuration,
    medianDuration,
    slowest,
    fastest,
    failures,
    p95Duration,
  };
}

/**
 * Get lazy load metrics for a specific component
 *
 * @param componentName - Name of the component to filter by
 * @returns Array of metrics for that component
 */
export function getLazyLoadMetricsByComponent(componentName: string): LazyLoadMetric[] {
  return metrics.filter(m => m.componentName === componentName);
}

/**
 * Get statistics for a specific component
 *
 * @param componentName - Name of the component
 * @returns Statistics for that component
 */
export function getComponentStats(componentName: string): {
  loads: number;
  avgDuration: number;
  failures: number;
  successRate: number;
} {
  const componentMetrics = getLazyLoadMetricsByComponent(componentName);

  if (componentMetrics.length === 0) {
    return {
      loads: 0,
      avgDuration: 0,
      failures: 0,
      successRate: 0,
    };
  }

  const successful = componentMetrics.filter(m => m.success);
  const failures = componentMetrics.filter(m => !m.success).length;

  const avgDuration = successful.length > 0
    ? successful.reduce((sum, m) => sum + m.duration, 0) / successful.length
    : 0;

  const successRate = (successful.length / componentMetrics.length) * 100;

  return {
    loads: componentMetrics.length,
    avgDuration,
    failures,
    successRate,
  };
}

/**
 * Get summary of all tracked components
 *
 * @returns Map of component names to their statistics
 */
export function getComponentSummary(): Map<string, ReturnType<typeof getComponentStats>> {
  const componentNames = new Set(metrics.map(m => m.componentName));
  const summary = new Map();

  componentNames.forEach(name => {
    summary.set(name, getComponentStats(name));
  });

  return summary;
}

/**
 * Detect slow-loading components
 *
 * @param threshold - Duration threshold in ms (default: 500ms)
 * @returns Array of components exceeding threshold
 */
export function detectSlowComponents(threshold: number = 500): Array<{
  componentName: string;
  avgDuration: number;
  maxDuration: number;
}> {
  const summary = getComponentSummary();
  const slow: Array<{ componentName: string; avgDuration: number; maxDuration: number }> = [];

  summary.forEach((stats, componentName) => {
    if (stats.avgDuration > threshold) {
      const componentMetrics = getLazyLoadMetricsByComponent(componentName);
      const maxDuration = Math.max(...componentMetrics.filter(m => m.success).map(m => m.duration));

      slow.push({
        componentName,
        avgDuration: stats.avgDuration,
        maxDuration,
      });
    }
  });

  return slow.sort((a, b) => b.avgDuration - a.avgDuration);
}

/**
 * Export lazy load data
 *
 * @param format - Export format ('json' or 'csv')
 * @returns Formatted string of metrics data
 */
export function exportLazyLoadMetrics(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(metrics, null, 2);
  }

  // CSV export
  if (metrics.length === 0) return '';

  const headers = ['timestamp', 'componentName', 'duration', 'success', 'chunkSize', 'error'];
  const rows = metrics.map(m => [
    new Date(m.timestamp).toISOString(),
    m.componentName,
    m.duration.toFixed(2),
    m.success.toString(),
    m.chunkSize?.toString() || '',
    m.error?.message || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * Reset all lazy load metrics
 */
export function resetLazyLoadMetrics(): void {
  metrics.length = 0;
}

/**
 * Get recent lazy load failures
 *
 * @param limit - Maximum number of failures to return
 * @returns Array of failed loads
 */
export function getRecentFailures(limit: number = 10): LazyLoadMetric[] {
  return metrics
    .filter(m => !m.success)
    .slice(-limit)
    .reverse();
}

/**
 * Check if lazy loading performance is healthy
 *
 * @returns Health check result
 */
export function checkLazyLoadHealth(): {
  healthy: boolean;
  avgDuration: number;
  p95Duration: number;
  failureRate: number;
  issues: string[];
} {
  const stats = getLazyLoadStats();
  const issues: string[] = [];
  let healthy = true;

  // Check average duration (target: < 200ms)
  if (stats.avgDuration > 200) {
    issues.push(`Average load time is ${stats.avgDuration.toFixed(0)}ms (target: <200ms)`);
    healthy = false;
  }

  // Check 95th percentile (target: < 500ms)
  if (stats.p95Duration > 500) {
    issues.push(`95th percentile is ${stats.p95Duration.toFixed(0)}ms (target: <500ms)`);
    healthy = false;
  }

  // Check failure rate (target: < 1%)
  const failureRate = stats.totalLoads > 0 ? (stats.failures / stats.totalLoads) * 100 : 0;
  if (failureRate > 1) {
    issues.push(`Failure rate is ${failureRate.toFixed(1)}% (target: <1%)`);
    healthy = false;
  }

  return {
    healthy,
    avgDuration: stats.avgDuration,
    p95Duration: stats.p95Duration,
    failureRate,
    issues,
  };
}
