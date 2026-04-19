
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes code, explains bugs, and provides corrected code.
 *
 * - explainCodeAndFixBugs - An async function that takes code as input and returns the AI's analysis and corrected code.
 * - ExplainCodeAndFixBugsInput - The input type for the explainCodeAndFixBugs function (a string of code).
 * - ExplainCodeAndFixBugsOutput - The output type, containing the AI's explanation and the corrected code.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainCodeAndFixBugsInputSchema = z.object({
  code: z.string().describe('The code to analyze for bugs and errors.'),
});
export type ExplainCodeAndFixBugsInput = z.infer<
  typeof ExplainCodeAndFixBugsInputSchema
>;

const ExplainCodeAndFixBugsOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A summary of the bugs and errors in the code.'),
  correctedCode: z
    .string()
    .describe('The fully corrected code provided by the AI.'),
});
export type ExplainCodeAndFixBugsOutput = z.infer<
  typeof ExplainCodeAndFixBugsOutputSchema
>;

export async function explainCodeAndFixBugs(
  code: string
): Promise<ExplainCodeAndFixBugsOutput> {
  return explainCodeAndFixBugsFlow({ code });
}

const explainCodeAndFixBugsPrompt = ai.definePrompt({
  name: 'explainCodeAndFixBugsPrompt',
  input: { schema: ExplainCodeAndFixBugsInputSchema },
  output: { schema: ExplainCodeAndFixBugsOutputSchema },
  prompt: `You are an expert programming assistant.
Analyze the following code, identify any bugs or mistakes, and provide a corrected version.
Also, provide a brief explanation of the errors you found.
The correctedCode you provide must be properly formatted, with correct indentation and every line of code on a new line.

Code:
\`\`\`
{{{code}}}
\`\`\`

If the provided code is empty or just contains whitespace, for the explanation field, respond with: "No code was provided for analysis. Please provide code for me to find bugs, explain errors, and correct.", and for the correctedCode field, respond with: "// No code provided.".
`,
});

const explainCodeAndFixBugsFlow = ai.defineFlow(
  {
    name: 'explainCodeAndFixBugsFlow',
    inputSchema: ExplainCodeAndFixBugsInputSchema,
    outputSchema: ExplainCodeAndFixBugsOutputSchema,
  },
  async (input) => {
    if (!input.code?.trim()) {
      return {
        explanation:
          'No code was provided for analysis. Please provide code for me to find bugs, explain errors, and correct.',
        correctedCode: '// No code provided.',
      };
    }
    const { output } = await explainCodeAndFixBugsPrompt(input);
    return output!;
  }
);
