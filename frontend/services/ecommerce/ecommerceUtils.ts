/**
 * Utility functions for Ecommerce CMS
 */

export const formatCurrency = (val: number | string | null | undefined): string => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

/**
 * Resolves a backend image URL into an absolute URL accessible by the browser.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
    }
    const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    // Remove /api suffix or trailing slash to get root origin
    const origin = rawBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${origin}${cleanPath}`;
};

/**
 * Parse currency string or number to clean integer / number
 * e.g. "Rp 2.000" -> 2000
 *      "Rp 1.250.000" -> 1250000
 *      "25.500" -> 25500
 *      2000 -> 2000
 */
export const parseCurrency = (val: number | string | null | undefined): number => {
    if (val === null || val === undefined) {
        return 0;
    }
    if (typeof val === 'number') {
        return isNaN(val) ? 0 : Math.max(0, Math.round(val));
    }
    const cleanStr = String(val).replace(/[^\d]/g, '');
    if (!cleanStr) {
        return 0;
    }
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
};

export type StockSeverity = 'success' | 'warning' | 'danger';

export interface StockBadgeInfo {
    label: string;
    severity: StockSeverity;
    icon: string;
}

export const getStockStatus = (stock: number | string | null | undefined): StockBadgeInfo => {
    const num = Number(stock) || 0;
    if (num <= 0) {
        return { label: 'Habis', severity: 'danger', icon: 'pi pi-times-circle' };
    }
    if (num <= 5) {
        return { label: 'Stok Rendah', severity: 'warning', icon: 'pi pi-exclamation-triangle' };
    }
    return { label: 'Tersedia', severity: 'success', icon: 'pi pi-check-circle' };
};
