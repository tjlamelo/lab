@php
// Définition du catalogue pour le SEO statique
$catalogSeo = [
    'categoryNames' => [
        'Metals & Rare Elements',
        'Industrial Cleaning Solutions',
        'Oxidizing Agents',
        'Acids & Superacids',
        'Laboratory Solvents',
        'Analytical Reagents',
        'Pharmaceutical Intermediates',
        'Biotechnology Chemicals',
        'Specialty Chemicals'
    ],
    'productNames' => [
        'Caluanie Muelear Oxidize',
        'Tebit-Benzone',
        'SSD Chemical Solution',
        'Activation Powder',
        'Vectrol Paste',
        'Humi Powder',
        'Zuchote Ozone Liquid',
        'S2000 Chemical',
        'Red Mercury',
        'Radium',
        'Osmium',
        'Mercury (Quicksilver)',
        'Gallium',
        'Gold 24k',
        'Cinnabar',
        'Polonium',
        'Hydrofluoric Acid',
        'Aqua Regia',
        'Hydrogen Fluoroantimonate'
    ]
];

$appName = config('app.name', 'PrimeLab Chemicals');
$appUrl = config('app.url', url('/'));
$appLogo = $appUrl.'/img/logo.png';

$appDescription =
"PrimeLab Chemicals supplies high-purity laboratory and specialty chemicals for research, pharmaceutical production, biotechnology, analytical laboratories and industrial applications.";

$keywords = implode(', ', array_merge(
    [$appName],
    $catalogSeo['categoryNames'],
    array_slice($catalogSeo['productNames'], 0, 15),
    [
        'laboratory chemicals supplier',
        'specialty chemicals supplier',
        'buy research chemicals',
        'industrial chemical products'
    ]
));

// Préparer JSON-LD des catégories
$categoryJson = [];
foreach ($catalogSeo['categoryNames'] as $cat) {
    $categoryJson[] = [
        "@type" => "OfferCatalog",
        "name" => $cat
    ];
}
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ $appName }} | Laboratory & Specialty Chemicals</title>
    <meta name="description" content="{{ $appDescription }}">
    <meta name="keywords" content="{{ $keywords }}">
    <link rel="canonical" href="{{ url()->current() }}">

    {{-- Open Graph / Facebook --}}
    <meta property="og:title" content="{{ $appName }}">
    <meta property="og:description" content="{{ $appDescription }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ $appLogo }}">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $appName }}">
    <meta name="twitter:description" content="{{ $appDescription }}">
    <meta name="twitter:image" content="{{ $appLogo }}">

    {{-- Manifest & PWA Icons --}}
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" href="/img/logo.png" sizes="32x32" type="image/png">
    <link rel="icon" href="/img/logo.png" sizes="192x192" type="image/png">
    <link rel="apple-touch-icon" href="/img/logo.png">

    {{-- Google Fonts --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    {{-- JSON-LD Organisation --}}
 

    {{-- Inline dark mode detection --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? "system" }}';
            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline HTML background color --}}
    <style>
        html { background-color: oklch(1 0 0); }
        html.dark { background-color: oklch(0.145 0 0); }
    </style>

    @viteReactRefresh
    @vite(['resources/js/app.tsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>
</html>
