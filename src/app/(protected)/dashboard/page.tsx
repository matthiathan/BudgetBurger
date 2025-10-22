'use client';
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Target,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { WelcomeMessage } from '@/components/dashboard/WelcomeMessage';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { useUser, useFirestore, useMemoFirebase, useSettings } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Transaction, Goal, Category } from '@/lib/types';
import { useLocale } from '@/hooks/use-locale';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const { t } = useLocale();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [firestore, user]);

  const recentTransactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc'),
      limit(5)
    );
  }, [firestore, user]);

  const goalsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/goals`);
  }, [firestore, user]);

  const categoriesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/categories`);
  }, [firestore, user]);

  const { data: transactions, isLoading: loadingTransactions } =
    useCollection<Transaction>(transactionsQuery);
  const { data: recentTransactions, isLoading: loadingRecent } =
    useCollection<Transaction>(recentTransactionsQuery);
  const { data: goals, isLoading: loadingGoals } = useCollection<Goal>(goalsQuery);
  const { data: categories, isLoading: loadingCategories } =
    useCollection<Category>(categoriesQuery);

  const totalIncome =
    transactions
      ?.filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalExpense =
    transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalBalance = totalIncome - totalExpense;

  const expenseTransactions = transactions?.filter((t) => t.type === 'expense');
  const categorySpending = expenseTransactions?.reduce(
    (acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { amount: 0 };
      }
      acc[t.category].amount += t.amount;
      return acc;
    },
    {} as Record<string, { amount: number }>
  );

  const categoryChartData = categorySpending
    ? Object.entries(categorySpending).map(([category, data]) => ({
        category,
        amount: data.amount,
        fill: categories?.find((c) => c.name === category)?.color || '#8884d8',
      }))
    : [];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <WelcomeMessage name={user?.displayName} />
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.totalBalance')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {settings.currency}{totalBalance.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.totalBalanceDesc')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.income')}</CardTitle>
              <div className="h-4 w-4 bg-emerald-500 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                +{settings.currency}{totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.expenses')}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                -{settings.currency}{totalExpense.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">{t('dashboard.thisMonth')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.goalsActive')}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.goalsActiveDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
                <CardDescription>
                  {t('dashboard.recentTransactionsDesc')}
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/transactions">
                  {t('dashboard.viewAll')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('transactions.category')}</TableHead>
                    <TableHead>{t('transactions.date')}</TableHead>
                    <TableHead className="text-right">{t('transactions.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRecent && <TableRow><TableCell colSpan={3} className="text-center">{t('loading')}</TableCell></TableRow>}
                  {recentTransactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="font-medium">{transaction.category}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {transaction.notes}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === 'income'
                            ? 'text-emerald-500 dark:text-emerald-400'
                            : 'text-foreground'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{settings.currency}
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('goals.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.goalsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {loadingGoals && <p>{t('loading')}</p>}
              {goals?.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div className="grid gap-2" key={goal.id}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {settings.currency}{goal.currentAmount.toLocaleString()} / {settings.currency}
                        {goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      aria-label={`${goal.title} progress`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle>{t('dashboard.spendingBreakdown')}</CardTitle>
              <CardDescription>{t('dashboard.spendingBreakdownDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <CategoryChart data={categoryChartData} currency={settings.currency} />
              {transactions && <IncomeExpenseChart transactions={transactions} currency={settings.currency} />}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
