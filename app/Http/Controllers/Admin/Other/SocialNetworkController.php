<?php

namespace App\Http\Controllers\Admin\Other;

use App\Http\Controllers\Controller;
use App\Models\SocialNetwork;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SocialNetworkController extends Controller
{
    /**
     * Cache key used for the public front-end
     */
    private const CACHE_KEY = 'settings_social_networks';

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $socials = SocialNetwork::orderBy('order', 'asc')->get();

        return Inertia::render('admin/others/socials/index', [
            'socials' => $socials
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'platform'  => 'required|string|max:50',
            'url'       => 'required|string|url',
            'order'     => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        try {
            DB::transaction(function () use ($validated) {
                SocialNetwork::create($validated);
                Cache::forget(self::CACHE_KEY);
            });

            return back()->with('success', __('Social network created successfully.'));
        } catch (\Exception $e) {
            Log::error("SocialNetwork Store Error: " . $e->getMessage());
            return back()->with('error', __('Failed to create social network.'));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'platform'  => 'required|string|max:50',
            'url'       => 'required|string|url',
            'order'     => 'nullable|integer|min:0',
            'is_active' => 'boolean'
        ]);

        try {
            DB::transaction(function () use ($validated, $id) {
                $social = SocialNetwork::findOrFail($id);
                $social->update($validated);
                Cache::forget(self::CACHE_KEY);
            });

            return back()->with('success', __('Social network updated successfully.'));
        } catch (\Exception $e) {
            Log::error("SocialNetwork Update Error (ID {$id}): " . $e->getMessage());
            return back()->with('error', __('Failed to update social network.'));
        }
    }

    /**
     * Toggle the active status.
     */
    public function toggle(int $id)
    {
        try {
            DB::transaction(function () use ($id) {
                $social = SocialNetwork::findOrFail($id);
                $social->update(['is_active' => !$social->is_active]);
                Cache::forget(self::CACHE_KEY);
            });

            return back()->with('success', __('Status updated successfully.'));
        } catch (\Exception $e) {
            return back()->with('error', __('Toggle failed.'));
        }
    }

    /**
     * Reorder items (useful for Drag & Drop UI).
     * Expects an array of IDs in the desired order.
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:social_networks,id'
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->ids as $index => $id) {
                    SocialNetwork::where('id', $id)->update(['order' => $index]);
                }
                Cache::forget(self::CACHE_KEY);
            });

            return back()->with('success', __('Order updated successfully.'));
        } catch (\Exception $e) {
            Log::error("SocialNetwork Reorder Error: " . $e->getMessage());
            return back()->with('error', __('Failed to reorder items.'));
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        try {
            DB::transaction(function () use ($id) {
                $social = SocialNetwork::findOrFail($id);
                $social->delete();
                Cache::forget(self::CACHE_KEY);
            });

            return back()->with('success', __('Social network deleted successfully.'));
        } catch (\Exception $e) {
            Log::error("SocialNetwork Delete Error: " . $e->getMessage());
            return back()->with('error', __('Failed to delete social network.'));
        }
    }
}