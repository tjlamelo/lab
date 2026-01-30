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
                'logo' => 'btc.svg',
                'name' => [
                    'en' => 'Bitcoin (BTC)', 'fr' => 'Bitcoin (BTC)', 'ar' => 'بيتكوين (BTC)', 'ru' => 'Биткоин (BTC)', 'zh' => '比特币 (BTC)'
                ],
                'instructions' => [
                    'en' => 'Send BTC to: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh. Network: Bitcoin.',
                    'fr' => 'Envoyez BTC à : bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh. Réseau : Bitcoin.',
                    'ar' => 'أرسل BTC إلى: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh. الشبكة: Bitcoin.',
                    'ru' => 'Отправьте BTC на: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh. Сеть: Bitcoin.',
                    'zh' => '发送 BTC 至：bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh。网络：Bitcoin。'
                ]
            ],
            [
                'slug' => 'ethereum',
                'logo' => 'eth.svg',
                'name' => [
                    'en' => 'Ethereum (ETH)', 'fr' => 'Ethereum (ETH)', 'ar' => 'إيثيريوم (ETH)', 'ru' => 'Эфириум (ETH)', 'zh' => '以太坊 (ETH)'
                ],
                'instructions' => [
                    'en' => 'Send ETH to: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Network: ERC20.',
                    'fr' => 'Envoyez ETH à : 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Réseau : ERC20.',
                    'ar' => 'أرسل ETH إلى: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. الشبكة: ERC20.',
                    'ru' => 'Отправьте ETH на: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Сеть: ERC20.',
                    'zh' => '发送 ETH 至：0x742d35Cc6634C0532925a3b844Bc454e4438f44e。网络：ERC20。'
                ]
            ],
            [
                'slug' => 'usdt',
                'logo' => 'usdt.svg',
                'name' => [
                    'en' => 'Tether (USDT)', 'fr' => 'Tether (USDT)', 'ar' => 'تيذر (USDT)', 'ru' => 'Тезер (USDT)', 'zh' => '泰达币 (USDT)'
                ],
                'instructions' => [
                    'en' => 'Send USDT to: TX9r93933fVd9393kdKk393ksS9393kS. Network: TRON (TRC20).',
                    'fr' => 'Envoyez USDT à : TX9r93933fVd9393kdKk393ksS9393kS. Réseau : TRON (TRC20).',
                    'ar' => 'أرسل USDT إلى: TX9r93933fVd9393kdKk393ksS9393kS. الشبكة: TRON (TRC20).',
                    'ru' => 'Отправьте USDT на: TX9r93933fVd9393kdKk393ksS9393kS. Сеть: TRON (TRC20).',
                    'zh' => '发送 USDT 至：TX9r93933fVd9393kdKk393ksS9393kS。网络：TRON (TRC20)。'
                ]
            ],
            [
                'slug' => 'bnb',
                'logo' => 'bnb.svg',
                'name' => [
                    'en' => 'BNB', 'fr' => 'BNB', 'ar' => 'بي إن بي (BNB)', 'ru' => 'BNB', 'zh' => '币安币 (BNB)'
                ],
                'instructions' => [
                    'en' => 'Send BNB to: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Network: BSC (BEP20).',
                    'fr' => 'Envoyez BNB à : 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Réseau : BSC (BEP20).',
                    'ar' => 'أرسل BNB إلى: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. الشبكة: BEP20.',
                    'ru' => 'Отправьте BNB на: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Сеть: BEP20.',
                    'zh' => '发送 BNB 至：0x742d35Cc6634C0532925a3b844Bc454e4438f44e。网络：BEP20。'
                ]
            ],
            [
                'slug' => 'dogecoin',
                'logo' => 'doge.svg',
                'name' => [
                    'en' => 'Dogecoin (DOGE)', 'fr' => 'Dogecoin (DOGE)', 'ar' => 'دوجكوين (DOGE)', 'ru' => 'Догикоин (DOGE)', 'zh' => '狗狗币 (DOGE)'
                ],
                'instructions' => [
                    'en' => 'Send DOGE to: D8v6m8kzV9k8k93kKk393ksS9393kS. Network: Dogecoin.',
                    'fr' => 'Envoyez DOGE à : D8v6m8kzV9k8k93kKk393ksS9393kS. Réseau : Dogecoin.',
                    'ar' => 'أرسل DOGE إلى: D8v6m8kzV9k8k93kKk393ksS9393kS. الشبكة: Dogecoin.',
                    'ru' => 'Отправьте DOGE на: D8v6m8kzV9k8k93kKk393ksS9393kS. Сеть: Dogecoin.',
                    'zh' => '发送 DOGE 至：D8v6m8kzV9k8k93kKk393ksS9393kS。网络：Dogecoin。'
                ]
            ],
            [
                'slug' => 'polygon',
                'logo' => 'pol.svg',
                'name' => [
                    'en' => 'Polygon (POL)', 'fr' => 'Polygon (POL)', 'ar' => 'بوليجون (POL)', 'ru' => 'Полигон (POL)', 'zh' => '多边形 (POL)'
                ],
                'instructions' => [
                    'en' => 'Send POL to: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Network: Polygon.',
                    'fr' => 'Envoyez POL à : 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Réseau : Polygon.',
                    'ar' => 'أرسل POL إلى: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. الشبكة: Polygon.',
                    'ru' => 'Отправьте POL на: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Сеть: Polygon.',
                    'zh' => '发送 POL 至：0x742d35Cc6634C0532925a3b844Bc454e4438f44e。网络：Polygon。'
                ]
            ],
            [
                'slug' => 'filecoin',
                'logo' => 'fil.svg',
                'name' => [
                    'en' => 'Filecoin (FIL)', 'fr' => 'Filecoin (FIL)', 'ar' => 'فايل كوين (FIL)', 'ru' => 'Файлкоин (FIL)', 'zh' => '文件币 (FIL)'
                ],
                'instructions' => [
                    'en' => 'Send FIL to: f1v6m8kzV9k8k93kKk393ksS9393kS. Network: Filecoin.',
                    'fr' => 'Envoyez FIL à : f1v6m8kzV9k8k93kKk393ksS9393kS. Réseau : Filecoin.',
                    'ar' => 'أرسل FIL إلى: f1v6m8kzV9k8k93kKk393ksS9393kS. الشبكة: Filecoin.',
                    'ru' => 'Отправьте FIL на: f1v6m8kzV9k8k93kKk393ksS9393kS. Сеть: Filecoin.',
                    'zh' => '发送 FIL 至：f1v6m8kzV9k8k93kKk393ksS9393kS。网络：Filecoin。'
                ]
            ],
            [
                'slug' => 'paypal',
                'logo' => 'paypal.svg',
                'name' => [
                    'en' => 'PayPal', 'fr' => 'PayPal', 'ar' => 'بايبال', 'ru' => 'PayPal', 'zh' => '贝宝'
                ],
                'instructions' => [
                    'en' => 'Send payment to: test-payment@example.com. Select "Family & Friends" for instant processing.',
                    'fr' => 'Envoyez le paiement à : test-payment@example.com. Sélectionnez "Amis et famille" pour un traitement instantané.',
                    'ar' => 'أرسل الدفعة إلى: test-payment@example.com. اختر "العائلة والأصدقاء" للمعالجة الفورية.',
                    'ru' => 'Отправьте платеж на: test-payment@example.com. Выберите «Друзья и семья» для мгновенной обработки.',
                    'zh' => '发送付款至：test-payment@example.com。选择“亲友转账”以实现即时处理。'
                ]
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(
                ['slug' => $method['slug']],
                [
                    'name' => $method['name'],
                    'instructions' => $method['instructions'],
                    'logo' => $method['logo'],
                    'is_active' => true,
                ]
            );
        }
    }
}