import React, { useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BadgeCheck, Ban, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslate } from '@/lib/i18n';

interface Props {
  user: { id: number; name: string; email: string };
  devices: Array<{
    id: number;
    fingerprint: string;
    device_type: string | null;
    os_family: string | null;
    browser_family: string | null;
    last_ip: string | null;
    is_trusted: boolean;
    login_count: number;
    last_active_at: string | null;
    created_at: string;
  }>;
}

function getLocaleFromPageProps(props: any): string {
  const propsLocale = props?.locale;
  if (typeof propsLocale === 'string') return propsLocale;
  if (typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const supportedLocales = ['en', 'fr', 'ar', 'ru', 'zh'];
    if (pathParts.length > 0 && supportedLocales.includes(pathParts[0])) return pathParts[0];
  }
  return 'en';
}

export default function UserDevicesIndex({ user, devices }: Props) {
  const { __ } = useTranslate();
  const { props } = usePage();
  const currentLocale = useMemo(() => getLocaleFromPageProps(props), [props]);

  const handleToggleTrusted = (deviceId: number) => {
    router.patch(`/${currentLocale}/admin/users/devices/${deviceId}/toggle-trusted`, {}, { preserveScroll: true });
  };

  const handleDelete = (deviceId: number) => {
    router.delete(`/${currentLocale}/admin/users/devices/${deviceId}`, { preserveScroll: true });
  };

  const handleBlacklistFingerprint = (fingerprint: string) => {
    router.post(
      `/${currentLocale}/admin/security/blacklist`,
      {
        identifier: fingerprint,
        type: 2, // fingerprint
        reason: `Blacklisted from user device (user_id=${user.id})`,
        expires_at: null,
      },
      { preserveScroll: true },
    );
  };

  return (
    <AppLayout>
      <Head title={__('User Devices')} />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Heading
            title={__('User Devices')}
            description={`${user.name} • ${user.email}`}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={`/${currentLocale}/admin/users`}>
              <Button variant="outline">{__('Back to users')}</Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="size-5 text-primary" />
                {__('Devices')}
                <Badge variant="secondary" className="ml-2">
                  {devices?.length ?? 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{__('Fingerprint')}</TableHead>
                    <TableHead>{__('Device')}</TableHead>
                    <TableHead>{__('IP')}</TableHead>
                    <TableHead>{__('Logins')}</TableHead>
                    <TableHead>{__('Last active')}</TableHead>
                    <TableHead>{__('Trusted')}</TableHead>
                    <TableHead className="text-right">{__('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices?.length ? (
                    devices.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-mono text-xs max-w-[320px] truncate">
                          {d.fingerprint}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {(d.device_type ?? '—').toString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(d.os_family ?? '—').toString()} • {(d.browser_family ?? '—').toString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{d.last_ip ?? '—'}</TableCell>
                        <TableCell className="text-sm">{d.login_count ?? 0}</TableCell>
                        <TableCell className="text-sm">
                          {d.last_active_at ? new Date(d.last_active_at).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.is_trusted ? 'default' : 'secondary'} className="gap-1">
                            {d.is_trusted ? <ShieldCheck className="size-3" /> : <ShieldOff className="size-3" />}
                            {d.is_trusted ? __('Trusted') : __('Untrusted')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleToggleTrusted(d.id)}
                            >
                              {d.is_trusted ? <ShieldOff className="size-4" /> : <ShieldCheck className="size-4" />}
                              {d.is_trusted ? __('Untrust') : __('Trust')}
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-amber-600 hover:bg-amber-600/10"
                              onClick={() => handleBlacklistFingerprint(d.fingerprint)}
                            >
                              <Ban className="size-4" />
                              {__('Blacklist')}
                            </Button>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(d.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        {__('No devices recorded for this user yet.')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </AppLayout>
  );
}

