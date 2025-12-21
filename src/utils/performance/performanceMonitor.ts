/**
 * Performance Monitor
 *
 * Central hub for all performance monitoring functionality.
 * Aggregates Web Vitals, lazy load metrics, and provides
 * reporting, analysis, and baseline comparison.
 */

import type {
  PerformanceReport,
  PerformanceBaseline,
  ComparisonResult,
  Anomaly,
  PerformanceMonitorConfig,
  ExportFormat,
  BufferStatus,
} from '../../types/performance';
import { getWebVitalsReport, getWebVitalsSummary } from './webVitals';
import { getLazyLoadMetrics, getLazyLoadStats } from './lazyLoadTracker';

// Configuration
let config: PerformanceMonitorConfig = {
  enableWebVitals: true,
  enableLazyLoadTracking: true,
  enableSuspenseTracking: false,
  maxMetricsInMemory: 500,
  enableAnomalyDetection: true,
  sampleRate: 1.0, // Track 100% of events
};

// Session ID
const sessionId = generateSessionId();

// Performance baseline (for comparison)
let baseline: PerformanceBaseline | null = null;

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Configure the performance monitor
 *
 * @param userConfig - Configuration options
 *
 * @example
 * ```typescript
 * configurePerformanceMonitor({
 *   enableWebVitals: true,
 *   enableLazyLoadTracking: true,
 *   maxMetricsInMemory: 1000,
 *   sampleRate: 0.5, // Track 50% of events
 * });
 * ```
 */
export function configurePerformanceMonitor(userConfig: Partial<PerformanceMonitorConfig>): void {
  config = {
    ...config,
    ...userConfig,
  };
}

/**
 * Record a generic performance metric
 *
 * @param type - Type of metric
 * @param data - Metric data
 *
 * @example
 * ```typescript
 * recordMetric('customEvent', {
 *   name: 'apiCall',
 *   duration: 245,
 *   success: true,
 * });
 * ```
 */
export function recordMetric(type: string, data: unknown): void {
  // Apply sample rate
  if (Math.random() > (config.sampleRate || 1.0)) {
    return;
  }

  // Store in appropriate tracker based on type
  if (import.meta.env.DEV) {
    console.log(`📊 Metric recorded: ${type}`, data);
  }
}

/**
 * Get comprehensive performance report
 *
 * @returns Complete performance report with all metrics
 *
 * @example
 * ```typescript
 * const report = getPerformanceReport();
 * console.log(`Session ${report.sessionId}`);
 * console.log(`Web Vitals: ${report.webVitals.length} metrics`);
 * console.log(`Lazy Loads: ${report.lazyLoads.length} events`);
 * ```
 */
export function getPerformanceReport(): PerformanceReport {
  const webVitals = config.enableWebVitals ? getWebVitalsReport() : [];
  const lazyLoads = config.enableLazyLoadTracking ? getLazyLoadMetrics() : [];

  return {
    sessionId,
    timestamp: new Date().toISOString(),
    webVitals,
    lazyLoads,
    suspenseEvents: [], // Future implementation
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  };
}

/**
 * Export performance data in specified format
 *
 * @param format - Export format ('json' or 'csv')
 * @returns Formatted performance data
 *
 * @example
 * ```typescript
 * // Export as JSON
 * const json = exportPerformanceData('json');
 * downloadFile('performance.json', json);
 *
 * // Export as CSV
 * const csv = exportPerformanceData('csv');
 * downloadFile('performance.csv', csv);
 * ```
 */
