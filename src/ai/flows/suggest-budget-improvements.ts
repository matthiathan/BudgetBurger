'use server';

/**
 * @fileOverview Provides budget improvement suggestions based on user transaction data.
 *
 * - suggestBudgetImprovements - Analyzes user transactions and suggests improvements.
 * - SuggestBudgetImprovementsInput - Input type for the suggestBudgetImprovements function.
 * - SuggestBudgetImprovementsOutput - Return type for the suggestBudgetImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetImprovementsInputSchema = z.object({
  transactionHistory: z.string().describe('A stringified JSON array of the user\'s transaction history, where each transaction includes amount, category, date, and notes.'),
  financialGoals: z.string().describe('A stringified JSON array of the user\'s financial goals, including title, target amount, current amount, and deadline.'),
  currency: z.string().describe('The currency used for the transactions and goals.'),
});

export type SuggestBudgetImprovementsInput = z.infer<typeof SuggestBudgetImprovementsInputSchema>;

const SuggestBudgetImprovementsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggestions for budget improvements, tailored to the user\'s transaction history and financial goals.'),
});

export type SuggestBudgetImprovementsOutput = z.infer<typeof SuggestBudgetImprovementsOutputSchema>;

export async function suggestBudgetImprovements(input: SuggestBudgetImprovementsInput): Promise<SuggestBudgetImprovementsOutput> {
  return suggestBudgetImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetImprovementsPrompt',
  input: {schema: SuggestBudgetImprovementsInputSchema},
  output: {schema: SuggestBudgetImprovementsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's transaction history and financial goals to provide personalized suggestions on how they can save money and improve their budget.

Transaction History (JSON):
{{{transactionHistory}}}

Financial Goals (JSON):
{{{financialGoals}}}

Currency: {{{currency}}}

Provide specific and actionable suggestions. Consider areas such as reducing spending in certain categories, setting up automated savings, or adjusting financial goals based on their current progress.

Format your output as a JSON array of strings.
`, 
});

const suggestBudgetImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestBudgetImprovementsFlow',
    inputSchema: SuggestBudgetImprovementsInputSchema,
    outputSchema: SuggestBudgetImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
