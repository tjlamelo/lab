import React, { useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import AppLayout from '@/layouts/app-layout';
import mail from '@/routes/admin/mail';

interface Props {
    availableTemplates: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function MailCreate({ availableTemplates, flash }: Props) {
    const { __ } = useTranslate();
    const { url } = usePage();
    const isTestMode = url.includes('test=true');

    const { data, setData, post, processing, errors, transform } = useForm({
        to: '',
        name: '',
        subject: '',
        template: 'default',
        message: '',
        button_text: '',
        button_url: '',
        data: {} as Record<string, any>,
        from: '',
        from_name: '',
        cc: [] as string[],
        bcc: [] as string[],
        queue: false,
    });

    // Ne proposer que les templates "safe" pour un envoi manuel (sans data complexe)
    const safeTemplates = useMemo(() => {
        const allowed = new Set(['default', 'welcome']);
        const entries = Object.entries(availableTemplates).filter(([key]) => allowed.has(key));
        return Object.fromEntries(entries);
    }, [availableTemplates]);

    const buildTemplateData = () => {
        const appName = 'PrimeLab';
        const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

        const paragraphs = data.message
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean);

        const base = {
            appName,
            appUrl,
            year: new Date().getFullYear(),
            title: data.subject || __('Hello'),
            content: paragraphs.length > 0 ? paragraphs : [__('Hello')],
            buttonText: data.button_text?.trim() || undefined,
            buttonUrl: data.button_url?.trim() || undefined,
            // pour welcome.blade.php (fallbacks)
            name: data.name?.trim() || undefined,
            email: data.to?.trim() || undefined,
        };

        // Nettoyage: enlever les undefined
        return Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construire automatiquement les data pour le template (sans JSON côté user)
        const templateData = buildTemplateData();

        const routeDef = isTestMode ? mail.sendTest.post() : mail.sendCustom.post();
        // IMPORTANT: setData est async; on utilise transform pour garantir le payload envoyé
        transform((current) => ({
            ...current,
            data: templateData,
        }));

        post(routeDef.url, {
            onFinish: () => transform((current) => current),
        });
    };

    return (
        <AppLayout>
            <Head title={isTestMode ? __('Test Email') : __('Send Custom Email')} />

            <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get(mail.index.url())}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {isTestMode ? __('Test Email') : __('Send Custom Email')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isTestMode 
                                ? __('Send a test email to verify your template')
                                : __('Send a personalized email to a recipient')
                            }
                        </p>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md">
                        {flash.success}
                    </div>
                )}
                
                {flash?.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md">
                        {flash.error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{__('Email Details')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Recipient */}
                            <div className="space-y-2">
                                <Label htmlFor="to">{__('Recipient Email')} *</Label>
                                <Input
                                    id="to"
                                    type="email"
                                    value={data.to}
                                    onChange={(e) => setData('to', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                                {errors.to && (
                                    <p className="text-sm text-red-600">{errors.to}</p>
                                )}
                            </div>

                            {/* Name (optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="name">{__('Recipient Name (optional)')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={__('e.g., John Doe')}
                                />
                            </div>

                            {/* Subject */}
                            <div className="space-y-2">
                                <Label htmlFor="subject">{__('Subject')} *</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder={__('Email subject')}
                                    required
                                />
                                {errors.subject && (
                                    <p className="text-sm text-red-600">{errors.subject}</p>
                                )}
                            </div>

                            {/* Template */}
                            <div className="space-y-2">
                                <Label htmlFor="template">{__('Template')} *</Label>
                                <Select value={data.template} onValueChange={(value) => setData('template', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(safeTemplates).map(([key, name]) => (
                                            <SelectItem key={key} value={key}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.template && (
                                    <p className="text-sm text-red-600">{errors.template}</p>
                                )}
                            </div>

                            {/* Message (no JSON) */}
                            <div className="space-y-2">
                                <Label htmlFor="message">{__('Message')} *</Label>
                                <Textarea
                                    id="message"
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder={__('Write your message here...')}
                                    rows={6}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    {__('Tip: each line will be treated as a paragraph in the email.')}
                                </p>
                            </div>

                            {/* Button (optional) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="button_text">{__('Button Text (optional)')}</Label>
                                    <Input
                                        id="button_text"
                                        value={data.button_text}
                                        onChange={(e) => setData('button_text', e.target.value)}
                                        placeholder={__('e.g., View details')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="button_url">{__('Button URL (optional)')}</Label>
                                    <Input
                                        id="button_url"
                                        value={data.button_url}
                                        onChange={(e) => setData('button_url', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            {/* From (optional) */}
                            {!isTestMode && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="from">{__('From Email (optional)')}</Label>
                                            <Input
                                                id="from"
                                                type="email"
                                                value={data.from}
                                                onChange={(e) => setData('from', e.target.value)}
                                                placeholder="noreply@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="from_name">{__('From Name (optional)')}</Label>
                                            <Input
                                                id="from_name"
                                                value={data.from_name}
                                                onChange={(e) => setData('from_name', e.target.value)}
                                                placeholder="My App"
                                            />
                                        </div>
                                    </div>

                                    {/* Queue */}
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="queue"
                                            checked={data.queue}
                                            onCheckedChange={(checked) => setData('queue', checked)}
                                        />
                                        <Label htmlFor="queue" className="cursor-pointer">
                                            {__('Send via queue (recommended for better performance)')}
                                        </Label>
                                    </div>
                                </>
                            )}

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {__('Sending...')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            {isTestMode ? __('Send Test') : __('Send Email')}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get(mail.index.url())}
                                >
                                    {__('Cancel')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
