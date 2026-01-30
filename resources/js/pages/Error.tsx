import React from 'react';
import { Head, Link } from '@inertiajs/react';

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status];

    const description = {
        503: 'Désolé, nous sommes en maintenance. Revenez bientôt !',
        500: 'Oups, une erreur interne est survenue sur nos serveurs.',
        404: 'Désolé, la page ou le produit que vous cherchez n\'existe pas.',
        403: 'Vous n\'avez pas l\'autorisation d\'accéder à cette page.',
    }[status];

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
            <Head title={title} />
            <div className="text-center p-8 bg-white shadow-xl rounded-lg">
                <h1 className="text-6xl font-bold text-indigo-600">{status}</h1>
                <p className="text-2xl font-medium mt-4">{title}</p>
                <p className="mt-2 text-gray-500">{description}</p>
                <div className="mt-6">
                    <Link 
                        href="/" 
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}