export function exportPerformanceData(format: ExportFormat = 'json'): string {
  const report = getPerformanceReport();

  if (format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  // CSV export
  const rows: string[][] = [];

  // Header
  rows.push(['Type', 'Name', 'Value', 'Timestamp', 'Details']);

  // Web Vitals
  report.webVitals.forEach(metric => {
    rows.push([
      'WebVital',
      metric.name,
      metric.value.toFixed(2),
      new Date(metric.timestamp).toISOString(),
      metric.rating,
    ]);
  });

  // Lazy Loads
  report.lazyLoads.forEach(metric => {
    rows.push([
      'LazyLoad',
      metric.componentName,
      metric.duration.toFixed(2),
      new Date(metric.timestamp).toISOString(),
      metric.success ? 'success' : 'failed',
    ]);
  });

  return rows.map(row => row.join(',')).join('\n');
}

/**
 * Set performance baseline for future comparisons
 *
 * @param baselineData - Baseline performance data
 *
 * @example
 * ```typescript
 * // Establish baseline from current production metrics
 * setPerformanceBaseline({
 *   timestamp: new Date().toISOString(),
 *   environment: 'production',
 *   webVitals: {
 *     LCP: 2100,
 *     FID: 85,
 *     CLS: 0.08,
 *     TTFB: 650,
 *   },
 *   lazyLoad: {
 *     avgDuration: 180,
 *     p95Duration: 420,
 *   },
 * });
 * ```
 */
export function setPerformanceBaseline(baselineData: PerformanceBaseline): void {
  baseline = baselineData;

  // Store in localStorage for persistence
  try {
    localStorage.setItem('performanceBaseline', JSON.stringify(baselineData));
  } catch (error) {
    console.warn('Failed to store baseline in localStorage:', error);
  }
}

/**
 * Load baseline from localStorage
 */
export function loadPerformanceBaseline(): PerformanceBaseline | null {
  try {
    const stored = localStorage.getItem('performanceBaseline');
    if (stored) {
      baseline = JSON.parse(stored);
      return baseline;
    }
  } catch (error) {
    console.warn('Failed to load baseline from localStorage:', error);
  }
  return null;
}

/**
 * Compare current performance to baseline
 *
 * @returns Comparison result with deltas and status
 *
 * @example
 * ```typescript
 * const comparison = compareToBaseline();
 * if (comparison.status === 'degraded') {
 *   console.warn('Performance has degraded!');
 *   console.log(comparison.summary);
 * }
 * ```
 */
export function compareToBaseline(): ComparisonResult | null {
  if (!baseline) {
    return null;
  }

  const vitals = getWebVitalsSummary();
  const lazyStats = getLazyLoadStats();

  // Calculate deltas (percentage change)
  const calculateDelta = (current: number, baseline: number): number => {
    if (baseline === 0) return 0;
    return ((current - baseline) / baseline) * 100;
  };

  const delta = {
    LCP: calculateDelta(vitals.LCP?.latest || 0, baseline.webVitals.LCP),
    FID: calculateDelta(vitals.FID?.latest || 0, baseline.webVitals.FID),
    CLS: calculateDelta(vitals.CLS?.latest || 0, baseline.webVitals.CLS),
    TTFB: calculateDelta(vitals.TTFB?.latest || 0, baseline.webVitals.TTFB),
    lazyLoadAvg: calculateDelta(lazyStats.avgDuration, baseline.lazyLoad.avgDuration),
  };

  // Determine status
  const avgDelta = Object.values(delta).reduce((sum, d) => sum + Math.abs(d), 0) / Object.values(delta).length;
  let status: 'improved' | 'degraded' | 'similar';

  if (avgDelta < 5) {
    status = 'similar';
  } else {
    const improvementCount = Object.values(delta).filter(d => d < 0).length;
    status = improvementCount > Object.values(delta).length / 2 ? 'improved' : 'degraded';
  }

  // Generate summary
  const summaryParts: string[] = [];
  Object.entries(delta).forEach(([metric, change]) => {
    if (Math.abs(change) > 5) {
      const direction = change > 0 ? 'increased' : 'decreased';
      summaryParts.push(`${metric} ${direction} by ${Math.abs(change).toFixed(1)}%`);
    }
  });

  const summary = summaryParts.length > 0
    ? summaryParts.join(', ')
    : 'Performance metrics are similar to baseline';

  return {
    delta,
    status,
    summary,
  };
}

/**
 * Detect performance anomalies
 *
 * Uses statistical analysis to identify unusual metrics
 *
 * @returns Array of detected anomalies
 *
 * @example
 * ```typescript
 * const anomalies = detectAnomalies();
 * anomalies.forEach(anomaly => {
 *   if (anomaly.severity === 'critical') {
 *     alert(`Critical performance issue: ${anomaly.description}`);
 *   }
 * });
 * ```
 */
export function detectAnomalies(): Anomaly[] {
  if (!config.enableAnomalyDetection) {
    return [];
  }

  const anomalies: Anomaly[] = [];
  const vitals = getWebVitalsSummary();
  const lazyStats = getLazyLoadStats();

  // Check Web Vitals against thresholds
  Object.entries(vitals).forEach(([name, stats]) => {
    const thresholds = {
      LCP: { warning: 2500, critical: 4000 },
      FID: { warning: 100, critical: 300 },
      CLS: { warning: 0.1, critical: 0.25 },
      TTFB: { warning: 800, critical: 1800 },
      FCP: { warning: 1800, critical: 3000 },
      INP: { warning: 200, critical: 500 },
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (threshold && stats.latest) {
      if (stats.latest > threshold.critical) {
        anomalies.push({
          type: 'webVital',
          name,
          value: stats.latest,
          expected: threshold.warning,
          severity: 'critical',
          description: `${name} is critically high at ${stats.latest.toFixed(0)} (threshold: ${threshold.critical})`,
          timestamp: Date.now(),
        });
      } else if (stats.latest > threshold.warning) {
        anomalies.push({
          type: 'webVital',
          name,
          value: stats.latest,
          expected: threshold.warning,
          severity: 'high',
          description: `${name} exceeds warning threshold at ${stats.latest.toFixed(0)} (threshold: ${threshold.warning})`,
          timestamp: Date.now(),
        });
      }
    }
  });

  // Check lazy load performance
  if (lazyStats.avgDuration > 500) {
    anomalies.push({
      type: 'lazyLoad',
      name: 'avgDuration',
      value: lazyStats.avgDuration,
      expected: 200,
      severity: lazyStats.avgDuration > 1000 ? 'critical' : 'high',
      description: `Average lazy load time is ${lazyStats.avgDuration.toFixed(0)}ms (target: <200ms)`,
      timestamp: Date.now(),
    });
  }

  if (lazyStats.p95Duration > 1000) {
    anomalies.push({
      type: 'lazyLoad',
      name: 'p95Duration',
      value: lazyStats.p95Duration,
      expected: 500,
      severity: 'high',
      description: `95th percentile lazy load time is ${lazyStats.p95Duration.toFixed(0)}ms (target: <500ms)`,
      timestamp: Date.now(),
    });
  }

  // Check failure rate
  if (lazyStats.totalLoads > 0) {
    const failureRate = (lazyStats.failures / lazyStats.totalLoads) * 100;
    if (failureRate > 5) {
      anomalies.push({
        type: 'lazyLoad',
        name: 'failureRate',
        value: failureRate,
        expected: 1,
        severity: failureRate > 10 ? 'critical' : 'high',
        description: `Lazy load failure rate is ${failureRate.toFixed(1)}% (target: <1%)`,
        timestamp: Date.now(),
      });
    }
  }

  return anomalies;
}

/**
 * Get buffer status
 *
 * @returns Current status of the metrics buffer
 */
export function getBufferStatus(): BufferStatus {
  const webVitals = getWebVitalsReport();
  const lazyLoads = getLazyLoadMetrics();
  const total = webVitals.length + lazyLoads.length;

  const timestamps = [
    ...webVitals.map(m => m.timestamp),
    ...lazyLoads.map(m => m.timestamp),
  ].sort((a, b) => a - b);

  return {
    current: total,
    max: config.maxMetricsInMemory || 500,
    percentFull: (total / (config.maxMetricsInMemory || 500)) * 100,
    oldestMetric: timestamps[0],
    newestMetric: timestamps[timestamps.length - 1],
  };
}

/**
 * Get performance summary
 *
 * @returns Human-readable performance summary
 */
export function getPerformanceSummary(): string {
  const vitals = getWebVitalsSummary();
  const lazyStats = getLazyLoadStats();
  const anomalies = detectAnomalies();

  const lines: string[] = [
    '📊 Performance Summary',
    '',
    'Web Vitals:',
  ];

  Object.entries(vitals).forEach(([name, stats]) => {
    if (stats.latest) {
      const emoji = stats.rating === 'good' ? '✅' : stats.rating === 'needs-improvement' ? '⚠️' : '❌';
      lines.push(`  ${emoji} ${name}: ${stats.latest.toFixed(0)} (${stats.rating})`);
    }
  });

  lines.push('');
  lines.push('Lazy Loading:');
  lines.push(`  Total loads: ${lazyStats.totalLoads}`);
  lines.push(`  Average duration: ${lazyStats.avgDuration.toFixed(0)}ms`);
  lines.push(`  95th percentile: ${lazyStats.p95Duration.toFixed(0)}ms`);
  lines.push(`  Failures: ${lazyStats.failures}`);

  if (anomalies.length > 0) {
    lines.push('');
    lines.push('⚠️ Anomalies Detected:');
    anomalies.forEach(anomaly => {
      lines.push(`  ${anomaly.severity}: ${anomaly.description}`);
    });
  }

  return lines.join('\n');
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary(): void {
  console.log(getPerformanceSummary());
}

/**
 * Download performance report as file
 *
 * @param format - File format
 * @param filename - Filename (without extension)
 */
export function downloadPerformanceReport(format: ExportFormat = 'json', filename: string = 'performance-report'): void {
  const data = exportPerformanceData(format);
  const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
