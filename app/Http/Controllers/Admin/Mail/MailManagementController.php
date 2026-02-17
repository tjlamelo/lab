<?php

namespace App\Http\Controllers\Admin\Mail;

use App\Http\Controllers\Controller;
use App\Core\Mailing\Helpers\MailHelper;
use App\Core\Mailing\Dto\MailDto;
use App\Core\Mailing\Dto\BulkMailDto;
use App\Core\Mailing\Services\MailService;
use App\Core\Mailing\Services\BulkMailService;
use App\Models\MailSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;

class MailManagementController extends Controller
{
    public function __construct(
        protected MailService $mailService,
        protected BulkMailService $bulkMailService
    ) {}

    /**
     * Affiche la page principale de gestion des mails
     */
    public function index(): Response
    {
        return Inertia::render('admin/mail/index', [
            'availableTemplates' => $this->getAvailableTemplates(),
        ]);
    }

    /**
     * Affiche le formulaire de création d'email personnalisé
     */
    public function create(): Response
    {
        return Inertia::render('admin/mail/create', [
            'availableTemplates' => $this->getAvailableTemplates(),
        ]);
    }

    /**
     * Affiche le formulaire de création d'email en masse
     */
    public function bulkCreate(): Response
    {
        return Inertia::render('admin/mail/bulk-create', [
            'availableTemplates' => $this->getAvailableTemplates(),
        ]);
    }

