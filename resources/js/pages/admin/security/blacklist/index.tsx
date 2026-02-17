import React, { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Ban, ChevronDown, ChevronUp, Plus, Search, ShieldAlert, Trash2, UserX, X } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslate } from '@/lib/i18n';

type TypeOption = { value: number; label: string };

interface Props {
  bans: any; // paginator
  filters: { search?: string; type?: string | number; active?: string | number; user_id?: string | number };
  typeOptions: TypeOption[];
  selectedUser?: { id: number; name: string; email: string } | null;
  selectedUserDevices?: Array<{
    id: number;
    fingerprint: string;
    device_type: string | null;
    os_family: string | null;
    browser_family: string | null;
    last_ip: string | null;
    is_trusted: boolean;
    login_count: number;
    last_active_at: string | null;
  }>;
  usersWithDevices: any; // paginator (users_page)
  deviceFilters?: { device_search?: string };
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

export default function BlacklistIndex({
  bans,
  filters,
  typeOptions,
  selectedUser,
  selectedUserDevices,
  usersWithDevices,
  deviceFilters,
}: Props) {
  const { __ } = useTranslate();
  const { props } = usePage();
  const currentLocale = useMemo(() => getLocaleFromPageProps(props), [props]);

  const initialSearch = filters?.search ?? '';
  const initialType = filters?.type ? String(filters.type) : 'all';
  const initialActive = (filters?.active ?? '') === '1';
  const initialUserId = filters?.user_id ? String(filters.user_id) : '';
  const initialDeviceSearch = deviceFilters?.device_search ?? '';

  const [search, setSearch] = useState(filters?.search ?? '');
  const [type, setType] = useState<string>(filters?.type ? String(filters.type) : 'all');
  const [onlyActive, setOnlyActive] = useState((filters?.active ?? '') === '1');
  const [userId, setUserId] = useState(initialUserId);
  const [deviceSearch, setDeviceSearch] = useState(initialDeviceSearch);

  // Create form
  const [identifier, setIdentifier] = useState('');
  const [createType, setCreateType] = useState<string>(String(typeOptions?.[0]?.value ?? 1));
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState(''); // datetime-local

  useEffect(() => {
    if (
      search === initialSearch &&
      type === initialType &&
      onlyActive === initialActive &&
      userId === initialUserId &&
      deviceSearch === initialDeviceSearch
    ) {
      return;
    }

    const timer = setTimeout(() => {
      router.get(
        `/${currentLocale}/admin/security/blacklist`,
        {
          search: search || undefined,
          type: type === 'all' ? undefined : type,
          active: onlyActive ? '1' : undefined,
          user_id: userId || undefined,
          device_search: deviceSearch || undefined,
        },
        { preserveState: true, preserveScroll: true, replace: true },
      );
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, onlyActive, userId, deviceSearch, currentLocale]);

  const clearFilters = () => {
    setSearch('');
    setType('all');
    setOnlyActive(false);
    setUserId('');
    setDeviceSearch('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(
      `/${currentLocale}/admin/security/blacklist`,
      {
        identifier,
        type: Number(createType),
        reason: reason || null,
        expires_at: expiresAt || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setIdentifier('');
          setReason('');
          setExpiresAt('');
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    router.delete(`/${currentLocale}/admin/security/blacklist/${id}`, { preserveScroll: true });
  };

  const handleBlacklist = (payload: { identifier: string; type: number; reason?: string | null }) => {
    router.post(
      `/${currentLocale}/admin/security/blacklist`,
      {
        identifier: payload.identifier,
        type: payload.type,
        reason: payload.reason ?? null,
        expires_at: null,
      },
      { preserveScroll: true },
    );
  };

  const effectiveTypeOptions = typeOptions?.length
    ? typeOptions
    : [
        { value: 1, label: __('Email') },
        { value: 2, label: __('Fingerprint') },
        { value: 3, label: __('IP Address') },
        { value: 4, label: __('Phone') },
      ];

  const usersRows = useMemo(() => usersWithDevices?.data ?? [], [usersWithDevices]);
  const [openUsers, setOpenUsers] = useState<Record<number, boolean>>({});

  const toggleUser = (id: number) => {
    setOpenUsers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <AppLayout>
      <Head title={__('Blacklist')} />

      <div className="space-y-6 max-w-6xl mx-auto px-2 md:px-4">
        <Heading
          title={__('Blacklist')}
          description={__('Block abusive emails, fingerprints, IPs or phone numbers.')}
        />

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-primary" />
                {__('Filters')}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {__('Search and filter blacklist entries.')}
              </p>
            </div>

            <Button type="button" variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="size-4" /> {__('Clear')}
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{__('Search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  placeholder={__('Email, IP, fingerprint...')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{__('Type')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder={__('All types')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{__('All')}</SelectItem>
                  {effectiveTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <Label>{__('Only active')}</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={onlyActive} onCheckedChange={setOnlyActive} />
                  <span className="text-sm text-muted-foreground">
                    {onlyActive ? __('Active only') : __('All')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{__('All user devices')}</span>
              <div className="w-full sm:w-[320px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={deviceSearch}
                    onChange={(e) => setDeviceSearch(e.target.value)}
                    className="pl-9"
                    placeholder={__('Search user/email/fingerprint/ip')}
                  />
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {usersRows.length ? (
              <div className="space-y-4">
                {usersRows.map((u: any) => {
                  const isOpen = !!openUsers[u.id];
                  const devices = u.devices ?? [];

                  return (
                    <Collapsible key={u.id} open={isOpen} onOpenChange={() => toggleUser(u.id)}>
                      <div className="rounded-md border">
                        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm">
                            <span className="font-medium">{u.name}</span>{' '}
                            <span className="text-muted-foreground">({u.email})</span>
                            <span className="ml-2 text-xs text-muted-foreground">ID: #{u.id}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{devices.length} {__('devices')}</Badge>

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() =>
                                router.post(
                                  `/${currentLocale}/admin/security/blacklist/block-user/${u.id}`,
                                  {},
                                  { preserveScroll: true },
                                )
                              }
                            >
                              <UserX className="size-4" /> {__('Block')}
                            </Button>

                            <CollapsibleTrigger asChild>
                              <Button type="button" size="sm" variant="ghost" className="gap-2">
                                {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                {isOpen ? __('Hide') : __('Show')}
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>

                        <CollapsibleContent>
                          <div className="overflow-x-auto border-t">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{__('Fingerprint')}</TableHead>
                                  <TableHead>{__('Device')}</TableHead>
                                  <TableHead>{__('IP')}</TableHead>
                                  <TableHead>{__('Last active')}</TableHead>
                                  <TableHead className="text-right">{__('Block')}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {devices.length ? (
                                  devices.map((d: any) => (
                                    <TableRow key={d.id}>
                                      <TableCell className="font-mono text-xs max-w-[320px] truncate">{d.fingerprint}</TableCell>
                                      <TableCell className="text-sm">
                                        <div className="flex flex-col">
                                          <span className="font-medium">{d.device_type ?? '—'}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {(d.os_family ?? '—').toString()} • {(d.browser_family ?? '—').toString()}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-sm">{d.last_ip ?? '—'}</TableCell>
                                      <TableCell className="text-sm">
                                        {d.last_active_at ? new Date(d.last_active_at).toLocaleString() : '—'}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                  {/* Single-block behavior: use "Block" button on user header */}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                      {__('No devices found for this user.')}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{__('No devices found.')}</div>
            )}

            {/* Pagination for users-with-devices */}
            {usersWithDevices?.links && usersWithDevices.links.length > 3 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
                <p className="text-sm text-muted-foreground order-2 sm:order-1">
                  {__('Showing')}{' '}
                  <span className="font-medium">{usersWithDevices.from}</span> {__('to')}{' '}
                  <span className="font-medium">{usersWithDevices.to}</span> {__('of')}{' '}
                  <span className="font-medium">{usersWithDevices.total}</span> {__('users')}
                </p>
                <div className="flex flex-wrap justify-center gap-1 order-1 sm:order-2">
                  {usersWithDevices.links.map((link: any, index: number) => {
                    if (link.url === null && String(link.label).includes('...')) {
                      return (
                        <span key={index} className="px-3 py-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        preserveScroll
                        preserveState
                        className={`
                          inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4
                          ${link.active ? 'bg-primary text-primary-foreground shadow-md' : 'border border-input bg-background hover:bg-accent'}
                          ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                        `}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

       

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <span>{__('Add to blacklist')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="identifier">{__('Identifier')}</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={__('Email / IP / Phone / Fingerprint')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{__('Type')}</Label>
                <Select value={createType} onValueChange={setCreateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {effectiveTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">{__('Expires at')}</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="reason">{__('Reason')}</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={__('Optional reason (fraud, abuse, chargeback...)')}
                  rows={3}
                />
              </div>

              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" className="gap-2">
                  <Plus className="size-4" /> {__('Add')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{__('Blacklist entries')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{__('Identifier')}</TableHead>
                    <TableHead>{__('Type')}</TableHead>
                    <TableHead>{__('Reason')}</TableHead>
                    <TableHead>{__('Expires')}</TableHead>
                    <TableHead>{__('Status')}</TableHead>
                    <TableHead className="text-right">{__('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bans?.data?.length ? (
                    bans.data.map((ban: any) => {
                      const expired = ban.expires_at ? new Date(ban.expires_at) < new Date() : false;
                      return (
                        <TableRow key={ban.id}>
                          <TableCell className="font-mono text-xs">{ban.identifier}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {effectiveTypeOptions.find((o) => o.value === Number(ban.type))?.label ??
                                String(ban.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ban.reason || <span className="opacity-60">—</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            {ban.expires_at ? new Date(ban.expires_at).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={expired ? 'secondary' : 'default'}>
                              {expired ? __('Expired') : __('Active')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(ban.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        {__('No blacklist entries found.')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

