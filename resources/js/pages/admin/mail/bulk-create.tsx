import React, { useMemo, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Send, Loader2, Users, Info } from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import AppLayout from '@/layouts/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import mail from '@/routes/admin/mail';

interface Props {
    availableTemplates: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function BulkMailCreate({ availableTemplates, flash }: Props) {
    const { __ } = useTranslate();
    usePage(); // for inertia context

    const { data, setData, post, processing, errors, transform } = useForm({
        recipients: [] as string[],
        subject: '',
        template: 'default',
        common_data: {} as Record<string, any>,
        personalized_data: {} as Record<string, Record<string, any>>,
        batch_size: 50,
        delay_between_batches: 0,
    });

    const [recipientsText, setRecipientsText] = useState('');
    const [message, setMessage] = useState('');
    const [buttonText, setButtonText] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');

    const safeTemplates = useMemo(() => {
        const allowed = new Set(['default', 'welcome']);
        const entries = Object.entries(availableTemplates).filter(([key]) => allowed.has(key));
        return Object.fromEntries(entries);
    }, [availableTemplates]);

    const buildCommonData = () => {
        const appName = 'PrimeLab';
        const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const paragraphs = message
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean);

        const base = {
            appName,
            appUrl,
            year: new Date().getFullYear(),
            title: data.subject || __('Hello'),
            content: paragraphs.length > 0 ? paragraphs : [__('Hello')],
            buttonText: buttonText.trim() || undefined,
            buttonUrl: buttonUrl.trim() || undefined,
        };

        return Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse recipients
        // Supporte: "email" ou "email,Name" (1 par ligne)
        const personalized: Record<string, Record<string, any>> = {};
        const recipientsList = recipientsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const [emailRaw, nameRaw] = line.split(',').map((p) => p.trim());
                if (emailRaw && nameRaw) {
                    personalized[emailRaw] = { name: nameRaw };
                }
                return emailRaw;
            })
            .filter((email) => email && email.includes('@')) as string[];

        if (recipientsList.length === 0) {
            alert(__('Please enter at least one recipient email'));
            return;
        }

        const routeDef = mail.sendBulk.post();
        // IMPORTANT: setData est async; on utilise transform pour garantir le payload envoyé
        const commonData = buildCommonData();
        transform((current) => ({
            ...current,
            recipients: recipientsList,
            common_data: commonData,
            personalized_data: personalized,
        }));

        post(routeDef.url, {
            onFinish: () => transform((current) => current),
        });
    };

    return (
        <AppLayout>
            <Head title={__('Bulk Email')} />

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
                        <h1 className="text-3xl font-black tracking-tight">{__('Bulk Email')}</h1>
                        <p className="text-muted-foreground mt-1">
                            {__('Send personalized emails to multiple recipients')}
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

                {/* Info Alert */}
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        {__('Emails will be sent in batches to avoid server overload. Large batches may take some time to complete.')}
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{__('Bulk Email Details')}</CardTitle>
                            <CardDescription>
                                {__('Configure your bulk email campaign')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Recipients */}
                            <div className="space-y-2">
                                <Label htmlFor="recipients">{__('Recipients (one per line)')} *</Label>
                                <Textarea
                                    id="recipients"
                                    value={recipientsText}
                                    onChange={(e) => setRecipientsText(e.target.value)}
                                    placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                                    rows={8}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    {__('Enter one email address per line. Total:')} {recipientsText.split('\n').filter(e => e.trim().includes('@')).length}
                                </p>
                                {errors.recipients && (
                                    <p className="text-sm text-red-600">{errors.recipients}</p>
                                )}
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
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
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
                                    <Label htmlFor="buttonText">{__('Button Text (optional)')}</Label>
                                    <Input
                                        id="buttonText"
                                        value={buttonText}
                                        onChange={(e) => setButtonText(e.target.value)}
                                        placeholder={__('e.g., View details')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="buttonUrl">{__('Button URL (optional)')}</Label>
                                    <Input
                                        id="buttonUrl"
                                        value={buttonUrl}
                                        onChange={(e) => setButtonUrl(e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            {/* Batch Settings */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="batch_size">{__('Batch Size')}</Label>
                                    <Input
                                        id="batch_size"
                                        type="number"
                                        value={data.batch_size}
                                        onChange={(e) => setData('batch_size', parseInt(e.target.value) || 50)}
                                        min="1"
                                        max="100"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {__('Emails per batch')}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="delay">{__('Delay Between Batches (seconds)')}</Label>
                                    <Input
                                        id="delay"
                                        type="number"
                                        value={data.delay_between_batches}
                                        onChange={(e) => setData('delay_between_batches', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {__('Wait time between batches')}
                                    </p>
                                </div>
                            </div>

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
                                            <Users className="mr-2 h-4 w-4" />
                                            {__('Send Bulk Email')}
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
