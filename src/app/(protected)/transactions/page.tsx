'use client';

import { File, ListFilter, PlusCircle, MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase, useSettings } from '@/firebase';
import { collection, orderBy, query, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { AddTransactionDialog } from '@/components/transactions/AddTransactionDialog';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function TransactionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const [isAddOpen, setAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(
    transactionsQuery
  );

  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions?.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAddOpen(true);
  };
  
  const handleDelete = (transactionId: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/transactions`, transactionId);
    deleteDocumentNonBlocking(docRef);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingTransaction(null);
    }
    setAddOpen(open);
  };


  return (
    <>
      <Tabs defaultValue="all" onValueChange={setFilter}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expense</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Date</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Category</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => setAddOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Transaction
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value={filter}>
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                Manage your income and expenses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredTransactions?.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {tx.category}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize',
                            tx.type === 'income'
                              ? 'text-emerald-500 border-emerald-500/50'
                              : 'text-foreground'
                          )}
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(tx.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          tx.type === 'income'
                            ? 'text-emerald-500 dark:text-emerald-400'
                            : ''
                        )}
                      >
                        {tx.type === 'income' ? '+' : '-'}{settings.currency}{tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(tx)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(tx.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing{' '}
                <strong>
                  1-{filteredTransactions?.length ?? 0}
                </strong> of{' '}
                <strong>{filteredTransactions?.length ?? 0}</strong>{' '}
                transactions
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <AddTransactionDialog 
        open={isAddOpen} 
        onOpenChange={handleDialogClose}
        transaction={editingTransaction}
      />
    </>
  );
}
