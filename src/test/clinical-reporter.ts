import { Reporter, Task } from 'vitest';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface ClinicalTestFailure {
  test: string;
  suite: string;
  error: string;
  stack?: string;
  clinicalContext?: {
    calculator?: string;
    inputs?: Record<string, any>;
    expected?: any;
    actual?: any;
    reference?: string;
    suggestions?: string[];
  };
}

export default class ClinicalReporter implements Reporter {
  private failures: ClinicalTestFailure[] = [];

  onTaskUpdate(tasks: Task[]) {
    for (const task of tasks) {
      if (task.result?.state === 'fail' && task.type === 'test') {
        const error = task.result.errors?.[0];

        const failure: ClinicalTestFailure = {
          test: task.name,
          suite: task.suite?.name || 'Unknown',
          error: error?.message || 'Unknown error',
          stack: error?.stack,
        };

        // Try to extract clinical context from test meta or error message
        if (task.meta) {
          failure.clinicalContext = {
            calculator: task.meta.calculator as string,
            inputs: task.meta.inputs as Record<string, any>,
            expected: task.meta.expected,
            actual: task.meta.actual,
            reference: task.meta.reference as string,
            suggestions: task.meta.suggestions as string[],
          };
        }

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
