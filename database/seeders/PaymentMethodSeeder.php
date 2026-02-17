<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'slug' => 'bitcoin',
                'logo' => 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
                'name' => 'Bitcoin (BTC)',
                'instructions' => [
                    'en' => 'Send BTC to the address below. Network: Bitcoin.',
                    'fr' => 'Envoyez BTC à l’adresse ci-dessous. Réseau : Bitcoin.',
                    'ar' => 'أرسل BTC إلى العنوان أدناه. الشبكة: Bitcoin.',
                    'ru' => 'Отправьте BTC по адресу ниже. Сеть: Bitcoin.',
                    'zh' => '发送 BTC 到下方地址。网络：Bitcoin。'
                ],
                'payment_details' => [
                    'address' => 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                    'network' => 'Bitcoin'
                ]
            ],
            [
                'slug' => 'ethereum',
                'logo' => 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
                'name' => 'Ethereum (ETH)',
                'instructions' => [
                    'en' => 'Send ETH to the address below. Network: ERC20.',
                    'fr' => 'Envoyez ETH à l’adresse ci-dessous. Réseau : ERC20.',
                    'ar' => 'أرسل ETH إلى العنوان أدناه. الشبكة: ERC20.',
                    'ru' => 'Отправьте ETH по адресу ниже. Сеть: ERC20.',
                    'zh' => '发送 ETH 到下方地址。网络：ERC20。'
                ],
                'payment_details' => [
                    'address' => '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
                    'network' => 'ERC20'
                ]
            ],
            [
                'slug' => 'usdt',
                'logo' => 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
                'name' => 'Tether (USDT)',
                'instructions' => [
                    'en' => 'Send USDT to the address below. Network: TRC20.',
                    'fr' => 'Envoyez USDT à l’adresse ci-dessous. Réseau : TRC20.',
                    'ar' => 'أرسل USDT إلى العنوان أدناه. الشبكة: TRC20.',
                    'ru' => 'Отправьте USDT по адресу ниже. Сеть: TRC20.',
                    'zh' => '发送 USDT 到下方地址。网络：TRC20。'
                ],
                'payment_details' => [
                    'address' => 'TX9r93933fVd9393kdKk393ksS9393kS',
                    'network' => 'TRON (TRC20)'
                ]
            ],
            // [
            //     'slug' => 'visa',
            //     'logo' => 'https://cdn.simpleicons.org/visa',
            //     'name' => 'Visa',
            //     'instructions' => [
            //         'en' => 'Enter your Visa card details to proceed with payment.',
            //         'fr' => 'Entrez les détails de votre carte Visa pour procéder au paiement.',
            //         'ar' => 'أدخل تفاصيل بطاقة الفيزا الخاصة بك لإتمام الدفع.',
            //         'ru' => 'Введите данные вашей карты Visa для совершения оплаты.',
            //         'zh' => '请输入您的 Visa 卡详情以继续付款。'
            //     ],
            //     'payment_details' => [
            //         'processor' => 'Stripe/Direct'
            //     ]
            // ],
            // [
            //     'slug' => 'mastercard',
            //     'logo' => 'https://cdn.simpleicons.org/mastercard',
            //     'name' => 'Mastercard',
            //     'instructions' => [
            //         'en' => 'Enter your Mastercard details to proceed with payment.',
            //         'fr' => 'Entrez les détails de votre carte Mastercard pour procéder au paiement.',
            //         'ar' => 'أدخل تفاصيل بطاقة ماستركارد الخاصة بك لإتمام الدفع.',
            //         'ru' => 'Введите данные вашей карты Mastercard для совершения оплаты.',
            //         'zh' => '请输入您的 Mastercard 卡详情以继续付款。'
            //     ],
            //     'payment_details' => [
            //         'processor' => 'Stripe/Direct'
            //     ]
            // ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(
                ['slug' => $method['slug']],
                [
                    'name'            => $method['name'],
                    'instructions'    => $method['instructions'],
                    'logo'            => $method['logo'],
                    'payment_details' => $method['payment_details'],
                    'is_active'       => true,
                ]
            );
        }
    }
}