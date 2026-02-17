<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SystemDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = (string) $request->query('period', 'month');
        $period = in_array($period, ['day', 'week', 'month', 'year'], true) ? $period : 'month';

        [$start, $end, $bucket] = $this->resolveRange($period);

        // Orders in range (keep it portable across DB drivers by grouping in PHP)
        $orders = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->get(['id', 'created_at', 'total_amount', 'status', 'payment_status', 'order_number', 'user_id']);

        $series = $this->buildSeries($orders, $bucket, $start, $end);

        // KPIs
        $totalOrders = $orders->count();
        $paidOrders = $orders->filter(fn (Order $o) => $o->payment_status === PaymentStatus::PAID)->count();
        $deliveredOrders = $orders->filter(fn (Order $o) => $o->status === OrderStatus::DELIVERED)->count();
        $pendingPaymentOrders = $orders->filter(fn (Order $o) => in_array($o->payment_status, [
            PaymentStatus::PENDING,
            PaymentStatus::WAITING_VERIFICATION,
        ], true))->count();

        $paidRevenue = (float) $orders
            ->filter(fn (Order $o) => $o->payment_status === PaymentStatus::PAID)
            ->sum('total_amount');

        $avgOrderValue = $paidOrders > 0 ? round($paidRevenue / $paidOrders, 2) : 0.0;

        $newCustomers = User::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        // Previous period for deltas
        [$prevStart, $prevEnd] = $this->previousRange($start, $end);
        $prevOrders = Order::query()
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->get(['id', 'total_amount', 'status', 'payment_status']);

        $prevPaidOrders = $prevOrders->filter(fn (Order $o) => $o->payment_status === PaymentStatus::PAID)->count();
        $prevPaidRevenue = (float) $prevOrders->filter(fn (Order $o) => $o->payment_status === PaymentStatus::PAID)->sum('total_amount');
        $prevTotalOrders = $prevOrders->count();

        $deltas = [
            'revenue_paid' => $this->pctDelta($prevPaidRevenue, $paidRevenue),
            'orders' => $this->pctDelta($prevTotalOrders, $totalOrders),
            'paid_orders' => $this->pctDelta($prevPaidOrders, $paidOrders),
        ];

        // Top products (paid orders only)
        $topProducts = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereBetween('orders.created_at', [$start, $end])
            ->where('orders.payment_status', PaymentStatus::PAID->value)
            ->selectRaw('order_items.product_id as product_id')
            ->selectRaw('order_items.product_name_at_purchase as product_name')
            ->selectRaw('SUM(order_items.quantity) as qty')
            ->selectRaw('SUM(order_items.quantity * order_items.price) as revenue')
            ->groupBy('order_items.product_id', 'order_items.product_name_at_purchase')
            ->orderByDesc('revenue')
            ->limit(8)
            ->get()
            ->map(function ($row) {
                // product_name_at_purchase peut être JSON (translations) => on prend une string safe
                $name = $row->product_name;
                if (is_array($name)) {
                    $locale = app()->getLocale();
                    $name = $name[$locale] ?? $name['en'] ?? reset($name) ?? __('Product');
                }
                if (!is_string($name) || trim($name) === '') {
                    $name = __('Product');
                }

                return [
                    'product_id' => $row->product_id,
                    'name' => $name,
                    'qty' => (int) $row->qty,
                    'revenue' => (float) $row->revenue,
                ];
            })
            ->values();

        $recentOrders = $orders
            ->sortByDesc('created_at')
            ->take(8)
            ->values()
            ->map(fn (Order $o) => [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'total_amount' => (float) $o->total_amount,
                'status' => (string) $o->status->value,
                'status_label' => $o->status->label(),
                'payment_status' => (string) $o->payment_status->value,
                'payment_status_label' => $o->payment_status->label(),
                'created_at' => optional($o->created_at)->toISOString(),
            ]);

        return Inertia::render('dashboard', [
            'period' => $period,
            'range' => [
                'start' => $start->toDateTimeString(),
                'end' => $end->toDateTimeString(),
            ],
            'kpis' => [
                'revenue_paid' => round($paidRevenue, 2),
                'orders' => $totalOrders,
                'paid_orders' => $paidOrders,
                'delivered_orders' => $deliveredOrders,
                'pending_payment_orders' => $pendingPaymentOrders,
                'new_customers' => $newCustomers,
                'avg_order_value' => $avgOrderValue,
            ],
            'deltas' => $deltas,
            'series' => $series,
            'top_products' => $topProducts,
            'recent_orders' => $recentOrders,
        ]);
    }

    private function resolveRange(string $period): array
    {
        // IMPORTANT: certains projets configurent "now()" en CarbonImmutable.
        // Ici on force Carbon mutable pour éviter les erreurs de type.
        $end = Carbon::now();

        return match ($period) {
            // dernières 24h, bucket par heure
            'day' => [$end->copy()->subHours(23)->startOfHour(), $end, 'hour'],
            // 7 derniers jours, bucket par jour
            'week' => [$end->copy()->subDays(6)->startOfDay(), $end, 'day'],
            // 30 derniers jours, bucket par jour
            'month' => [$end->copy()->subDays(29)->startOfDay(), $end, 'day'],
            // 12 derniers mois, bucket par mois
            'year' => [$end->copy()->subMonths(11)->startOfMonth(), $end, 'month'],
            default => [$end->copy()->subDays(29)->startOfDay(), $end, 'day'],
        };
    }

    private function previousRange(Carbon $start, Carbon $end): array
    {
        // Si jamais on reçoit un CarbonImmutable, on le convertit en Carbon mutable
        $start = Carbon::parse($start);
        $end = Carbon::parse($end);

        $seconds = max(1, $end->diffInSeconds($start));
        $prevEnd = $start->copy();
        $prevStart = $prevEnd->copy()->subSeconds($seconds);
        return [$prevStart, $prevEnd];
    }

    private function buildSeries($orders, string $bucket, Carbon $start, Carbon $end): array
    {
        // Robustesse: accepte Carbon / CarbonImmutable via parse()
        $start = Carbon::parse($start)->copy();
        $end = Carbon::parse($end)->copy();

        $points = [];
        $cursor = $start->copy();
        while ($cursor <= $end) {
            $key = $this->bucketKey($cursor, $bucket);
            $points[$key] = [
                'label' => $this->bucketLabel($cursor, $bucket),
                'revenue' => 0.0,
                'orders' => 0,
                'paid_orders' => 0,
            ];

            $cursor = match ($bucket) {
                'hour' => $cursor->addHour(),
                'day' => $cursor->addDay(),
                'month' => $cursor->addMonth(),
                default => $cursor->addDay(),
            };
        }

        foreach ($orders as $o) {
            if (!$o->created_at) continue;
            $at = Carbon::parse($o->created_at);
            $key = $this->bucketKey($at, $bucket);
            if (!isset($points[$key])) continue;

            $points[$key]['orders'] += 1;
            if ($o instanceof Order && $o->payment_status === PaymentStatus::PAID) {
                $points[$key]['paid_orders'] += 1;
                $points[$key]['revenue'] += (float) $o->total_amount;
            }
        }

        return array_values($points);
    }

    private function bucketKey(Carbon $at, string $bucket): string
    {
        return match ($bucket) {
            'hour' => $at->format('Y-m-d H'),
            'day' => $at->format('Y-m-d'),
            'month' => $at->format('Y-m'),
            default => $at->format('Y-m-d'),
        };
    }

    private function bucketLabel(Carbon $at, string $bucket): string
    {
        return match ($bucket) {
            'hour' => $at->format('H:00'),
            'day' => $at->format('d M'),
            'month' => $at->format('M Y'),
            default => $at->format('d M'),
        };
    }

    private function pctDelta(float|int $prev, float|int $cur): ?float
    {
        $prevVal = (float) $prev;
        $curVal = (float) $cur;
        if ($prevVal == 0.0) {
            return $curVal == 0.0 ? 0.0 : null;
        }
        return round((($curVal - $prevVal) / $prevVal) * 100, 1);
    }
}

