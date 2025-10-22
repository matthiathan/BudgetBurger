'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/hooks/use-locale';

const generalSettingsSchema = z.object({
  currency: z.enum(['ZAR', 'USD', 'AUD', 'YEN']),
  language: z.enum(['en-US', 'es', 'af', 'zh']),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

const currencyOptions = ['ZAR', 'USD', 'AUD', 'YEN'];
const languageOptions = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'zh', label: '中文' },
];

export function GeneralSettingsForm() {
  const { settings, updateSettings, isSettingsLoading } = useSettings();
  const { toast } = useToast();
  const { t } = useLocale();

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    values: {
      currency: settings.currency,
      language: settings.language,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        currency: settings.currency,
        language: settings.language,
      });
    }
  }, [settings, form]);

  function onSubmit(data: GeneralSettingsFormData) {
    updateSettings(data);
    toast({
      title: t('settings.general.saveToastTitle'),
      description: t('settings.general.saveToastDescription'),
    });
  }
  
  if (isSettingsLoading) {
    return <p>{t('loading')}</p>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.general.currency')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.general.currencyPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
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
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.general.language')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.general.languagePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t('settings.savePreferences')}</Button>
      </form>
    </Form>
  );
}
