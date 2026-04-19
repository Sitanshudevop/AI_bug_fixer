
'use server';

/**
 * @fileOverview This file defines a Genkit flow that takes code as input and returns its expected output.
 *
 * - runCode - An async function that takes code as input and returns the AI's interpretation of its output.
 * - RunCodeInput - The input type for the runCode function (a string of code).
 * - RunCodeOutput - The output type, containing the AI's generated output for the code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RunCodeInputSchema = z.object({
  code: z.string().describe('The code to execute and get the output for.'),
});
export type RunCodeInput = z.infer<typeof RunCodeInputSchema>;

const RunCodeOutputSchema = z.object({
  output: z.string().describe('The AI-generated output of the code.'),
});
export type RunCodeOutput = z.infer<typeof RunCodeOutputSchema>;

export async function runCode(code: string): Promise<RunCodeOutput> {
  return runCodeFlow({ code });
}

const runCodePrompt = ai.definePrompt({
  name: 'runCodePrompt',
  input: { schema: RunCodeInputSchema },
  output: { schema: RunCodeOutputSchema },
  prompt: `You are a code execution engine.
Analyze the following code and determine what its output would be when executed.
For UI components, describe the rendered output. For other code, show what would be printed to the console.

Code:
{{{code}}}
`,
});

const runCodeFlow = ai.defineFlow(
  {
    name: 'runCodeFlow',
    inputSchema: RunCodeInputSchema,
    outputSchema: RunCodeOutputSchema,
  },
  async (input) => {
    if (!input.code?.trim()) {
      return {
        output: '// No code provided to run.',
      };
    }
    const { output } = await runCodePrompt(input);
    return output!;
  }
);
