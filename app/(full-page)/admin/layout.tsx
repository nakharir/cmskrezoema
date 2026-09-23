import { Metadata } from 'next';
import Layout from '../../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: 'KREZOEMA — Admin',
    description: 'KREZOEMA CMS — Creative Craft & Handmade Accessories',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'KREZOEMA — Admin',
        description: 'KREZOEMA CMS — Creative Craft & Handmade Accessories',
        images: ['/logo-krezoema.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logo-krezoema.png'
    }
};

export default function AppLayout({ children }: AppLayoutProps) {
    return <Layout>{children}</Layout>;
}
