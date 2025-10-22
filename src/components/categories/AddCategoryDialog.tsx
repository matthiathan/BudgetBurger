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
import { useUser, useFirestore } from '@/firebase';
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const iconOptions = [
  'Utensils',
  'Bus',
  'ShoppingBag',
  'Home',
  'Ticket',
  'Briefcase',
  'PenTool',
];

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense']),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Must be a valid hex color'),
  icon: z.string().min(1, 'Please select an icon'),
  monthlyBudget: z.coerce.number().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  category,
}: AddCategoryDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
      color: '#FF6B6B',
      icon: '',
      monthlyBudget: undefined,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset(category);
    } else {
      form.reset({
        name: '',
        type: 'expense',
        color: '#FF6B6B',
        icon: '',
        monthlyBudget: undefined,
      });
    }
  }, [category, form, open]);

  async function onSubmit(values: CategoryFormData) {
    if (!user || !firestore) return;

    const dataToSave = {
      ...values,
      monthlyBudget: values.monthlyBudget || null,
      userId: user.uid,
    };

    if (isEditing && category) {
      const docRef = doc(firestore, `users/${user.uid}/categories`, category.id);
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });
      toast({
        title: 'Category Updated',
        description: 'Your category has been successfully updated.',
      });
    } else {
      const collectionRef = collection(firestore, `users/${user.uid}/categories`);
      addDocumentNonBlocking(collectionRef, dataToSave);
      toast({
        title: 'Category Added',
        description: 'Your new category has been created.',
      });
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Add Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your category details.'
              : 'Create a new category for your transactions.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category type" />
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isEditing ? 'Save Changes' : 'Add Category'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
