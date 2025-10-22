'use client';

import Link from 'next/link';
import {
  Home,
  PanelLeft,
  Search,
  Wallet,
  PiggyBank,
  BrainCircuit,
  Settings,
  Package,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from './UserNav';
import { Logo } from '../icons/Logo';
import { useUser, useFirestore, useMemoFirebase, useSettings } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/use-locale';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { settings } = useSettings();
  const { t } = useLocale();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/transactions`));
  }, [firestore, user]);

  const { data: transactions } = useCollection<Transaction>(transactionsQuery);

  const totalIncome =
    transactions
      ?.filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalExpense =
    transactions
      ?.filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalBalance = totalIncome - totalExpense;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex items-center gap-4 ml-auto">
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border border-input bg-card p-2 text-sm font-medium',
            totalBalance >= 0 ? 'text-emerald-500' : 'text-destructive'
          )}
        >
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{settings.currency}{totalBalance.toFixed(2)}</span>
        </div>
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('header.searchPlaceholder')}
            className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
      </div>
      <UserNav />
    </header>
  );
}
