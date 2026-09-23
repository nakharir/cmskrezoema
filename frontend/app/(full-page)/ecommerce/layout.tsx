import { Metadata } from 'next';
import Layout from '../../../layout/layout';

interface EcommerceLayoutProps {
    children: React.ReactNode;
}

export const metadata: Metadata = {
    title: 'KREZOEMA - CMS Ecommerce',
    description: 'Manajemen Ecommerce KREZOEMA'
};

export default function EcommerceLayout({ children }: EcommerceLayoutProps) {
    return <Layout>{children}</Layout>;
}
