"use client";

import { useState } from 'react';
import { suggestBudgetImprovements, SuggestBudgetImprovementsInput } from '@/ai/flows/suggest-budget-improvements';
import { suggestMeaningfulGoals, SuggestMeaningfulGoalsInput } from '@/ai/flows/suggest-meaningful-goals';
import { suggestBudgetGoals, SuggestBudgetGoalsInput } from '@/ai/flows/suggest-budget-goals';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type FlowName = 'suggestBudgetImprovements' | 'suggestMeaningfulGoals' | 'suggestBudgetGoals';

type GenAISuggestionsProps = {
    flow: FlowName;
    input: SuggestBudgetImprovementsInput | SuggestMeaningfulGoalsInput | SuggestBudgetGoalsInput;
    buttonText: string;
};

export function GenAISuggestions({ flow, input, buttonText }: GenAISuggestionsProps) {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getSuggestions = async () => {
        setLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            let result;
            if (flow === 'suggestBudgetImprovements') {
                result = await suggestBudgetImprovements(input as SuggestBudgetImprovementsInput);
                setSuggestions(result.suggestions);
            } else if (flow === 'suggestMeaningfulGoals') {
                result = await suggestMeaningfulGoals(input as SuggestMeaningfulGoalsInput);
                setSuggestions(result.suggestedGoals);
            } else if (flow === 'suggestBudgetGoals') {
                result = await suggestBudgetGoals(input as SuggestBudgetGoalsInput);
                setSuggestions(result.suggestedGoals);
            }
        } catch (e) {
            setError('An error occurred while generating suggestions. Please try again.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button onClick={getSuggestions} disabled={loading}>
                {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                {buttonText}
            </Button>
            
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {suggestions.length > 0 && (
                 <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>AI Suggestions</AlertTitle>
                    <AlertDescription>
                        <ul className="mt-2 list-disc space-y-2 pl-5">
                            {suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
