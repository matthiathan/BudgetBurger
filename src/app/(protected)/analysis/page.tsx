'use client';
import { GenAISuggestions } from "@/components/analysis/GenAISuggestions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { Transaction, Goal } from "@/lib/types";

export default function AnalysisPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const transactionsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, `users/${user.uid}/transactions`));
    }, [firestore, user]);

    const goalsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, `users/${user.uid}/goals`);
    }, [firestore, user]);

    const { data: transactions } = useCollection<Transaction>(transactionsQuery);
    const { data: goals } = useCollection<Goal>(goalsQuery);

    const transactionHistory = JSON.stringify(transactions || []);
    const financialGoals = JSON.stringify(goals || []);
    const spendingPatterns = "User spends moderately on food and transport, with a large recurring expense for housing.";
    const income = 3500;
    const currency = "USD";

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">AI Financial Analysis</h1>
                <p className="text-muted-foreground">
                    Get personalized insights and suggestions from our AI assistant.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Budget Improvement Suggestions</CardTitle>
                        <CardDescription>Let our AI analyze your spending and suggest ways to save money.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GenAISuggestions
                            flow="suggestBudgetImprovements"
                            input={{
                                transactionHistory,
                                financialGoals,
                                currency,
                            }}
                            buttonText="Analyze My Budget"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Meaningful Goal Suggestions</CardTitle>
                        <CardDescription>Discover new financial goals tailored to your income and spending habits.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GenAISuggestions
                            flow="suggestMeaningfulGoals"
                            input={{
                                income,
                                spendingPatterns,
                            }}
                            buttonText="Suggest Goals For Me"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Budget Goal Suggestions</CardTitle>
                        <CardDescription>Get AI-powered suggestions for setting effective budget goals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GenAISuggestions
                            flow="suggestBudgetGoals"
                            input={{
                                transactionHistory,
                                currency,
                            }}
                            buttonText="Suggest Budget Goals"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