    /**
     * Branding / settings des emails (logo, couleurs, footer)
     */
    public function settings(): Response
    {
        $settings = MailSetting::current();

        return Inertia::render('admin/mail/settings', [
            'settings' => [
                'company_name' => $settings->company_name,
                'website_url' => $settings->website_url,
                'support_email' => $settings->support_email,
                'brand_primary' => $settings->brand_primary,
                'brand_secondary' => $settings->brand_secondary,
                'background_color' => $settings->background_color,
                'logo_path' => $settings->logo_path,
                'footer_note' => $settings->footer_note,
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'website_url' => 'nullable|url|max:255',
            'support_email' => 'nullable|email|max:255',
            'brand_primary' => ['nullable', 'string', 'max:32', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'brand_secondary' => ['nullable', 'string', 'max:32', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            'background_color' => ['nullable', 'string', 'max:32', 'regex:/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
            // public path only (ex: img/logo.png)
            'logo_path' => 'nullable|string|max:255',
            'footer_note' => 'nullable|string|max:2000',
        ]);

        $settings = MailSetting::query()->first() ?? new MailSetting();
        $settings->fill($validated);
        $settings->save();
        MailSetting::flushCache();

        return back()->with('success', __('Mail settings updated successfully!'));
    }

    /**
     * Envoie un email de test
     */
    public function sendTest(Request $request)
    {
        $validated = $request->validate([
            // On accepte "to" (UI) ou "email" (ancien) pour éviter la confusion
            'to' => 'nullable|email|required_without:email',
            'email' => 'nullable|email|required_without:to',
            'template' => 'required|string',
            'subject' => 'required|string|max:255',
            'data' => 'nullable|array',
        ]);

        try {
            $to = $validated['to'] ?? $validated['email'];
            $data = $validated['data'] ?? [];

            // Robustesse: si le front n'a pas encore construit "data",
            // on le reconstruit à partir des champs simples (message, button_*...)
            if (empty($data)) {
                $rawMessage = $request->input('message');
                $content = null;
                if (is_string($rawMessage) && trim($rawMessage) !== '') {
                    $content = collect(preg_split("/\r\n|\n|\r/", $rawMessage))
                        ->map(fn ($l) => trim((string) $l))
                        ->filter()
                        ->values()
                        ->all();
                }

                $data = array_filter([
                    'appName' => config('app.name'),
                    'appUrl' => config('app.url'),
                    'year' => (int) now()->format('Y'),
                    'title' => $validated['subject'] ?? __('Hello'),
                    'content' => $content,
                    'buttonText' => is_string($request->input('button_text')) ? trim($request->input('button_text')) : null,
                    'buttonUrl' => is_string($request->input('button_url')) ? trim($request->input('button_url')) : null,
                    'name' => is_string($request->input('name')) ? trim($request->input('name')) : null,
                    'email' => $to,
                ], fn ($v) => $v !== null && $v !== '');
            }

            $dto = new MailDto(
                to: $to,
                subject: $validated['subject'],
                template: $validated['template'],
                data: $data,
            );

            $sent = $this->mailService->send($dto);

            if ($sent) {
                return back()->with('success', __('Test email sent successfully!'));
            }

            return back()->with('error', __('Failed to send test email.'));
        } catch (\Exception $e) {
            Log::error('Test email failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', __('An error occurred while sending the test email.'));
        }
    }

    /**
     * Envoie un email personnalisé
     */
    public function sendCustom(Request $request)
    {
        $validated = $request->validate([
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'template' => 'required|string',
            'data' => 'nullable|array',
            'from' => 'nullable|email',
            'from_name' => 'nullable|string|max:255',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email',
            'queue' => 'nullable|boolean',
        ]);

        try {
            $data = $validated['data'] ?? [];
            if (empty($data)) {
                $rawMessage = $request->input('message');
                $content = null;
                if (is_string($rawMessage) && trim($rawMessage) !== '') {
                    $content = collect(preg_split("/\r\n|\n|\r/", $rawMessage))
                        ->map(fn ($l) => trim((string) $l))
                        ->filter()
                        ->values()
                        ->all();
                }

                $data = array_filter([
                    'appName' => config('app.name'),
                    'appUrl' => config('app.url'),
                    'year' => (int) now()->format('Y'),
                    'title' => $validated['subject'] ?? __('Hello'),
                    'content' => $content,
                    'buttonText' => is_string($request->input('button_text')) ? trim($request->input('button_text')) : null,
                    'buttonUrl' => is_string($request->input('button_url')) ? trim($request->input('button_url')) : null,
                    'name' => is_string($request->input('name')) ? trim($request->input('name')) : null,
                    'email' => $validated['to'],
                ], fn ($v) => $v !== null && $v !== '');
            }

            $dto = new MailDto(
                to: $validated['to'],
                subject: $validated['subject'],
                template: $validated['template'],
                data: $data,
                from: $validated['from'] ?? null,
                fromName: $validated['from_name'] ?? null,
                cc: $validated['cc'] ?? [],
                bcc: $validated['bcc'] ?? [],
            );

            if ($validated['queue'] ?? false) {
                $sent = $this->mailService->queue($dto);
            } else {
                $sent = $this->mailService->send($dto);
            }

            if ($sent) {
                return back()->with('success', __('Email sent successfully!'));
            }

            return back()->with('error', __('Failed to send email.'));
        } catch (\Exception $e) {
            Log::error('Custom email failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', __('An error occurred while sending the email.'));
        }
    }

    /**
     * Envoie des emails en masse
     */
    public function sendBulk(Request $request)
    {
        $validated = $request->validate([
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'email',
            'subject' => 'required|string|max:255',
            'template' => 'required|string',
            'common_data' => 'nullable|array',
            'personalized_data' => 'nullable|array',
            'batch_size' => 'nullable|integer|min:1|max:100',
            'delay_between_batches' => 'nullable|integer|min:0',
        ]);

        try {
            $dto = new BulkMailDto(
                recipients: $validated['recipients'],
                subject: $validated['subject'],
                template: $validated['template'],
                commonData: $validated['common_data'] ?? [],
                personalizedData: $validated['personalized_data'] ?? [],
                batchSize: $validated['batch_size'] ?? 50,
                delayBetweenBatches: $validated['delay_between_batches'] ?? 0,
            );

            $results = $this->bulkMailService->sendBulk($dto);

            return back()->with([
                'success' => __('Bulk email sent! :sent sent, :failed failed.', [
                    'sent' => $results['sent'],
                    'failed' => $results['failed'],
                ]),
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            Log::error('Bulk email failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return back()->with('error', __('An error occurred while sending bulk emails.'));
        }
    }

    /**
     * Liste des templates disponibles
     */
    private function getAvailableTemplates(): array
    {
        return [
            'default' => __('Default Template'),
            'welcome' => __('Welcome Email'),
            'orders.confirmation' => __('Order Confirmation'),
            'orders.shipped' => __('Order Shipped'),
            'auth.password-reset' => __('Password Reset'),
        ];
    }
}
