import type { Reporter, TaskResultPack } from 'vitest';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface ClinicalTestFailure {
  test: string;
  suite: string;
  error: string;
  stack?: string;
  clinicalContext?: {
    calculator?: string;
    inputs?: Record<string, unknown>;
    expected?: unknown;
    actual?: unknown;
    reference?: string;
    suggestions?: string[];
  };
}

export default class ClinicalReporter implements Reporter {
  private failures: ClinicalTestFailure[] = [];

  onTaskUpdate(packs: TaskResultPack[]) {
    for (const [taskId, result] of packs) {
      if (result && result.state === 'fail') {
        const error = result.errors?.[0];

        const failure: ClinicalTestFailure = {
          test: taskId,
          suite: 'Test Suite',
          error: error?.message || 'Unknown error',
          stack: error?.stack,
        };

        this.failures.push(failure);
      }
    }
  }

  async onFinished() {
    if (this.failures.length === 0) return;

    console.log('\n\n📋 CLINICAL TEST FAILURES - AI DEBUG CONTEXT\n');
    console.log('='.repeat(80));

    for (const failure of this.failures) {
      console.log(`\n❌ ${failure.suite} > ${failure.test}`);
      console.log('-'.repeat(80));

      if (failure.clinicalContext) {
        const ctx = failure.clinicalContext;

        if (ctx.calculator) {
          console.log(`🧮 Calculator: ${ctx.calculator}`);
        }

        if (ctx.inputs) {
          console.log(`📥 Inputs:`);
          console.log(JSON.stringify(ctx.inputs, null, 2));
        }

        if (ctx.expected !== undefined) {
          console.log(`✓ Expected: ${JSON.stringify(ctx.expected)}`);
        }

        if (ctx.actual !== undefined) {
          console.log(`✗ Actual: ${JSON.stringify(ctx.actual)}`);
        }

        if (ctx.reference) {
          console.log(`📚 Reference: ${ctx.reference}`);
        }

        if (ctx.suggestions && ctx.suggestions.length > 0) {
          console.log(`💡 Possible Issues:`);
          ctx.suggestions.forEach((suggestion, i) => {
            console.log(`   ${i + 1}. ${suggestion}`);
          });
        }
      }

      console.log(`\n⚠️  Error: ${failure.error}`);

      if (failure.stack) {
        console.log(`\n📍 Stack Trace:`);
        console.log(failure.stack);
      }

      console.log('\n' + '='.repeat(80));
    }

    // Write JSON output for programmatic parsing
    const jsonOutput = {
      timestamp: new Date().toISOString(),
      totalFailures: this.failures.length,
      failures: this.failures,
    };

    try {
      writeFileSync(
        resolve(process.cwd(), 'test-failures.json'),
        JSON.stringify(jsonOutput, null, 2)
      );
      console.log('\n💾 Detailed failure report saved to: test-failures.json');
    } catch (error) {
      console.error('Failed to write JSON report:', error);
    }

    console.log('\n');
  }
}
