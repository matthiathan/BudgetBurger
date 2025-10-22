'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUser, useFirestore, useSettings } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import type { Goal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const contributionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface AddContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
}

export function AddContributionDialog({
  open,
  onOpenChange,
  goal,
}: AddContributionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const { toast } = useToast();

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: undefined,
    }
  });

  async function handleContribution(values: ContributionFormData, type: 'add' | 'withdraw') {
    if (!user) return;

    const amount = type === 'add' ? values.amount : -values.amount;
    const newCurrentAmount = goal.currentAmount + amount;
    
    if (newCurrentAmount < 0) {
        toast({
            variant: "destructive",
            title: "Invalid Amount",
            description: "Withdrawal amount cannot be greater than the current saved amount.",
        });
        return;
    }


    const docRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
    updateDocumentNonBlocking(docRef, { currentAmount: newCurrentAmount });

    toast({
      title: `Contribution ${type === 'add' ? 'Added' : 'Withdrawn'}`,
      description: `Your goal progress has been updated.`,
    });

    form.reset({ amount: undefined });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Contribution for {goal.title}</DialogTitle>
          <DialogDescription>
            Add or withdraw funds from your goal. Your current amount is {settings.currency}{goal.currentAmount.toLocaleString()}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                 <Button
                    type="button"
                    variant="destructive"
                    onClick={form.handleSubmit((data) => handleContribution(data, 'withdraw'))}
                >
                    Withdraw
                </Button>
                <Button
                    type="button"
                    onClick={form.handleSubmit((data) => handleContribution(data, 'add'))}
                >
                    Add Contribution
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
