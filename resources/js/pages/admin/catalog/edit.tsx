import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import ProductForm from './product-form';
import productsRoute from '@/routes/products';
import { useTranslate } from '@/lib/i18n';

interface Props {
    product: any;
    categories: any[];
}

export default function Edit({ product, categories }: Props) {
    const { __ } = useTranslate();

    const breadcrumbs = [
        { title: __('Catalogue'), href: productsRoute.index().url },
        { title: __('Edit'), href: '#' }
    ];

    // Priorité à la langue actuelle ou repli sur fr/en
    const productName = product.name?.fr || product.name?.en || __('Product');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Remplacement de container par un padding latéral contrôlé */}
            <div className="flex flex-col gap-8 px-4 py-8 md:px-8 lg:px-12">
                <Heading 
                    title={__('Edit Product')} 
                    description={`${__('Editing')} : ${productName}`} 
                />
                
                <div className="w-full">
                    <ProductForm product={product} categories={categories} />
                </div>
            </div>
        </AppLayout>
    );
}