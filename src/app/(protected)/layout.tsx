'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { FirebaseClientProvider, useUser } from '@/firebase';
import { LocaleProvider } from '@/hooks/use-locale';
import { Loader2 } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  Home,
  Package,
  Settings,
  Wallet,
  PiggyBank,
  BrainCircuit,
} from 'lucide-react';
import { Logo } from '@/components/icons/Logo';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('sidebar.dashboard') },
    { href: '/transactions', icon: Wallet, label: t('sidebar.transactions') },
    { href: '/categories', icon: Package, label: t('sidebar.categories') },
    { href: '/savings', icon: PiggyBank, label: t('sidebar.savings') },
    { href: '/analysis', icon: BrainCircuit, label: t('sidebar.analysis') },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
            href="/dashboard"
            prefetch
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">BudgetBolt</span>
          </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton tooltip={item.label} isActive={isActive}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
           <SidebarMenuItem>
             <Link href="/settings" legacyBehavior passHref>
                <SidebarMenuButton tooltip={t('sidebar.settings')} isActive={pathname.startsWith('/settings')}>
                  <Settings />
                  <span>{t('sidebar.settings')}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <AuthGuard>
        <LocaleProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </LocaleProvider>
      </AuthGuard>
    </FirebaseClientProvider>
  );
}
