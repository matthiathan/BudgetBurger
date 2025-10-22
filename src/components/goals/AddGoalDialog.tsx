'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { Goal } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  currentAmount: z.coerce.number().min(0, 'Current amount cannot be negative'),
  deadline: z.date(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: Goal | null;
}

export function AddGoalDialog({ open, onOpenChange, goal }: AddGoalDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const { toast } = useToast();
  const isEditing = !!goal;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      targetAmount: undefined,
      currentAmount: 0,
      deadline: new Date(),
    },
  });

  useEffect(() => {
    if (goal) {
      form.reset({
        ...goal,
        deadline: parseISO(goal.deadline),
      });
    } else {
      form.reset({
        title: '',
        targetAmount: undefined,
        currentAmount: 0,
        deadline: new Date(),
      });
    }
  }, [goal, form, open]);

  async function onSubmit(values: GoalFormData) {
    if (!user) return;

    const goalData = {
      ...values,
      deadline: values.deadline.toISOString(),
      userId: user.uid,
      currency: settings.currency, // Use currency from settings
      priority: 'medium', // Default priority
      status: 'active', // Default status
    };

    if (isEditing && goal) {
      const docRef = doc(firestore, `users/${user.uid}/goals`, goal.id);
      setDocumentNonBlocking(docRef, goalData, { merge: true });
      toast({
        title: 'Savings Goal Updated',
        description: 'Your savings goal has been successfully updated.',
      });
    } else {
      const collectionRef = collection(firestore, `users/${user.uid}/goals`);
      addDocumentNonBlocking(collectionRef, goalData);
      toast({
        title: 'Savings Goal Added',
        description: 'Your new savings goal has been created.',
      });
    }

    form.reset({
        title: '',
        targetAmount: undefined,
        currentAmount: 0,
        deadline: new Date(),
      });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Savings Goal' : 'Add a New Savings Goal'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your savings goal details below.'
              : 'Set a new savings goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., New Car Deposit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="20000" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isEditing ? 'Save Changes' : 'Add Goal'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
