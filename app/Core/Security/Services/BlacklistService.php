<?php

namespace App\Core\Security\Services;

use App\Core\Security\Actions\BlacklistAction;
use App\Models\Blacklist;
use App\Models\User;
use App\Core\Mailing\Services\MailService;
use App\Core\Mailing\Dto\MailDto;
use App\Core\Mailing\Helpers\MailHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

final class BlacklistService
{
    public function __construct(
        protected MailService $mailService,
    ) {}
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Blacklist::query()->orderByDesc('id');

        if (!empty($filters['type'])) {
            $query->where('type', (int) $filters['type']);
        }

        if (!empty($filters['search'])) {
            $s = (string) $filters['search'];
            $query->where(function (Builder $q) use ($s) {
                $q->where('identifier', 'like', "%{$s}%")
                    ->orWhere('reason', 'like', "%{$s}%");
            });
        }

        if (($filters['active'] ?? null) === '1') {
            $query->active();
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function create(array $data): Blacklist
    {
        $data['identifier'] = trim((string) $data['identifier']);

        // Normalisation pour éviter les mismatches (ex: Email en minuscules)
        if ((int) ($data['type'] ?? 0) === Blacklist::TYPE_EMAIL) {
            $data['identifier'] = mb_strtolower($data['identifier']);
        }

        return BlacklistAction::create($data);
    }

    public function blockUserCompletely(User $user, array $metadata = [], ?string $reason = null): void
    {
        DB::transaction(function () use ($user, $metadata, $reason) {
            $meta = array_merge($metadata, [
                'blocked_user_id' => $user->id,
            ]);

            // 1) Email (le plus important: bloque même si change d'appareil/navigateur)
            if (is_string($user->email) && trim($user->email) !== '') {
                BlacklistAction::updateOrCreatePermanent(
                    Blacklist::TYPE_EMAIL,
                    mb_strtolower(trim($user->email)),
                    [
                        'reason' => $reason ?? 'Blocked user',
                        'metadata' => $meta,
                    ],
                );
            }

            // 2) Phone
            if (is_string($user->phone ?? null) && trim((string) $user->phone) !== '') {
                BlacklistAction::updateOrCreatePermanent(
                    Blacklist::TYPE_PHONE,
                    trim((string) $user->phone),
                    [
                        'reason' => $reason ?? 'Blocked user',
                        'metadata' => $meta,
                    ],
                );
            }

            // 3) Tous les devices connus: fingerprints + IPs
            $user->loadMissing('devices');
            foreach ($user->devices as $device) {
                if (is_string($device->fingerprint) && trim($device->fingerprint) !== '') {
                    BlacklistAction::updateOrCreatePermanent(
                        Blacklist::TYPE_FINGERPRINT,
                        trim($device->fingerprint),
                        [
                            'reason' => $reason ?? 'Blocked user device',
                            'metadata' => $meta,
                        ],
                    );
                }

                if (is_string($device->last_ip ?? null) && trim((string) $device->last_ip) !== '') {
                    BlacklistAction::updateOrCreatePermanent(
                        Blacklist::TYPE_IP,
                        trim((string) $device->last_ip),
                        [
                            'reason' => $reason ?? 'Blocked user device IP',
                            'metadata' => $meta,
                        ],
                    );
                }
            }

            // Notification interne (admin) pour journaliser le blocage
            try {
                MailHelper::notifyAdminsAndManagers(
                    subject: __('User blocked: :email', ['email' => $user->email ?? ('#' . $user->id)]),
                    content: [
                        __('A user has been fully blocked in the blacklist system.'),
                        'ID: ' . $user->id,
                        'Email: ' . ($user->email ?? '-'),
                        'Phone: ' . ($user->phone ?? '-'),
                    ],
                );
            } catch (\Throwable $e) {
                Log::error('BlacklistService::blockUserCompletely admin notification failed', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        });
    }

    public function remove(int $id): void
    {
        $ban = Blacklist::findOrFail($id);
        BlacklistAction::delete($ban);
    }

    public function isBlocked(array $checks): bool
    {
        // $checks: [['type' => int, 'identifier' => string], ...]
        $checks = array_values(array_filter($checks, fn ($c) => !empty($c['identifier']) && !empty($c['type'])));
        if (count($checks) === 0) return false;

        $q = Blacklist::query()->active();
        $q->where(function (Builder $or) use ($checks) {
            foreach ($checks as $c) {
                $or->orWhere(function (Builder $and) use ($c) {
                    $and->where('type', (int) $c['type'])
                        ->where('identifier', (string) $c['identifier']);
                });
            }
        });

        return $q->exists();
    }
}

