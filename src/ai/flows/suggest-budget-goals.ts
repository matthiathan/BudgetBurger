'use server';

/**
 * @fileOverview Suggests budget goals to the user based on their past spending habits.
 *
 * - suggestBudgetGoals - Analyzes user transaction data and suggests budget goals.
 * - SuggestBudgetGoalsInput - Input type for the suggestBudgetGoals function.
 * - SuggestBudgetGoalsOutput - Return type for the suggestBudgetGoals function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetGoalsInputSchema = z.object({
  transactionHistory: z.string().describe('A stringified JSON array of the user\'s transaction history, where each transaction includes amount, category, date, and notes.'),
  currency: z.string().describe('The currency used for the transactions.'),
});

export type SuggestBudgetGoalsInput = z.infer<typeof SuggestBudgetGoalsInputSchema>;

const SuggestBudgetGoalsOutputSchema = z.object({
  suggestedGoals: z.array(z.string()).describe('An array of suggested budget goals based on the user\'s spending habits.'),
});

export type SuggestBudgetGoalsOutput = z.infer<typeof SuggestBudgetGoalsOutputSchema>;

export async function suggestBudgetGoals(input: SuggestBudgetGoalsInput): Promise<SuggestBudgetGoalsOutput> {
  return suggestBudgetGoalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetGoalsPrompt',
  input: {schema: SuggestBudgetGoalsInputSchema},
  output: {schema: SuggestBudgetGoalsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user\'s transaction history to provide personalized suggestions for budget goals. These goals should help the user save money and improve their financial situation.

Transaction History (JSON):
{{{transactionHistory}}}

Currency: {{{currency}}}

Provide specific and actionable suggestions for budget goals. Consider areas where the user is spending a significant amount of money and suggest ways to reduce spending in those areas.  Suggest concrete goals with associated savings amounts.

Format your output as a JSON array of strings.
`,
});

const suggestBudgetGoalsFlow = ai.defineFlow(
  {
    name: 'suggestBudgetGoalsFlow',
    inputSchema: SuggestBudgetGoalsInputSchema,
    outputSchema: SuggestBudgetGoalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
