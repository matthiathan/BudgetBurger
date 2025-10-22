'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AppearanceForm } from '@/components/settings/AppearanceForm';
import { AccountForm } from '@/components/settings/AccountForm';
import { GeneralSettingsForm } from '@/components/settings/GeneralSettingsForm';
import { useLocale } from '@/hooks/use-locale';

export default function SettingsPage() {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.description')}
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">{t('settings.general.title')}</TabsTrigger>
          <TabsTrigger value="account">{t('settings.account.title')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.appearance.title')}</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.general.title')}</CardTitle>
              <CardDescription>
                {t('settings.general.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <GeneralSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.account.title')}</CardTitle>
              <CardDescription>
                {t('settings.account.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AccountForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance.title')}</CardTitle>
              <CardDescription>
                {t('settings.appearance.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AppearanceForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
