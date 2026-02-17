<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Récupération des catégories
        $catMetals = Category::where('slug', 'metals-rare-elements')->first();
        $catCleaning = Category::where('slug', 'industrial-cleaning-solutions')->first();
        $catOxidants = Category::where('slug', 'oxidizing-agents')->first();
        $catAcids = Category::where('slug', 'acids-superacids')->first();

        // Définition des unités GLOBALES (Simples chaînes de caractères)
        // Définition des unités UNIVERSELLES (Symboles SI et standards)
        $uLitre   = 'L';      // Symbole international pour Litre
        $uGramme  = 'g';      // Symbole international pour Gramme
        $uKg      = 'kg';     // Symbole international pour Kilogramme
        $uSachet  = 'Unit';   // Plus standard que Sachet (ou "Sachet" si tu préfères)
        $uPot     = 'Jar';    // Standard industriel (ou "Pot")

        $products = [
            // --- OXIDIZING AGENTS ---
            [
                'cat' => $catOxidants->id,
                'price' => 1000,
                'slug' => 'caluanie-muelear-oxidize',
                'unit' => $uLitre,
                'names' => ['en' => 'Caluanie Muelear Oxidize', 'fr' => 'Caluanie Muelear Oxidize', 'ar' => 'كالواني موليار أكسيد', 'ru' => 'Калуани Мулеар Оксидайз', 'zh' => '卡鲁阿尼氧化剂'],
                // AJOUT DES IMAGES
                'image_files' => ['caluanie.png', 'caluanie2.png', 'caluanie3.png', 'caluanie4.png', 'caluanie5.png', 'caluanie6.png'],
                'is_featured' => true
            ],
            [
                'cat' => $catOxidants->id,
                'price' => 850,
                'slug' => 'tebit-benzone',
                'unit' => $uLitre,
                'names' => ['en' => 'Tebit-Benzone', 'fr' => 'Tebit-Benzone', 'ar' => 'تيبيت بنزون', 'ru' => 'Тебит-Бензон', 'zh' => '特比特苯酮']
            ],

            // --- CLEANING SOLUTIONS ---
            [
                'cat' => $catCleaning->id,
                'price' => 1630,
                'slug' => 'ssd-chemical-solution',
                'unit' => $uLitre,
                'names' => ['en' => 'SSD Chemical Solution', 'fr' => 'Solution Chimique SSD', 'ar' => 'محلول SSD الكيميائي', 'ru' => 'Химический раствор SSD', 'zh' => 'SSD化学溶液'],
                // AJOUT DE L'IMAGE
                'image_files' => ['ssd.png'],
                   'is_featured' => true
            ],
            [
                'cat' => $catCleaning->id,
                'price' => 176,
                'slug' => 'activation-powder',
                'unit' => $uSachet,
                'names' => ['en' => 'Activation Powder', 'fr' => 'Poudre d\'Activation', 'ar' => 'مسحوق التنشيط', 'ru' => 'Активационный порошок', 'zh' => '活化粉']
            ],
            [
                'cat' => $catCleaning->id,
                'price' => 215,
                'slug' => 'vectrol-paste',
                'unit' => $uPot,
                'names' => ['en' => 'Vectrol Paste', 'fr' => 'Pâte Vectrol', 'ar' => 'معجون فيكترول', 'ru' => 'Паста Вектрол', 'zh' => 'Vectrol 膏体']
            ],
            [
                'cat' => $catCleaning->id,
                'price' => 145,
                'slug' => 'humi-powder',
                'unit' => $uSachet,
                'names' => ['en' => 'Humi Powder', 'fr' => 'Poudre Humi', 'ar' => 'مسحوق هومي', 'ru' => 'Хуми порошок', 'zh' => 'Humi 粉末']
            ],
            [
                'cat' => $catCleaning->id,
                'price' => 1200,
                'slug' => 'zuchote-ozone-liquid',
                'unit' => $uLitre,
                'names' => ['en' => 'Zuchote Ozone Liquid', 'fr' => 'Zuchote Ozone Liquide', 'ar' => 'سائل زوتشوت أوزون', 'ru' => 'Озоновая жидкость Zuchote', 'zh' => 'Zuchote 臭氧液体']
            ],
            [
                'cat' => $catCleaning->id,
                'price' => 950,
                'slug' => 's2000-chemical',
                'unit' => $uLitre,
                'names' => ['en' => 'S2000 Chemical', 'fr' => 'Produit Chimique S2000', 'ar' => 'S2000 كيميائي', 'ru' => 'Химикат S2000', 'zh' => 'S2000 化学品']
            ],

            // --- METALS & RARE ELEMENTS ---
            [
                'cat' => $catMetals->id,
                'price' => 10800,
                'slug' => 'red-mercury',
                'unit' => $uGramme,
                'names' => ['en' => 'Red Mercury', 'fr' => 'Mercure Rouge', 'ar' => 'الزئبق الأحمر', 'ru' => 'Красная ртуть', 'zh' => '红汞'],
                // AJOUT DE L'IMAGE
                'image_files' => ['red-mercury.png'],
                   'is_featured' => true
            ],
            [
                'cat' => $catMetals->id,
                'price' => 22000,
                'slug' => 'radium',
                'unit' => $uGramme,
                'names' => ['en' => 'Radium', 'fr' => 'Radium', 'ar' => 'راديوم', 'ru' => 'Радий', 'zh' => '镭'],
                // AJOUT DE L'IMAGE (en utilisant le nom de fichier avec la faute de frappe)
                'image_files' => ['raduim.png'],
                   'is_featured' => true
            ],
            [
                'cat' => $catMetals->id,
                'price' => 2000,
                'slug' => 'osmium',
                'unit' => $uGramme,
                'names' => ['en' => 'Osmium', 'fr' => 'Osmium', 'ar' => 'أوزميوم', 'ru' => 'Осмий', 'zh' => '锇']
            ],
            [
                'cat' => $catMetals->id,
                'price' => 560,
                'slug' => 'liquid-mercury',
                'unit' => $uKg,
                'names' => ['en' => 'Mercury (Quicksilver)', 'fr' => 'Mercure (Vif-argent)', 'ar' => 'زئبق', 'ru' => 'Ртуть', 'zh' => '汞']
            ],
            [
                'cat' => $catMetals->id,
                'price' => 300,
                'slug' => 'gallium',
                'unit' => $uKg,
                'names' => ['en' => 'Gallium', 'fr' => 'Gallium', 'ar' => 'غاليوم', 'ru' => 'Галлий', 'zh' => '镓']
            ],
            [
                'cat' => $catMetals->id,
                'price' => 150,
                'slug' => 'gold-24k',
                'unit' => $uGramme,
                'names' => ['en' => 'Gold (24k)', 'fr' => 'Or (24k)', 'ar' => 'ذهب (24 قيراط)', 'ru' => 'Золото (24к)', 'zh' => '黄金 (24k)']
            ],
            [
                'cat' => $catMetals->id,
                'price' => 850,
                'slug' => 'cinnabar',
                'unit' => $uKg,
                'names' => ['en' => 'Cinnabar', 'fr' => 'Cinabre', 'ar' => 'سينار', 'ru' => 'Киноварь', 'zh' => '辰砂']
            ],
            [
                'cat' => $catMetals->id,
                'price' => 15000,
                'slug' => 'polonium',
                'unit' => $uGramme,
                'names' => ['en' => 'Polonium', 'fr' => 'Polonium', 'ar' => 'بولونيوم', 'ru' => 'Полоний', 'zh' => '钋']
            ],

            // --- ACIDS & SUPERACIDS ---
            [
                'cat' => $catAcids->id,
                'price' => 40,
                'slug' => 'hydrofluoric-acid',
                'unit' => $uLitre,
                'names' => ['en' => 'Hydrofluoric Acid', 'fr' => 'Acide Fluorhydrique', 'ar' => 'حمض الهيدروفلوريك', 'ru' => 'Фтористоводородная кислота', 'zh' => '氢氟酸']
            ],
            [
                'cat' => $catAcids->id,
                'price' => 33,
                'slug' => 'aqua-regia',
                'unit' => $uLitre,
                'names' => ['en' => 'Aqua Regia', 'fr' => 'Eau Régale', 'ar' => 'الماء الملكي', 'ru' => 'Царская водка', 'zh' => '王水']
            ],
            [
                'cat' => $catAcids->id,
                'price' => 4200,
                'slug' => 'hydrogen-fluoroantimonate',
                'unit' => '500ml',
                'names' => ['en' => 'Hydrogen Fluoroantimonate', 'fr' => 'Fluoroantimonate d\'hydrogène', 'ar' => 'فلوروأنتمونات الهيدروجين', 'ru' => 'Фтороантимонат водорода', 'zh' => '氟锑酸']
            ],
        ];

        foreach ($products as $p) {
            // Préparation des données de base du produit
            $productData = [
                'category_id' => $p['cat'],
                'name' => $p['names'],
                'unit' => $p['unit'],
                'slug' => $p['slug'],
                'price' => $p['price'],
                'stock' => rand(15, 150),
                'sku' => 'PL-' . strtoupper(Str::random(6)),
                'is_active' => true,
                // --- LIGNE AJOUTÉE ---
                // Copie la valeur 'is_featured' depuis $p, ou met 'false' par défaut si elle n'existe pas.
                'is_featured' => $p['is_featured'] ?? false,
                'description' => [
                    'en' => "High-purity {$p['names']['en']} for professional laboratory and industrial use.",
                    'fr' => "{$p['names']['fr']} de haute pureté pour usage professionnel en laboratoire.",
                    'ar' => "{$p['names']['ar']} عالي النقاء للاستخدام المخبري والصناعي المحترف.",
                    'ru' => "Высокочистый {$p['names']['ru']} для профессионального использования.",
                    'zh' => "高纯度 {$p['names']['zh']}，供专业实验室使用。"
                ],
                'meta' => [
                    'purity' => '99.99%',
                    'origin' => 'Global Logistics',
                    'seo' => [
                        'title' => $p['names'],
                        'description' => [
                            'en' => "Order {$p['names']['en']} online. Certified industrial quality.",
                            'fr' => "Commandez {$p['names']['fr']} en ligne. Qualité industrielle certifiée.",
                        ],
                        'keywords' => "chemical, lab, industrial, {$p['slug']}"
                    ]
                ],
            ];

            // --- LOGIQUE POUR LES IMAGES ---
            // Vérifie si la clé 'image_files' existe pour ce produit
            if (isset($p['image_files'])) {
                // Utilise array_map pour ajouter le préfixe '/img/products/' à chaque nom de fichier
                $imagePaths = array_map(function($filename) {
                    return '/img/products/' . $filename;
                }, $p['image_files']);

                // Ajoute le tableau des chemins d'images aux données du produit
                $productData['images'] = $imagePaths;
            }
            // --- FIN DE LA LOGIQUE POUR LES IMAGES ---

            // Crée le produit avec toutes les données, y compris les images et is_featured
            Product::create($productData);
        }
    }
}