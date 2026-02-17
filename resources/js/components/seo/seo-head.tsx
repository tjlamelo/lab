import React from 'react';
import { Head } from '@inertiajs/react';

interface SeoHeadProps {
    title: string;
    description?: string;
    keywords?: string | string[];
    canonicalUrl?: string;
    imageUrl?: string;
    openGraphType?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    jsonLd?: unknown;
}

export function SeoHead({
    title,
    description,
    keywords,
    canonicalUrl,
    imageUrl,
    openGraphType = 'product',
    robotsIndex = true,
    robotsFollow = true,
    jsonLd,
}: SeoHeadProps) {
    const keywordsContent = Array.isArray(keywords)
        ? keywords.join(', ')
        : keywords;

    return (
        <Head>
            <title>{title}</title>

            {description && (
                <meta name="description" content={description} />
            )}

            {keywordsContent && (
                <meta name="keywords" content={keywordsContent} />
            )}

            {canonicalUrl && (
                <link rel="canonical" href={canonicalUrl} />
            )}

            {/* Robots */}
            <meta
                name="robots"
                content={`${robotsIndex ? 'index' : 'noindex'},${robotsFollow ? 'follow' : 'nofollow'}`}
            />

            {/* Open Graph */}
            <meta property="og:type" content={openGraphType || 'product'} />
            <meta property="og:title" content={title} />
            {description && (
                <meta property="og:description" content={description} />
            )}
            {canonicalUrl && (
                <meta property="og:url" content={canonicalUrl} />
            )}
            {imageUrl && (
                <meta property="og:image" content={imageUrl} />
            )}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            {description && (
                <meta
                    name="twitter:description"
                    content={description}
                />
            )}
            {imageUrl && (
                <meta name="twitter:image" content={imageUrl} />
            )}

            {/* JSON-LD Schema.org */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </Head>
    );
}

