import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Mail, 
    Send, 
    Users, 
    FileText, 
    Plus,
    TestTube,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Clock,
    Zap
} from 'lucide-react';
import { useTranslate } from '@/lib/i18n';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import mail from '@/routes/admin/mail';

interface Props {
    availableTemplates: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
    };
    results?: {
        sent: number;
        failed: number;
        errors: string[];
    };
}

export default function MailManagementIndex({ availableTemplates, flash, results }: Props) {
    const { __ } = useTranslate();

    const quickActions = [
        {
            title: __('Send Custom Email'),
            description: __('Send a personalized email to a single recipient'),
            icon: Send,
            href: mail.create.url(),
            color: 'bg-blue-500',
        },
        {
            title: __('Bulk Email'),
            description: __('Send emails to multiple recipients at once'),
            icon: Users,
            href: mail.bulkCreate.url(),
            color: 'bg-purple-500',
        },
        {
            title: __('Test Email'),
            description: __('Send a test email to verify templates'),
            icon: TestTube,
            href: mail.create.url({ query: { test: 'true' } }),
            color: 'bg-green-500',
        },
    ];

    return (
        <AppLayout>
            <Head title={__('Mail Management')} />

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">{__('Mail Management')}</h1>
                        <p className="text-muted-foreground mt-2">
                            {__('Manage and send emails to your customers')}
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

                {/* Results */}
                {results && (
                    <Card className="border-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {results.failed === 0 ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                {__('Bulk Email Results')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">{__('Sent')}</p>
                                    <p className="text-2xl font-bold text-green-600">{results.sent}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{__('Failed')}</p>
                                    <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                                </div>
                            </div>
                            {results.errors.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-semibold mb-2">{__('Errors:')}</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {results.errors.slice(0, 5).map((error, index) => (
                                            <li key={index} className="text-sm text-red-600">{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => (
                        <Card 
                            key={index} 
                            className="hover:shadow-lg transition-shadow cursor-pointer border-2"
                            onClick={() => router.visit(action.href)}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-xl", action.color, "text-white")}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{action.title}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {action.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.visit(action.href);
                                    }}
                                >
                                    {__('Get Started')}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Available Templates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {__('Available Email Templates')}
                        </CardTitle>
                        <CardDescription>
                            {__('Templates you can use for your emails')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(availableTemplates).map(([key, name]) => (
                                <div 
                                    key={key}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold">{name}</p>
                                            <p className="text-xs text-muted-foreground font-mono">{key}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{__('Available')}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Features Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                {__('Features')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    {__('Personalized emails with custom data')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    {__('Bulk email sending with batching')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    {__('Queue support for better performance')}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    {__('Test emails before sending')}
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                {__('Best Practices')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>{__('Always test emails before bulk sending')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>{__('Use queue for large batches to avoid timeouts')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>{__('Personalize content for better engagement')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-0.5">•</span>
                                    <span>{__('Monitor results and handle errors')}</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
