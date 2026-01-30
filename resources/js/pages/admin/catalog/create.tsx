import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import ProductForm from './product-form';
import productsRoute from '@/routes/products';
import { useTranslate } from '@/lib/i18n';

interface Props {
    categories: any[];
}

export default function Create({ categories }: Props) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Catalogue'), href: productsRoute.index().url },
        { title: __('New Product'), href: '#' }
    ];

// Dans Create.tsx ou Edit.tsx
return (
    <AppLayout breadcrumbs={breadcrumbs}>
        {/* Ajout de px-6 ou px-8 pour décoller du bord */}
        <div className="flex flex-col gap-8 p-6 md:p-8 pt-4"> 
            <Heading 
                title={__('New Product')} 
                description={__('Add an item with its technical characteristics and stock.')} 
            />
            
            <div className="w-full">
                <ProductForm categories={categories} />
            </div>
        </div>
    </AppLayout>
);
}