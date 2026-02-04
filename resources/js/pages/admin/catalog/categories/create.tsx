import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import CategoryForm from './category-form';
import categoriesRoute from '@/routes/categories';
import { useTranslate } from '@/lib/i18n';

interface Props {
    parentCategories: any[];
}

export default function Create({ parentCategories }: Props) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Catalogue'), href: categoriesRoute.index().url },
        { title: __('New Category'), href: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('New Category')} />
            
            <div className="flex flex-col gap-8 p-6 md:p-8 pt-4"> 
                <Heading 
                    title={__('New Category')} 
                    description={__('Create a new category to organize your products.')} 
                />
                
                <div className="w-full">
                    <CategoryForm parentCategories={parentCategories} />
                </div>
            </div>
        </AppLayout>
    );
}