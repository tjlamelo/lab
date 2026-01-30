<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => [
                    'en' => 'Metals & Rare Elements',
                    'fr' => 'Métaux & Éléments Rares',
                    'ar' => 'المعادن والعناصر النادرة',
                    'ru' => 'Металлы и редкие элементы',
                    'zh' => '金属与稀有元素'
                ],
                'slug' => 'metals-rare-elements',
                'description' => ['en' => 'Mercury, isotopes, and precious ores.', 'fr' => 'Mercure, isotopes et minerais précieux.'],
            ],
            [
                'name' => [
                    'en' => 'Industrial Cleaning Solutions',
                    'fr' => 'Solutions de Nettoyage Industriel',
                    'ar' => 'حلول التنظيف الصناعية',
                    'ru' => 'Промышленные чистящие средства',
                    'zh' => '工业清洁解决方案'
                ],
                'slug' => 'industrial-cleaning-solutions',
                'description' => ['en' => 'SSD range, activation powders and pastes.', 'fr' => 'Gamme SSD, poudres et pâtes d’activation.'],
            ],
            [
                'name' => [
                    'en' => 'Oxidizing Agents',
                    'fr' => 'Réactifs Oxydants',
                    'ar' => 'عوامل مؤكسدة',
                    'ru' => 'Окислители',
                    'zh' => '氧化剂'
                ],
                'slug' => 'oxidizing-agents',
                'description' => ['en' => 'Heavy oxidizers for metal transformation.', 'fr' => 'Oxydants lourds pour la transformation des métaux.'],
            ],
            [
                'name' => [
                    'en' => 'Acids & Superacids',
                    'fr' => 'Acides & Superacides',
                    'ar' => 'الأحماض والأحماض الفائقة',
                    'ru' => 'Кислоты и суперкислоты',
                    'zh' => '酸和超强酸'
                ],
                'slug' => 'acids-superacids',
                'description' => ['en' => 'Highly corrosive solutions and superacids.', 'fr' => 'Solutions corrosives et superacides de haute puissance.'],
            ]
        ];

        foreach ($categories as $cat) {
            Category::create([
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'description' => [
                    'en' => $cat['description']['en'] ?? '',
                    'fr' => $cat['description']['fr'] ?? '',
                    'ar' => '', 'ru' => '', 'zh' => '' // À compléter si besoin
                ],
                'is_active' => true,
            ]);
        }
    }
}