/**
 * Web Vitals Tracker
 *
 * Integrates with Google's web-vitals library to track Core Web Vitals
 * and additional performance metrics. Provides local storage debugging
 * and customizable reporting.
 */

import { onCLS, onLCP, onTTFB, onFCP, onINP, type Metric } from 'web-vitals';
import type {
  WebVitalsMetric,
  WebVitalsConfig,
  PerformanceRating,
  NavigationType,
} from '../../types/performance';

// In-memory storage of metrics
const metrics: WebVitalsMetric[] = [];

// Configuration
let config: WebVitalsConfig = {
  reportToConsole: false,
  reportToLocalStorage: false,
  trackAllMetrics: true,
};

// Custom callbacks
const callbacks: Set<(metric: WebVitalsMetric) => void> = new Set();

/**
 * Rate a metric value based on industry thresholds
 */
function rateMetric(name: string, value: number): PerformanceRating {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint (ms)
    FID: { good: 100, poor: 300 },        // First Input Delay (ms)
    CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift (score)
    TTFB: { good: 800, poor: 1800 },      // Time to First Byte (ms)
    FCP: { good: 1800, poor: 3000 },      // First Contentful Paint (ms)
    INP: { good: 200, poor: 500 },        // Interaction to Next Paint (ms)
  };

  const threshold = thresholds[name];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Convert web-vitals Metric to our WebVitalsMetric format
 */
function convertMetric(metric: Metric): WebVitalsMetric {
  return {
    name: metric.name as WebVitalsMetric['name'],
    value: metric.value,
    rating: rateMetric(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: (metric.navigationType || 'navigate') as NavigationType,
    timestamp: Date.now(),
  };
}

/**
 * Handle metric reporting
 */
function reportMetric(metric: WebVitalsMetric): void {
  // Store in memory
  metrics.push(metric);

  // Limit memory usage (keep last 100 metrics)
  if (metrics.length > 100) {
    metrics.shift();
  }

  // Report to console (dev mode)
  if (config.reportToConsole) {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }

  // Report to localStorage (debugging)
  if (config.reportToLocalStorage) {
    try {
      const stored = localStorage.getItem('webVitalsMetrics');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(metric);
      // Keep only last 50 in localStorage to avoid quota issues
      const trimmed = existing.slice(-50);
      localStorage.setItem('webVitalsMetrics', JSON.stringify(trimmed));
    } catch (error) {
      // Silently fail if localStorage is unavailable
      console.warn('Failed to store Web Vitals in localStorage:', error);
    }
  }

  // Call custom callbacks
  callbacks.forEach(callback => {
    try {
      callback(metric);
    } catch (error) {
      console.error('Error in Web Vitals callback:', error);
    }
  });

  // Call config callback
  if (config.onMetric) {
    try {
      config.onMetric(metric);
    } catch (error) {
      console.error('Error in Web Vitals onMetric callback:', error);
    }
  }
}

/**
 * Initialize Web Vitals tracking
 *
 * @param userConfig - Optional configuration
 *
 * @example
 * ```typescript
 * // Basic usage (production)
 * initWebVitals();
 *
 * // Development with console logging
 * initWebVitals({
 *   reportToConsole: true,
 *   reportToLocalStorage: true,
 * });
 *
 * // Custom callback
 * initWebVitals({
 *   onMetric: (metric) => {
 *     // Send to analytics service
 *     analytics.track('Web Vital', metric);
 *   }
 * });
 * ```
 */
export function initWebVitals(userConfig?: WebVitalsConfig): void {
  // Merge config
  config = {
    ...config,
    ...userConfig,
  };

  // Track Core Web Vitals (always)
  onLCP((metric) => reportMetric(convertMetric(metric)));
  onCLS((metric) => reportMetric(convertMetric(metric)));

  // Track additional metrics if enabled
  if (config.trackAllMetrics) {
    onTTFB((metric) => reportMetric(convertMetric(metric)));
    onFCP((metric) => reportMetric(convertMetric(metric)));
    onINP((metric) => reportMetric(convertMetric(metric)));
  }

  if (config.reportToConsole) {
    console.log('📊 Web Vitals tracking initialized');
  }
}

/**
 * Get all recorded Web Vitals metrics
 *
 * @returns Array of all metrics recorded in current session
 *
 * @example
 * ```typescript
 * const vitals = getWebVitalsReport();
 * console.log(`Tracked ${vitals.length} Web Vitals metrics`);
 * ```
 */
export function getWebVitalsReport(): WebVitalsMetric[] {
  return [...metrics];
}

/**
 * Get Web Vitals metrics from localStorage
 *
 * @returns Array of metrics stored in localStorage, or null if unavailable
 */
export function getStoredWebVitals(): WebVitalsMetric[] | null {
  try {
    const stored = localStorage.getItem('webVitalsMetrics');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Clear stored Web Vitals from localStorage
 */
export function clearStoredWebVitals(): void {
  try {
    localStorage.removeItem('webVitalsMetrics');
  } catch {
    // Silently fail
  }
}

/**
 * Register a callback to be called when a metric is recorded
 *
 * @param callback - Function to call with each metric
 * @returns Unsubscribe function
 *
 * @example
 * ```typescript
 * const unsubscribe = onWebVital((metric) => {
 *   console.log('New metric:', metric);
 * });
 *
 * // Later, stop listening
 * unsubscribe();
 * ```
 */
export function onWebVital(callback: (metric: WebVitalsMetric) => void): () => void {
  callbacks.add(callback);
  return () => callbacks.delete(callback);
}

/**
 * Get summary statistics for Web Vitals
 *
 * @returns Summary of metrics by type
 */
export function getWebVitalsSummary() {
  const summary: Record<string, { count: number; avg: number; latest?: number; rating?: PerformanceRating }> = {};

  metrics.forEach(metric => {
    if (!summary[metric.name]) {
      summary[metric.name] = {
        count: 0,
        avg: 0,
      };
    }

    const current = summary[metric.name];
    current.count += 1;
    current.avg = ((current.avg * (current.count - 1)) + metric.value) / current.count;
    current.latest = metric.value;
    current.rating = metric.rating;
  });

  return summary;
}

/**
 * Check if Web Vitals are within acceptable thresholds
 *
 * @returns Object with pass/fail for each metric
 */
export function checkWebVitalsHealth() {
  const summary = getWebVitalsSummary();
  const health: Record<string, boolean> = {};

  Object.entries(summary).forEach(([name, stats]) => {
    health[name] = stats.rating === 'good' || stats.rating === 'needs-improvement';
  });

  const allHealthy = Object.values(health).every(h => h);

  return {
    healthy: allHealthy,
    metrics: health,
    summary,
  };
}

/**
 * Export Web Vitals data
 *
 * @param format - Export format ('json' or 'csv')
 * @returns Formatted string of metrics data
 */
export function exportWebVitals(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(metrics, null, 2);
  }

  // CSV export
  if (metrics.length === 0) return '';

  const headers = ['timestamp', 'name', 'value', 'rating', 'delta', 'navigationType', 'id'];
  const rows = metrics.map(m => [
    new Date(m.timestamp).toISOString(),
    m.name,
    m.value.toFixed(2),
    m.rating,
    m.delta.toFixed(2),
    m.navigationType,
    m.id,
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

/**
 * Reset all Web Vitals metrics
 * Useful for testing or starting fresh measurements
 */
export function resetWebVitals(): void {
  metrics.length = 0;
  clearStoredWebVitals();
}
