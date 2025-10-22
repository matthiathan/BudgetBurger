'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests meaningful financial goals to the user based on their spending patterns and income.
 *
 * - suggestMeaningfulGoals - A function that suggests financial goals.
 * - SuggestMeaningfulGoalsInput - The input type for the suggestMeaningfulGoals function.
 * - SuggestMeaningfulGoalsOutput - The output type for the suggestMeaningfulGoals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMeaningfulGoalsInputSchema = z.object({
  income: z.number().describe('The user\u2019s monthly income.'),
  spendingPatterns: z
    .string()
    .describe(
      'A description of the user\u2019s spending patterns, including categories and amounts spent in each category.'
    ),
});
export type SuggestMeaningfulGoalsInput = z.infer<typeof SuggestMeaningfulGoalsInputSchema>;

const SuggestMeaningfulGoalsOutputSchema = z.object({
  suggestedGoals: z
    .array(z.string())
    .describe('An array of suggested financial goals, such as saving for a down payment on a house or paying off debt.'),
});
export type SuggestMeaningfulGoalsOutput = z.infer<typeof SuggestMeaningfulGoalsOutputSchema>;

export async function suggestMeaningfulGoals(
  input: SuggestMeaningfulGoalsInput
): Promise<SuggestMeaningfulGoalsOutput> {
  return suggestMeaningfulGoalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMeaningfulGoalsPrompt',
  input: {schema: SuggestMeaningfulGoalsInputSchema},
  output: {schema: SuggestMeaningfulGoalsOutputSchema},
  prompt: `You are a financial advisor. Based on the user's income and spending patterns, suggest relevant financial goals.

Income: {{{income}}}
Spending Patterns: {{{spendingPatterns}}}

Suggested Goals:`,
});

const suggestMeaningfulGoalsFlow = ai.defineFlow(
  {
    name: 'suggestMeaningfulGoalsFlow',
    inputSchema: SuggestMeaningfulGoalsInputSchema,
    outputSchema: SuggestMeaningfulGoalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
