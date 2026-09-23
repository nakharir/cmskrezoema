// import { Metadata } from 'next';
// import AppConfig from '../../layout/AppConfig';
// import React from 'react';

// interface SimpleLayoutProps {
//     children: React.ReactNode;
// }

// export const metadata: Metadata = {
//     title: 'SDN 01 Manguharjo',
//     description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.'
// };

// export default function SimpleLayout({ children }: SimpleLayoutProps) {
//     return (
//         <React.Fragment>
//             {children}
//             <AppConfig simple />
//         </React.Fragment>
//     );
// }

import { Metadata } from 'next';
import AppConfig from '../../layout/AppConfig';
import React from 'react';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

// Metadata halaman, termasuk favicon/logo browser
export const metadata: Metadata = {

    title: 'SDN 01 Manguharjo',

   
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'PrimeReact SAKAI-REACT',
        url: 'https://sakai.primereact.org/',
        description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
        images: ['/demo/images/logo/logosd.png'],
        ttl: 604800
    },
    icons: {
        icon: '/logosd.png'
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

