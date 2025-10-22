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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUser, useFirestore, useMemoFirebase, useSettings } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Category, Transaction } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
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

const transactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().min(1, 'Please select a category'),
  date: z.date(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  transaction,
}: AddTransactionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const { toast } = useToast();
  const isEditing = !!transaction;

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      notes: '',
    },
  });
  
  useEffect(() => {
    if (transaction) {
      form.reset({
        ...transaction,
        date: parseISO(transaction.date),
      });
    } else {
      form.reset({
        amount: undefined,
        categoryId: '',
        type: 'expense',
        date: new Date(),
        notes: '',
      });
    }
  }, [transaction, form]);


  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const transactionType = form.watch('type');
  const filteredCategories = categories?.filter(
    (c) => c.type === transactionType
  );

  async function onSubmit(values: TransactionFormData) {
    if (!user || !firestore) return;

    const category = categories?.find((c) => c.id === values.categoryId);

    const transactionData = {
      userId: user.uid,
      amount: values.amount,
      type: values.type,
      categoryId: values.categoryId,
      date: values.date.toISOString(),
      notes: values.notes || '',
      tags: [],
      attachments: [],
      currency: settings.currency,
      category: category?.name || 'Uncategorized',
    };
    
    if (isEditing && transaction) {
      const docRef = doc(firestore, `users/${user.uid}/transactions`, transaction.id);
      setDocumentNonBlocking(docRef, {...transactionData, updatedAt: serverTimestamp()}, { merge: true });
      toast({
        title: 'Transaction Updated',
        description: 'Your transaction has been successfully updated.',
      });
    } else {
        const collectionRef = collection(
            firestore,
            `users/${user.uid}/transactions`
        );
        addDocumentNonBlocking(collectionRef, {...transactionData, createdAt: serverTimestamp(), updatedAt: serverTimestamp()});
        toast({
            title: 'Transaction Added',
            description: 'Your transaction has been successfully recorded.',
        });
    }


    form.reset({
      amount: undefined,
      categoryId: '',
      type: 'expense',
      date: new Date(),
      notes: '',
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your transaction details.' : 'Record a new income or expense.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue('categoryId', '');
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!filteredCategories}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a note..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {isEditing ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
