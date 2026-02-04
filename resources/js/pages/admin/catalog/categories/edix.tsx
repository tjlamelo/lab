import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import CategoryForm from './category-form';
import categoriesRoute from '@/routes/categories';
import { useTranslate } from '@/lib/i18n';

interface Props {
    category: any;
    parentCategories: any[];
}

export default function Edit({ category, parentCategories }: Props) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Catalogue'), href: categoriesRoute.index().url },
        { title: __('Edit Category'), href: '#' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Edit Category')} />
            
            <div className="flex flex-col gap-8 p-6 md:p-8 pt-4"> 
                <Heading 
                    title={__('Edit Category')} 
                    description={__('Update the details and localization for this category.')} 
                />
                
                <div className="w-full">
                    <CategoryForm 
                        category={category} 
                        parentCategories={parentCategories} 
                    />
                </div>
            </div>
        </AppLayout>
    );
}