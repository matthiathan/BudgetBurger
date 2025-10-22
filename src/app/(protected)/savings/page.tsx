'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase, useSettings } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { PlusCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Goal } from '@/lib/types';
import { useState } from 'react';
import { AddGoalDialog } from '@/components/goals/AddGoalDialog';
import {
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { AddContributionDialog } from '@/components/goals/AddContributionDialog';

export default function SavingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const [isAddGoalOpen, setAddGoalOpen] = useState(false);
  const [isContribOpen, setContribOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const goalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/goals`);
  }, [firestore, user]);

  const { data: goals, isLoading } = useCollection<Goal>(goalsQuery);

  const handleDelete = (goalId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/goals`, goalId);
    deleteDocumentNonBlocking(docRef);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setAddGoalOpen(true);
  };

  const handleAddContribution = (goal: Goal) => {
    setSelectedGoal(goal);
    setContribOpen(true);
  };

  const handleAddGoalDialogClose = (open: boolean) => {
    if (!open) {
      setEditingGoal(null);
    }
    setAddGoalOpen(open);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Savings Goals
            </h1>
            <p className="text-muted-foreground">
              Track your progress towards your financial aspirations.
            </p>
          </div>
          <Button onClick={() => setAddGoalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Savings Goal
          </Button>
        </div>

        {isLoading && <p>Loading savings goals...</p>}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals?.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const timeLeft = formatDistanceToNow(parseISO(goal.deadline), {
              addSuffix: true,
            });

            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <CardDescription>
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleAddContribution(goal)}
                      >
                        Contribution
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(goal)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(goal.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="text-2xl font-bold">
                    {settings.currency}{goal.currentAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    saved of {settings.currency}{goal.targetAmount.toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">
                        {Math.round(progress)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {timeLeft}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      aria-label={`${goal.title} progress`}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddContribution(goal)}
                  >
                    Contribution
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <AddGoalDialog
        open={isAddGoalOpen}
        onOpenChange={handleAddGoalDialogClose}
        goal={editingGoal}
      />
      {selectedGoal && (
        <AddContributionDialog
          open={isContribOpen}
          onOpenChange={setContribOpen}
          goal={selectedGoal}
        />
      )}
    </>
  );
}
