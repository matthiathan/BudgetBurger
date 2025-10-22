"use client";

import { useState, useEffect } from 'react';
import { useLocale } from '@/hooks/use-locale';

type WelcomeMessageProps = {
    name?: string | null;
}

export function WelcomeMessage({ name }: WelcomeMessageProps) {
    const { t } = useLocale();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting(t('dashboard.greeting.morning'));
        } else if (hour < 18) {
            setGreeting(t('dashboard.greeting.afternoon'));
        } else {
            setGreeting(t('dashboard.greeting.evening'));
        }
    }, [t]);

    if (!greeting) {
        return null; // Avoid hydration mismatch
    }

    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                {greeting}, {name || 'User'}!
            </h1>
            <p className="text-muted-foreground">
                {t('dashboard.welcomeMessage')}
            </p>
        </div>
    )
}
