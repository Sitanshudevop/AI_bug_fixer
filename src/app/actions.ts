
'use server';

import {
  explainCodeAndFixBugs,
  type ExplainCodeAndFixBugsOutput,
} from '@/ai/flows/explain-code-and-fix-bugs';
import { runCode, type RunCodeOutput } from '@/ai/flows/run-code';

export async function analyzeCodeAction(
  code: string
): Promise<{ data: ExplainCodeAndFixBugsOutput | null; error: string | null }> {
  if (!code.trim()) {
    return { data: null, error: 'Code input cannot be empty.' };
  }

  try {
    const result = await explainCodeAndFixBugs(code);
    if (result?.correctedCode && result?.explanation) {
      return { data: result, error: null };
    }
    throw new Error('The AI model returned an invalid response format.');
  } catch (e: any) {
    console.error('Error analyzing code:', e);
    return {
      data: null,
      error:
        e.message ||
        'An unexpected error occurred while analyzing the code. Please try again.',
    };
  }
}

export async function runCodeAction(
  code: string
): Promise<{ data: RunCodeOutput | null; error: string | null }> {
  if (!code.trim()) {
    return { data: null, error: 'Code input cannot be empty.' };
  }

  try {
    const result = await runCode(code);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error running code:', e);
    return {
      data: null,
      error:
        'An unexpected error occurred while running the code. Please try again.',
    };
  }
}
