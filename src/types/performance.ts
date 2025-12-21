/**
 * Performance monitoring type definitions
 *
 * Provides comprehensive type safety for tracking Web Vitals,
 * lazy loading metrics, and performance analysis.
 */

/**
 * Web Vitals metric names
 * Based on Google's Core Web Vitals and additional performance metrics
 */
export type WebVitalName = 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';

/**
 * Performance rating categories
 * Based on Web Vitals thresholds
 */
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Web Vitals metric data
 * Tracks individual Core Web Vitals measurements
 */
export interface WebVitalsMetric {
  /** Metric name (LCP, FID, CLS, TTFB, FCP, INP) */
  name: WebVitalName;
  /** Metric value in appropriate units (ms for timing, score for CLS) */
  value: number;
  /** Performance rating based on industry thresholds */
  rating: PerformanceRating;
  /** Delta from previous measurement */
  delta: number;
  /** Unique identifier for this metric entry */
  id: string;
  /** Navigation type (navigate, reload, back-forward, prerender) */
  navigationType: NavigationType;
  /** Timestamp when metric was captured */
  timestamp: number;
}

/**
 * Navigation types for Web Vitals
 */
export type NavigationType = 'navigate' | 'reload' | 'back-forward' | 'prerender';

/**
 * Lazy load metric data
 * Tracks performance of React.lazy() component loading
 */
export interface LazyLoadMetric {
  /** Component name being lazy-loaded */
  componentName: string;
  /** Timestamp when load started (performance.now()) */
  loadStartTime: number;
  /** Timestamp when load completed */
  loadEndTime: number;
  /** Total duration in milliseconds */
  duration: number;
  /** Size of loaded chunk in bytes (if available) */
  chunkSize?: number;
  /** Whether load succeeded */
  success: boolean;
  /** Error if load failed */
  error?: Error;
  /** Timestamp when metric was captured */
  timestamp: number;
}

/**
 * Suspense boundary metric data
 * Tracks how long React Suspense fallback is shown
 */
export interface SuspenseMetric {
  /** Unique identifier for the Suspense boundary */
  suspenseId: string;
  /** When fallback started showing */
  startTime: number;
  /** When component finished loading */
  endTime: number;
  /** How long fallback was visible (ms) */
  duration: number;
  /** Whether fallback UI was actually shown to user */
  fallbackShown: boolean;
  /** Timestamp when metric was captured */
  timestamp: number;
}

/**
 * Bundle analysis metrics
 * Aggregated chunk size information
 */
export interface BundleMetrics {
  /** Total bundle size in bytes */
  totalSize: number;
  /** Number of chunks */
  chunkCount: number;
  /** Largest chunk information */
  largestChunk: {
    name: string;
    size: number;
  };
  /** All chunks with names and sizes */
  chunks: Array<{
    name: string;
    size: number;
  }>;
  /** When these metrics were captured */
  timestamp: string;
}

/**
 * Comprehensive performance report
 * Aggregates all performance metrics for analysis
 */
export interface PerformanceReport {
  /** Unique session identifier */
  sessionId: string;
  /** When report was generated */
  timestamp: string;
  /** All Web Vitals measurements */
  webVitals: WebVitalsMetric[];
  /** All lazy load events */
  lazyLoads: LazyLoadMetric[];
  /** All Suspense events */
  suspenseEvents: SuspenseMetric[];
  /** Bundle metrics (if available) */
  bundleMetrics?: BundleMetrics;
  /** User agent string */
  userAgent?: string;
  /** Viewport dimensions */
  viewport?: {
    width: number;
    height: number;
  };
}

/**
 * Lazy load statistics
 * Aggregated metrics for analysis
 */
export interface LazyLoadStats {
  /** Total number of lazy loads */
  totalLoads: number;
  /** Average load duration in ms */
  avgDuration: number;
  /** Median load duration in ms */
  medianDuration: number;
  /** Slowest lazy load */
  slowest: LazyLoadMetric | null;
  /** Fastest lazy load */
  fastest: LazyLoadMetric | null;
  /** Number of failed loads */
  failures: number;
  /** 95th percentile duration in ms */
  p95Duration: number;
}

/**
 * Web Vitals configuration
 */
export interface WebVitalsConfig {
  /** Report metrics to console (dev mode) */
  reportToConsole?: boolean;
  /** Store metrics in localStorage for debugging */
  reportToLocalStorage?: boolean;
  /** Custom callback for each metric */
  onMetric?: (metric: WebVitalsMetric) => void;
  /** Whether to track all metrics or only Core Web Vitals */
  trackAllMetrics?: boolean;
}

/**
 * Performance baseline for comparison
 */
export interface PerformanceBaseline {
  /** When baseline was established */
  timestamp: string;
  /** Environment (production, development, etc.) */
  environment: string;
  /** Baseline Web Vitals */
  webVitals: {
    LCP: number;
    FID: number;
    CLS: number;
    TTFB: number;
  };
  /** Baseline lazy load metrics */
  lazyLoad: {
    avgDuration: number;
    p95Duration: number;
  };
}

/**
 * Comparison result between current metrics and baseline
 */
export interface ComparisonResult {
  /** Percentage change from baseline */
  delta: {
    LCP: number;
    FID: number;
    CLS: number;
    TTFB: number;
    lazyLoadAvg: number;
  };
  /** Whether metrics improved, degraded, or stayed similar */
  status: 'improved' | 'degraded' | 'similar';
  /** Human-readable summary */
  summary: string;
}

/**
 * Anomaly detection result
 */
export interface Anomaly {
  /** Type of metric with anomaly */
  type: 'webVital' | 'lazyLoad' | 'suspense';
  /** Metric name or component name */
  name: string;
  /** Anomalous value */
  value: number;
  /** Expected value based on historical data */
  expected: number;
  /** Severity of anomaly */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Description of the anomaly */
  description: string;
  /** Timestamp when detected */
  timestamp: number;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceMonitorConfig {
  /** Enable Web Vitals tracking */
  enableWebVitals?: boolean;
  /** Enable lazy load tracking */
  enableLazyLoadTracking?: boolean;
  /** Enable Suspense tracking */
  enableSuspenseTracking?: boolean;
  /** Maximum number of metrics to store in memory */
  maxMetricsInMemory?: number;
  /** Enable automatic anomaly detection */
  enableAnomalyDetection?: boolean;
  /** Sample rate (0-1) for performance tracking */
  sampleRate?: number;
}

/**
 * Export format types
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Memory buffer status
 */
export interface BufferStatus {
  /** Current number of metrics in buffer */
  current: number;
  /** Maximum capacity */
  max: number;
  /** Percentage full */
  percentFull: number;
  /** Oldest metric timestamp */
  oldestMetric?: number;
  /** Newest metric timestamp */
  newestMetric?: number;
}
