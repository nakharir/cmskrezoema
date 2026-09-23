import { Metadata } from 'next';
import AppConfig from '../../layout/AppConfig';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

// Metadata halaman KREZOEMA
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: 'KREZOEMA — Admin',
    description: 'KREZOEMA CMS — Creative Craft & Handmade Accessories',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'KREZOEMA — Admin Dashboard',
        description: 'KREZOEMA CMS — Creative Craft & Handmade Accessories',
        images: ['/logo-krezoema.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logo-krezoema.png'
    }
};

export default function SimpleLayout({ children }: SimpleLayoutProps) {
    return (
        <React.Fragment>
            {children}
            {/* Sidebar konfigurasi (disederhanakan karena properti simple={true}) */}
            <AppConfig simple />
        </React.Fragment>
    );
}
