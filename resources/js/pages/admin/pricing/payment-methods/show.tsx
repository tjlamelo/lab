import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CreditCard, Image as ImageIcon, KeyRound, ListChecks } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  created_at?: string;
  updated_at?: string;
}

interface Props {
  method: PaymentMethod;
}

export default function PaymentMethodShow({ method }: Props) {
  const { __ } = useTranslate();
  const { props } = usePage();
  const locale = (props as any)?.locale ?? 'en';

  const formattedInstructions = method.instructions ? JSON.stringify(method.instructions, null, 2) : null;
  const formattedDetails = method.payment_details ? JSON.stringify(method.payment_details, null, 2) : null;

  return (
    <AppLayout>
      <Head title={`${__('Payment Method')} - ${method.name}`} />

      <div className="space-y-6 max-w-4xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between gap-2">
          <Heading
            title={__('Payment Method Details')}
            description={__('View all configuration details for this payment method.')}
          />
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href={paymentMethodsRoute.index().url}>
              <ArrowLeft className="size-4" />
              {__('Back to list')}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl border flex items-center justify-center overflow-hidden bg-muted">
                {method.logo ? (
                  <img
                    src={method.logo.startsWith('http') ? method.logo : `/storage/${method.logo}`}
                    alt={method.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <CreditCard className="size-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {method.name}
                  <Badge
                    className={cn(
                      'ml-1',
                      method.is_active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300',
                    )}
                  >
                    {method.is_active ? __('Active') : __('Inactive')}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                  /{locale}/checkout • {__('Slug')}: <span className="font-semibold">{method.slug}</span>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <KeyRound className="size-3.5" />
                  {__('Basic Information')}
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{__('Name')}</span>
                    <span>{method.name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{__('Slug')}</span>
                    <span className="font-mono break-all">{method.slug}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <ImageIcon className="size-3.5" />
                  {__('Logo')}
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 flex items-center justify-center">
                  {method.logo ? (
                    <img
                      src={method.logo.startsWith('http') ? method.logo : `/storage/${method.logo}`}
                      alt={method.name}
                      className="h-20 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">{__('No logo configured')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <ListChecks className="size-3.5" />
                  {__('Instructions (JSON)')}
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 max-h-52 overflow-auto">
                  {formattedInstructions ? (
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                      {formattedInstructions}
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground">{__('No instructions configured.')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <ListChecks className="size-3.5" />
                  {__('Payment details (JSON)')}
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 max-h-52 overflow-auto">
                  {formattedDetails ? (
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all">
                      {formattedDetails}
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground">{__('No payment details configured.')}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

