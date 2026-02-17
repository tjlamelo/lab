<?php

namespace App\Core\Security\Actions;

use App\Models\Blacklist;
use Illuminate\Support\Facades\DB;

final class BlacklistAction
{
    public static function updateOrCreatePermanent(int $type, string $identifier, array $attributes = []): Blacklist
    {
        return DB::transaction(function () use ($type, $identifier, $attributes) {
            /** @var Blacklist $ban */
            $ban = Blacklist::query()->updateOrCreate(
                [
                    'type' => $type,
                    'identifier' => $identifier,
                    'expires_at' => null,
                ],
                $attributes,
            );

            return $ban->fresh();
        });
    }

    public static function create(array $data): Blacklist
    {
        return DB::transaction(function () use ($data) {
            return Blacklist::create($data);
        });
    }

    public static function delete(Blacklist $ban): void
    {
        DB::transaction(function () use ($ban) {
            $ban->delete();
        });
    }
}

