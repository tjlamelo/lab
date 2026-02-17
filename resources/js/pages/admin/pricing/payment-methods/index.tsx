import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { CreditCard, Eye, Image as ImageIcon, Loader2, Pencil, PlusCircle, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useTranslate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import paymentMethodsRoute from '@/routes/admin/payment-methods';

interface PaymentMethod {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  is_active: boolean;
  instructions: Record<string, any> | null;
  payment_details: Record<string, any> | null;
}

interface Props {
  methods: PaymentMethod[];
}

export default function PaymentMethodsIndex({ methods }: Props) {
  const { __ } = useTranslate();
  const { props } = usePage();
  const locale = (props as any)?.locale ?? 'en';

  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState<{
    name: string;
    slug: string;
    instructions: string;
    payment_details: string;
    logo_file: File | null;
  }>({
    name: '',
    slug: '',
    instructions: '',
    payment_details: '',
    logo_file: null,
  });

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [editData, setEditData] = useState<{
    name: string;
    slug: string;
    instructions: string;
    payment_details: string;
    is_active: boolean;
    logo_file: File | null;
    remove_logo: boolean;
  }>({
    name: '',
    slug: '',
    instructions: '',
    payment_details: '',
    is_active: true,
    logo_file: null,
    remove_logo: false,
  });

  const parseJsonOrNull = (value: string) => {
    if (!value.trim()) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const instructionsJsonValid = useMemo(
    () => createData.instructions.trim() === '' || parseJsonOrNull(createData.instructions) !== null,
    [createData.instructions],
  );

  const paymentDetailsJsonValid = useMemo(
    () => createData.payment_details.trim() === '' || parseJsonOrNull(createData.payment_details) !== null,
    [createData.payment_details],
  );

  const editInstructionsJsonValid = useMemo(
    () => editData.instructions.trim() === '' || parseJsonOrNull(editData.instructions) !== null,
    [editData.instructions],
  );

  const editPaymentDetailsJsonValid = useMemo(
    () => editData.payment_details.trim() === '' || parseJsonOrNull(editData.payment_details) !== null,
    [editData.payment_details],
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData();
    formData.append('name', createData.name);
    if (createData.slug.trim()) formData.append('slug', createData.slug);

    const instructions = parseJsonOrNull(createData.instructions);
    if (instructions) {
      Object.keys(instructions).forEach((key) => {
        formData.append(`instructions[${key}]`, instructions[key]);
      });
    }

    const paymentDetails = parseJsonOrNull(createData.payment_details);
    if (paymentDetails) {
      Object.keys(paymentDetails).forEach((key) => {
        formData.append(`payment_details[${key}]`, paymentDetails[key]);
      });
    }

    if (createData.logo_file) {
      formData.append('logo', createData.logo_file);
    }

    router.post(`/${locale}/admin/payment-methods`, formData, {
      forceFormData: true,
      onFinish: () => setCreating(false),
      onSuccess: () => {
        setCreateData({
          name: '',
          slug: '',
          instructions: '',
          payment_details: '',
          logo_file: null,
        });
      },
    });
  };

  const handleToggle = (id: number) => {
    setProcessingId(id);
    router.patch(
      `/${locale}/admin/payment-methods/${id}/toggle`,
      {},
      {
        preserveScroll: true,
        onFinish: () => setProcessingId(null),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!window.confirm(__('Are you sure you want to delete this payment method?'))) return;
    setProcessingId(id);
    router.delete(`/${locale}/admin/payment-methods/${id}`, {
      preserveScroll: true,
      onFinish: () => setProcessingId(null),
    });
  };

  const startEditing = (method: PaymentMethod) => {
    setEditing(method);
    setEditData({
      name: method.name,
      slug: method.slug,
      instructions: method.instructions ? JSON.stringify(method.instructions, null, 2) : '',
      payment_details: method.payment_details ? JSON.stringify(method.payment_details, null, 2) : '',
      is_active: method.is_active,
      logo_file: null,
      remove_logo: false,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setProcessingId(editing.id);

    const formData = new FormData();
    formData.append('_method', 'put');
    formData.append('name', editData.name);
    if (editData.slug.trim()) formData.append('slug', editData.slug);

    const instructions = parseJsonOrNull(editData.instructions);
    if (instructions) {
      Object.keys(instructions).forEach((key) => {
        formData.append(`instructions[${key}]`, instructions[key]);
      });
    }

    const paymentDetails = parseJsonOrNull(editData.payment_details);
    if (paymentDetails) {
      Object.keys(paymentDetails).forEach((key) => {
        formData.append(`payment_details[${key}]`, paymentDetails[key]);
      });
    }

    formData.append('is_active', editData.is_active ? '1' : '0');

    if (editData.remove_logo) {
      formData.append('remove_logo', '1');
    }

    if (editData.logo_file) {
      formData.append('logo', editData.logo_file);
    }

    router.post(paymentMethodsRoute.update(editing.id).url, formData, {
      forceFormData: true,
      onFinish: () => {
        setProcessingId(null);
        setEditing(null);
        setEditData({
          name: '',
          slug: '',
          instructions: '',
          payment_details: '',
          is_active: true,
          logo_file: null,
          remove_logo: false,
        });
      },
    });
  };

  return (
    <AppLayout>
      <Head title={__('Payment Methods')} />

      <div className="space-y-6 max-w-5xl mx-auto px-2 md:px-4">
        <Heading
          title={__('Payment Methods')}
          description={__('Manage how your customers can pay (bank transfer, mobile money, crypto, etc.).')}
        />

        {/* Create form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="size-5 text-primary" />
              {__('Add Payment Method')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{__('Name')}</Label>
                  <Input
                    value={createData.name}
                    onChange={(e) =>
                      setCreateData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      }))
                    }
                    placeholder={__('e.g. Bank Transfer, Mobile Money')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{__('Slug')}</Label>
                  <Input
                    value={createData.slug}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder={__('Unique identifier (e.g. bank-transfer)')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{__('Instructions (JSON)')}</Label>
                  <Textarea
                    value={createData.instructions}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, instructions: e.target.value }))}
                    placeholder='{ "en": "Send the amount to this bank account...", "fr": "Envoyez le montant sur ce compte..." }'
                    rows={4}
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">
                      {__('Optional. Use JSON per language for the instructions shown at checkout.')}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="h-7 px-2 text-[11px]"
                        onClick={() =>
                          setCreateData((prev) => ({
                            ...prev,
                            instructions:
                              prev.instructions ||
                              `{\n  "en": "Send the amount to this bank account...",\n  "fr": "Envoyez le montant sur ce compte..." \n}`,
                          }))
                        }
                      >
                        {__('Insert example')}
                      </Button>
                      {!instructionsJsonValid && (
                        <span className="text-[11px] text-destructive">
                          {__('Invalid JSON. Please check your syntax.')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{__('Payment details (JSON)')}</Label>
                  <Textarea
                    value={createData.payment_details}
                    onChange={(e) => setCreateData((prev) => ({ ...prev, payment_details: e.target.value }))}
                    placeholder='{ "IBAN": "...", "BIC": "...", "ACCOUNT_NAME": "PrimeLab" }'
                    rows={4}
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">
                      {__('Optional. Structured key/value pairs displayed to the customer with copy buttons.')}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="h-7 px-2 text-[11px]"
                        onClick={() =>
                          setCreateData((prev) => ({
                            ...prev,
                            payment_details:
                              prev.payment_details ||
                              `{\n  "IBAN": "FR76 ....",\n  "BIC": "ABCDEFGH",\n  "ACCOUNT_NAME": "PrimeLab Chemicals" \n}`,
                          }))
                        }
                      >
                        {__('Insert example')}
                      </Button>
                      {!paymentDetailsJsonValid && (
                        <span className="text-[11px] text-destructive">
                          {__('Invalid JSON. Please check your syntax.')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[11px] font-bold uppercase">
                    <ImageIcon className="size-3.5" /> {__('Payment Method Logo')}
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
                      {createData.logo_file ? (
                        <span className="text-xs text-muted-foreground text-center px-1">
                          {createData.logo_file.name}
                        </span>
                      ) : (
                        <ImageIcon className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCreateData((prev) => ({
                            ...prev,
                            logo_file: e.target.files ? e.target.files[0] : null,
                          }))
                        }
                        className="max-w-xs cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        {__('PNG, JPG or WEBP. Max 2MB.')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={creating} className="gap-2">
                    {creating && <Loader2 className="size-4 animate-spin" />}
                    {__('Save')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Edit form */}
        {editing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="size-5 text-primary" />
                {__('Edit Payment Method')} – {editing.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{__('Name')}</Label>
                    <Input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                          slug: prev.slug || e.target.value.toLowerCase().replace(/\s+/g, '-'),
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{__('Slug')}</Label>
                    <Input
                      value={editData.slug}
                      onChange={(e) => setEditData((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{__('Instructions (JSON)')}</Label>
                    <Textarea
                      value={editData.instructions}
                      onChange={(e) => setEditData((prev) => ({ ...prev, instructions: e.target.value }))}
                      rows={4}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">
                        {__('Optional. Use JSON per language for the instructions shown at checkout.')}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          className="h-7 px-2 text-[11px]"
                          onClick={() =>
                            setEditData((prev) => ({
                              ...prev,
                              instructions:
                                prev.instructions ||
                                `{\n  "en": "Send the amount to this bank account...",\n  "fr": "Envoyez le montant sur ce compte..." \n}`,
                            }))
                          }
                        >
                          {__('Insert example')}
                        </Button>
                        {!editInstructionsJsonValid && (
                          <span className="text-[11px] text-destructive">
                            {__('Invalid JSON. Please check your syntax.')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{__('Payment details (JSON)')}</Label>
                    <Textarea
                      value={editData.payment_details}
                      onChange={(e) => setEditData((prev) => ({ ...prev, payment_details: e.target.value }))}
                      rows={4}
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">
                        {__('Optional. Structured key/value pairs displayed to the customer with copy buttons.')}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          className="h-7 px-2 text-[11px]"
                          onClick={() =>
                            setEditData((prev) => ({
                              ...prev,
                              payment_details:
                                prev.payment_details ||
                                `{\n  "IBAN": "FR76 ....",\n  "BIC": "ABCDEFGH",\n  "ACCOUNT_NAME": "PrimeLab Chemicals" \n}`,
                            }))
                          }
                        >
                          {__('Insert example')}
                        </Button>
                        {!editPaymentDetailsJsonValid && (
                          <span className="text-[11px] text-destructive">
                            {__('Invalid JSON. Please check your syntax.')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-[11px] font-bold uppercase">
                      <ImageIcon className="size-3.5" /> {__('Payment Method Logo')}
                    </Label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
                        {editData.logo_file ? (
                          <span className="text-xs text-muted-foreground text-center px-1">
                            {editData.logo_file.name}
                          </span>
                        ) : editing.logo ? (
                          <img
                            src={editing.logo.startsWith('http') ? editing.logo : `/storage/${editing.logo}`}
                            alt={editing.name}
                            className="h-full w-full object-contain p-1.5"
                          />
                        ) : (
                          <ImageIcon className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              logo_file: e.target.files ? e.target.files[0] : null,
                              remove_logo: false,
                            }))
                          }
                          className="max-w-xs cursor-pointer"
                        />
                        {editing.logo && !editData.logo_file && (
                          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editData.remove_logo}
                              onChange={(e) =>
                                setEditData((prev) => ({
                                  ...prev,
                                  remove_logo: e.target.checked,
                                  logo_file: e.target.checked ? null : prev.logo_file,
                                }))
                              }
                            />
                            {__('Remove current logo')}
                          </label>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {__('PNG, JPG or WEBP. Max 2MB.')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {editData.is_active ? __('Visible in checkout') : __('Hidden from checkout')}
                      </span>
                      <Switch
                        checked={editData.is_active}
                        onCheckedChange={(v) => setEditData((prev) => ({ ...prev, is_active: v }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(null)}
                      disabled={processingId === editing.id}
                    >
                      {__('Cancel')}
                    </Button>
                    <Button type="submit" disabled={processingId === editing.id} className="gap-2">
                      {processingId === editing.id && <Loader2 className="size-4 animate-spin" />}
                      {__('Save changes')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              {__('Existing Payment Methods')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{__('Logo')}</TableHead>
                    <TableHead>{__('Name')}</TableHead>
                    <TableHead>{__('Slug')}</TableHead>
                    <TableHead>{__('Status')}</TableHead>
                    <TableHead className="text-right">{__('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.length ? (
                    methods.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-10 rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                              {m.logo ? (
                                <img
                                  src={m.logo.startsWith('http') ? m.logo : `/storage/${m.logo}`}
                                  alt={m.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <CreditCard className="size-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {m.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {m.slug}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
                              m.is_active
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
                            )}
                          >
                            {m.is_active ? <ToggleRight className="size-3" /> : <ToggleLeft className="size-3" />}
                            {m.is_active ? __('Active') : __('Inactive')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => router.get(paymentMethodsRoute.show(m.id).url)}
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => startEditing(m)}
                              disabled={processingId === m.id}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleToggle(m.id)}
                              disabled={processingId === m.id}
                            >
                              {processingId === m.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : m.is_active ? (
                                <ToggleRight className="size-4" />
                              ) : (
                                <ToggleLeft className="size-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(m.id)}
                              disabled={processingId === m.id}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        {__('No payment methods configured yet.')}
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

