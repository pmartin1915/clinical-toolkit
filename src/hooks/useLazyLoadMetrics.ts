/**
 * Performance Monitoring React Hooks
 *
 * Provides React hooks for component-level performance tracking
 * and lazy load monitoring.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LazyLoadMetric, SuspenseMetric } from '../types/performance';
import { getLazyLoadMetricsByComponent } from '../utils/performance/lazyLoadTracker';

/**
 * Hook to track lazy load metrics for a specific component
 *
 * @param componentName - Name of the component to track
 * @returns Object with tracking functions and current metrics
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { startTracking, endTracking, metrics } = useLazyLoadMetrics('MyComponent');
 *
 *   useEffect(() => {
 *     startTracking();
 *     // Component loaded
 *     endTracking();
 *   }, []);
 *
 *   return <div>My Component</div>;
 * }
 * ```
 */
export function useLazyLoadMetrics(componentName: string) {
  const [metrics, setMetrics] = useState<LazyLoadMetric | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endTracking = useCallback(() => {
    if (startTimeRef.current === null) {
      console.warn(`endTracking called without startTracking for ${componentName}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;

    const metric: LazyLoadMetric = {
      componentName,
      loadStartTime: startTimeRef.current,
      loadEndTime: endTime,
      duration,
      success: true,
      timestamp: Date.now(),
    };

    setMetrics(metric);
    startTimeRef.current = null;

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${componentName} render time: ${duration.toFixed(2)}ms`);
    }
  }, [componentName]);

  return {
    startTracking,
    endTracking,
    metrics,
  };
}

/**
 * Hook to get all metrics for a specific component
 *
 * @param componentName - Name of the component
 * @returns Array of all metrics for that component
 *
 * @example
 * ```typescript
 * function ComponentStats({ componentName }) {
 *   const metrics = useComponentMetrics(componentName);
 *
 *   return (
 *     <div>
 *       <p>Total loads: {metrics.length}</p>
 *       <p>Average: {metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length}ms</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useComponentMetrics(componentName: string): LazyLoadMetric[] {
  const [metrics, setMetrics] = useState<LazyLoadMetric[]>([]);

  useEffect(() => {
    // Get initial metrics
    setMetrics(getLazyLoadMetricsByComponent(componentName));

    // Set up polling to update metrics (every 5 seconds)
    const interval = setInterval(() => {
      setMetrics(getLazyLoadMetricsByComponent(componentName));
    }, 5000);

    return () => clearInterval(interval);
  }, [componentName]);

  return metrics;
}

/**
 * Hook to track Suspense boundary duration
 *
 * @param suspenseId - Unique identifier for the Suspense boundary
 * @returns Suspense metric data
 *
 * @example
 * ```typescript
 * function MySuspenseWrapper() {
 *   const suspenseMetric = useSuspenseMetrics('myBoundary');
 *
 *   return (
 *     <Suspense fallback={<Loading />}>
 *       <LazyComponent />
 *     </Suspense>
 *   );
 * }
 * ```
 */
export function useSuspenseMetrics(suspenseId: string): SuspenseMetric | null {
  const [metric, setMetric] = useState<SuspenseMetric | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const fallbackShownRef = useRef<boolean>(false);

  useEffect(() => {
    // Track when Suspense starts
    startTimeRef.current = performance.now();
    fallbackShownRef.current = false;

    // Track if fallback is shown (if we're still here after 100ms, fallback was shown)
    const fallbackTimeout = setTimeout(() => {
      fallbackShownRef.current = true;
    }, 100);

    return () => {
      clearTimeout(fallbackTimeout);

      // Track when Suspense completes
      if (startTimeRef.current !== null) {
        const endTime = performance.now();
        const duration = endTime - startTimeRef.current;

        const suspenseMetric: SuspenseMetric = {
          suspenseId,
          startTime: startTimeRef.current,
          endTime,
          duration,
          fallbackShown: fallbackShownRef.current,
          timestamp: Date.now(),
        };

        setMetric(suspenseMetric);

        if (import.meta.env.DEV && fallbackShownRef.current) {
          console.log(
            `⏳ Suspense (${suspenseId}): ${duration.toFixed(0)}ms (fallback shown)`
          );
        }
      }
    };
  }, [suspenseId]);

  return metric;
}

/**
 * Hook to monitor overall performance health
 *
 * @returns Performance health status and metrics
 *
 * @example
 * ```typescript
 * function PerformanceMonitor() {
 *   const { healthy, avgLoadTime, slowComponents } = usePerformanceHealth();
 *
 *   if (!healthy) {
 *     return <Warning>Performance issues detected!</Warning>;
 *   }
 *
 *   return <div>All systems operational</div>;
 * }
 * ```
 */
export function usePerformanceHealth() {
  const [health, setHealth] = useState({
    healthy: true,
    avgLoadTime: 0,
    slowComponents: [] as string[],
    failureRate: 0,
  });

  useEffect(() => {
    const checkHealth = async () => {
      const { checkLazyLoadHealth } = await import('../utils/performance/lazyLoadTracker');
      const healthCheck = checkLazyLoadHealth();

      const { detectSlowComponents } = await import('../utils/performance/lazyLoadTracker');
      const slow = detectSlowComponents();

      setHealth({
        healthy: healthCheck.healthy,
        avgLoadTime: healthCheck.avgDuration,
        slowComponents: slow.map(s => s.componentName),
        failureRate: healthCheck.failureRate,
      });
    };

    // Check immediately
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return health;
}

/**
 * Hook to get real-time performance statistics
 *
 * @param refreshInterval - How often to update stats (ms), default 5000
 * @returns Current performance statistics
 *
 * @example
 * ```typescript
 * function PerformanceStats() {
 *   const stats = usePerformanceStats(10000); // Update every 10 seconds
 *
 *   return (
 *     <div>
 *       <p>Total loads: {stats.totalLoads}</p>
 *       <p>Average: {stats.avgDuration}ms</p>
 *       <p>Failures: {stats.failures}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePerformanceStats(refreshInterval: number = 5000) {
  const [stats, setStats] = useState({
    totalLoads: 0,
    avgDuration: 0,
    medianDuration: 0,
    failures: 0,
    p95Duration: 0,
  });

  useEffect(() => {
    const updateStats = async () => {
      const { getLazyLoadStats } = await import('../utils/performance/lazyLoadTracker');
      const currentStats = getLazyLoadStats();
      setStats(currentStats);
    };

    // Update immediately
    updateStats();

    // Update on interval
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return stats;
}

/**
 * Hook to track component mount time
 *
 * Automatically tracks how long a component takes to mount
 *
 * @param componentName - Name of the component
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   useComponentMountTime('MyComponent');
 *
 *   return <div>My Component</div>;
 * }
 * ```
 */
export function useComponentMountTime(componentName: string): void {
  useEffect(() => {
    const mountTime = performance.now();

    return () => {
      const unmountTime = performance.now();
      const lifetime = unmountTime - mountTime;

      if (import.meta.env.DEV) {
        console.log(`⏱️ ${componentName} lifetime: ${lifetime.toFixed(0)}ms`);
      }
    };
  }, [componentName]);
}
