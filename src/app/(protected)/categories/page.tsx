'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase, useSettings } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Category } from '@/lib/types';
import { useState } from 'react';
import { AddCategoryDialog } from '@/components/categories/AddCategoryDialog';
import {
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';

export default function CategoriesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const [isAddOpen, setAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);

  const { data: categories, isLoading } =
    useCollection<Category>(categoriesQuery);

  const incomeCategories = categories?.filter((c) => c.type === 'income') || [];
  const expenseCategories =
    categories?.filter((c) => c.type === 'expense') || [];

  const handleDelete = (categoryId: string) => {
    if (!user) return;
    const docRef = doc(
      firestore,
      `users/${user.uid}/categories`,
      categoryId
    );
    deleteDocumentNonBlocking(docRef);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setAddOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingCategory(null);
    }
    setAddOpen(open);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
              Categories
            </h1>
            <p className="text-muted-foreground">
              Organize your transactions into categories for better insights.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Income Categories</CardTitle>
              <CardDescription>Categories for your earnings.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isLoading && <p>Loading...</p>}
              {incomeCategories.map((cat, index) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: `${cat.color}30` }}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          style={{ color: cat.color }}
                          className="h-5 w-5"
                        />
                      </div>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(cat)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {index < incomeCategories.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Categories for your spending.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {isLoading && <p>Loading...</p>}
              {expenseCategories.map((cat, index) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="p-3 rounded-full"
                        style={{ backgroundColor: `${cat.color}30` }}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          style={{ color: cat.color }}
                          className="h-5 w-5"
                        />
                      </div>
                      <div>
                        <span className="font-medium">{cat.name}</span>
                        {cat.monthlyBudget && (
                          <p className="text-xs text-muted-foreground">
                            Budget: {settings.currency}{cat.monthlyBudget}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(cat)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {index < expenseCategories.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <AddCategoryDialog
        open={isAddOpen}
        onOpenChange={handleDialogClose}
        category={editingCategory}
      />
    </>
  );
}
