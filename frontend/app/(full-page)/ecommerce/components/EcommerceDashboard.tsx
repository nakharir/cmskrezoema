'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { EcommerceCategory, EcommerceProduct, ApiErrorResponse } from '@/types/ecommerce';
import { ecommerceService, parseApiError } from '@/services/ecommerce/ecommerceApi';
import { formatCurrency, getStockStatus } from '@/services/ecommerce/ecommerceUtils';

interface StockAlertItem {
    productId: string | number;
    productName: string;
    variantName: string;
    sku: string;
    stock: number;
}

interface EcommerceDashboardProps {
    roleTitle?: string;
}

export default function EcommerceDashboard({ roleTitle }: EcommerceDashboardProps) {
    const router = useRouter();

    const [products, setProducts] = useState<EcommerceProduct[]>([]);
    const [categories, setCategories] = useState<EcommerceCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiErrorResponse | null>(null);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsRes, categoriesRes] = await Promise.allSettled([
                ecommerceService.getProducts(),
                ecommerceService.getCategories()
            ]);

            let loadedProducts: EcommerceProduct[] = [];
            let loadedCategories: EcommerceCategory[] = [];
            let errorMsg = '';

            if (productsRes.status === 'fulfilled') {
                loadedProducts = productsRes.value;
                setProducts(loadedProducts);
            } else {
                errorMsg += `Produk: ${parseApiError(productsRes.reason).message} `;
            }

            if (categoriesRes.status === 'fulfilled') {
                loadedCategories = categoriesRes.value;
                setCategories(loadedCategories);
            } else {
                errorMsg += `Kategori: ${parseApiError(categoriesRes.reason).message} `;
            }

            if (productsRes.status === 'rejected' && categoriesRes.status === 'rejected') {
                setError({ message: errorMsg });
            }
        } catch (err: any) {
            setError(parseApiError(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Statistics calculations from verified data
    const totalProducts = products.length;
    const activeProducts = products.filter(
        (p) => p.is_active === 1 || p.is_active === true
    ).length;
    const totalCategories = categories.length;

    // Collect low stock / out of stock items
    const stockAlerts: StockAlertItem[] = [];
    products.forEach((p) => {
        if (Array.isArray(p.variants) && p.variants.length > 0) {
            p.variants.forEach((v) => {
                const s = Number(v.stock) || 0;
                if (s <= 5) {
                    stockAlerts.push({
                        productId: p.id,
                        productName: p.name,
                        variantName: v.name,
                        sku: v.sku,
                        stock: s
                    });
                }
            });
        }
    });

    const outOfStockCount = stockAlerts.filter((i) => i.stock === 0).length;
    const criticalStockCount = stockAlerts.filter((i) => i.stock > 0 && i.stock <= 5).length;

    return (
        <div className="grid">
            {/* Header */}
            <div className="col-12">
                <div
                    className="card mb-4 flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-3"
                    style={{ borderLeft: '4px solid #D96C91' }}
                >
                    <div>
                        <div className="flex align-items-center gap-2 mb-1">
                            <h1 className="text-2xl sm:text-3xl font-bold m-0" style={{ color: '#272329' }}>
                                Dashboard KREZOEMA
                            </h1>
                            {roleTitle && (
                                <span
                                    className="text-xs font-semibold px-2 py-1 border-round uppercase tracking-wider"
                                    style={{ backgroundColor: '#F8E4EB', color: '#B94F76' }}
                                >
                                    {roleTitle}
                                </span>
                            )}
                        </div>
                        <p className="text-600 text-sm m-0">
                            Creative Craft &amp; Handmade Accessories — Kelola katalog produk kerajinan, kategori, dan monitoring stok barang.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            label="Muat Ulang"
                            icon="pi pi-refresh"
                            outlined
                            size="small"
                            onClick={loadDashboardData}
                            disabled={loading}
                            style={{ borderColor: '#D96C91', color: '#D96C91' }}
                        />
                        <Button
                            label="Tambah Produk"
                            icon="pi pi-plus"
                            size="small"
                            onClick={() => router.push('/ecommerce/products/create')}
                            style={{ backgroundColor: '#D96C91', borderColor: '#D96C91' }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4">
                        <Message
                            severity="error"
                            text={`Gagal memuat data ecommerce: ${error.message}`}
                            className="w-full justify-content-start"
                        />
                        <div className="mt-2">
                            <Button
                                label="Coba Lagi"
                                icon="pi pi-refresh"
                                size="small"
                                severity="danger"
                                outlined
                                onClick={loadDashboardData}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 5 Stat Cards */}
            {/* Total Produk */}
            <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
                <div className="card mb-0 shadow-1 surface-card hover:shadow-2 transition-all transition-duration-200">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-1 text-sm">Total Produk</span>
                            <div className="text-900 font-bold text-2xl">
                                {loading ? '-' : totalProducts}
                            </div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center border-round"
                            style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#F8E4EB' }}
                        >
                            <i className="pi pi-box text-xl" style={{ color: '#D96C91' }} />
                        </div>
                    </div>
                    <span
                        className="font-medium cursor-pointer text-xs"
                        style={{ color: '#D96C91' }}
                        onClick={() => router.push('/ecommerce/products')}
                    >
                        Lihat produk <i className="pi pi-arrow-right text-xs"></i>
                    </span>
                </div>
            </div>

            {/* Produk Aktif */}
            <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
                <div className="card mb-0 shadow-1 surface-card hover:shadow-2 transition-all transition-duration-200">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-1 text-sm">Produk Aktif</span>
                            <div className="text-900 font-bold text-2xl">
                                {loading ? '-' : activeProducts}
                            </div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-green-100 border-round"
                            style={{ width: '2.5rem', height: '2.5rem' }}
                        >
                            <i className="pi pi-check-circle text-green-600 text-xl" />
                        </div>
                    </div>
                    <span className="text-500 text-xs">
                        {totalProducts > 0
                            ? `${Math.round((activeProducts / totalProducts) * 100)}% tayang di katalog`
                            : 'Katalog kosong'}
                    </span>
                </div>
            </div>

            {/* Total Kategori */}
            <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
                <div className="card mb-0 shadow-1 surface-card hover:shadow-2 transition-all transition-duration-200">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-1 text-sm">Total Kategori</span>
                            <div className="text-900 font-bold text-2xl">
                                {loading ? '-' : totalCategories}
                            </div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-cyan-100 border-round"
                            style={{ width: '2.5rem', height: '2.5rem' }}
                        >
                            <i className="pi pi-tags text-cyan-600 text-xl" />
                        </div>
                    </div>
                    <span
                        className="text-cyan-600 font-medium cursor-pointer text-xs"
                        onClick={() => router.push('/ecommerce/categories')}
                    >
                        Kelola kategori <i className="pi pi-arrow-right text-xs"></i>
                    </span>
                </div>
            </div>

            {/* Stok Habis */}
            <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
                <div className="card mb-0 shadow-1 surface-card hover:shadow-2 transition-all transition-duration-200">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-1 text-sm">Stok Habis</span>
                            <div className="text-900 font-bold text-2xl" style={{ color: outOfStockCount > 0 ? '#ef4444' : '#272329' }}>
                                {loading ? '-' : outOfStockCount}
                            </div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-red-100 border-round"
                            style={{ width: '2.5rem', height: '2.5rem' }}
                        >
                            <i className="pi pi-times-circle text-red-600 text-xl" />
                        </div>
                    </div>
                    <span className={`text-xs ${outOfStockCount > 0 ? 'text-red-500 font-bold' : 'text-500'}`}>
                        {outOfStockCount > 0 ? `${outOfStockCount} varian habis` : 'Tidak ada stok habis'}
                    </span>
                </div>
            </div>

            {/* Stok Kritis */}
            <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
                <div className="card mb-0 shadow-1 surface-card hover:shadow-2 transition-all transition-duration-200">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-1 text-sm">Stok Kritis</span>
                            <div className="text-900 font-bold text-2xl" style={{ color: criticalStockCount > 0 ? '#f59e0b' : '#272329' }}>
                                {loading ? '-' : criticalStockCount}
                            </div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center bg-orange-100 border-round"
                            style={{ width: '2.5rem', height: '2.5rem' }}
                        >
                            <i className="pi pi-exclamation-triangle text-orange-600 text-xl" />
                        </div>
                    </div>
                    <span className={`text-xs ${criticalStockCount > 0 ? 'text-orange-500 font-bold' : 'text-500'}`}>
                        {criticalStockCount > 0 ? `${criticalStockCount} varian <= 5 unit` : 'Semua stok aman'}
                    </span>
                </div>
            </div>

            {/* Pesanan */}
            <div className="col-12 sm:col-6 lg:col-4 xl:col-2">
                <div className="card mb-0 shadow-1 surface-card hover:shadow-2 transition-all transition-duration-200">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-1 text-sm">Pesanan</span>
                            <div className="text-700 font-bold text-base mt-1">
                                Segera Hadir
                            </div>
                        </div>
                        <div
                            className="flex align-items-center justify-content-center surface-100 border-round"
                            style={{ width: '2.5rem', height: '2.5rem' }}
                        >
                            <i className="pi pi-shopping-bag text-500 text-xl" />
                        </div>
                    </div>
                    <span className="text-500 text-xs">
                        Modul belum aktif
                    </span>
                </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="col-12 mt-2">
                <div className="card p-4">
                    <h5 className="text-base font-bold mb-3 flex align-items-center gap-2" style={{ color: '#272329' }}>
                        <i className="pi pi-bolt" style={{ color: '#D96C91' }}></i>
                        Akses Cepat Pengelolaan Katalog KREZOEMA
                    </h5>
                    <div className="grid">
                        <div className="col-12 sm:col-4">
                            <div
                                onClick={() => router.push('/ecommerce/products/create')}
                                className="p-3 border-round border-1 surface-border surface-hover cursor-pointer transition-all flex align-items-center gap-3"
                            >
                                <i className="pi pi-plus-circle text-3xl" style={{ color: '#D96C91' }}></i>
                                <div>
                                    <span className="font-bold block text-900">Tambah Produk Baru</span>
                                    <small className="text-500">Input aksesoris, harga, material &amp; varian</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 sm:col-4">
                            <div
                                onClick={() => router.push('/ecommerce/products')}
                                className="p-3 border-round border-1 surface-border surface-hover cursor-pointer transition-all flex align-items-center gap-3"
                            >
                                <i className="pi pi-list text-blue-500 text-3xl"></i>
                                <div>
                                    <span className="font-bold block text-900">Katalog Produk</span>
                                    <small className="text-500">Cari, perbarui stok, dan atur ketersediaan</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 sm:col-4">
                            <div
                                onClick={() => router.push('/ecommerce/categories')}
                                className="p-3 border-round border-1 surface-border surface-hover cursor-pointer transition-all flex align-items-center gap-3"
                            >
                                <i className="pi pi-tags text-cyan-500 text-3xl"></i>
                                <div>
                                    <span className="font-bold block text-900">Kategori Aksesoris</span>
                                    <small className="text-500">Manik, akrilik, mutiara, tali &amp; alat craft</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aktivitas Produk: Recent Products Table */}
            <div className="col-12 lg:col-7">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5 className="text-base font-bold m-0 flex align-items-center gap-2" style={{ color: '#272329' }}>
                            <i className="pi pi-box" style={{ color: '#D96C91' }}></i>
                            Aktivitas Produk Terbaru
                        </h5>
                        <Button
                            label="Lihat Semua"
                            icon="pi pi-arrow-right"
                            text
                            size="small"
                            onClick={() => router.push('/ecommerce/products')}
                            style={{ color: '#D96C91' }}
                        />
                    </div>

                    <DataTable
                        value={products.slice(0, 5)}
                        loading={loading}
                        responsiveLayout="scroll"
                        className="p-datatable-sm"
                        emptyMessage={
                            loading ? (
                                <div className="text-center p-3">
                                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                                </div>
                            ) : (
                                'Belum ada produk yang terdaftar.'
                            )
                        }
                    >
                        <Column
                            field="name"
                            header="Nama Produk"
                            body={(row: EcommerceProduct) => (
                                <div>
                                    <div className="font-medium text-900">{row.name}</div>
                                    <small className="text-500">{row.material || 'Material umum'}</small>
                                </div>
                            )}
                        />
                        <Column
                            field="price"
                            header="Harga"
                            body={(row: EcommerceProduct) => (
                                <span className="font-bold">{formatCurrency(row.price)}</span>
                            )}
                        />
                        <Column
                            field="is_active"
                            header="Status"
                            body={(row: EcommerceProduct) => {
                                const active = row.is_active === 1 || row.is_active === true;
                                return (
                                    <Tag
                                        value={active ? 'Aktif' : 'Nonaktif'}
                                        severity={active ? 'success' : 'danger'}
                                    />
                                );
                            }}
                        />
                        <Column
                            header="Aksi"
                            body={(row: EcommerceProduct) => (
                                <Button
                                    icon="pi pi-pencil"
                                    size="small"
                                    rounded
                                    text
                                    tooltip="Edit"
                                    onClick={() => router.push(`/ecommerce/products/${row.id}/edit`)}
                                    style={{ color: '#D96C91' }}
                                />
                            )}
                        />
                    </DataTable>
                </div>
            </div>

            {/* Aktivitas Produk: Stock Alerts Table */}
            <div className="col-12 lg:col-5">
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5 className="text-base font-bold m-0 flex align-items-center gap-2 text-red-600">
                            <i className="pi pi-exclamation-triangle"></i>
                            Peringatan Stok Rendah &amp; Habis
                        </h5>
                        <Tag
                            value={`${stockAlerts.length} varian`}
                            severity={stockAlerts.length > 0 ? 'warning' : 'success'}
                        />
                    </div>

                    <DataTable
                        value={stockAlerts.slice(0, 5)}
                        loading={loading}
                        responsiveLayout="scroll"
                        className="p-datatable-sm"
                        emptyMessage={
                            loading ? (
                                <div className="text-center p-3">
                                    <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                                </div>
                            ) : (
                                <div className="text-center p-3 text-500">
                                    <i className="pi pi-check text-green-500 mr-2"></i>
                                    Semua varian produk memiliki stok aman.
                                </div>
                            )
                        }
                    >
                        <Column
                            field="variantName"
                            header="Varian"
                            body={(row: StockAlertItem) => (
                                <div>
                                    <div className="font-medium text-900">{row.variantName}</div>
                                    <code className="text-xs text-500">{row.sku}</code>
                                </div>
                            )}
                        />
                        <Column
                            field="stock"
                            header="Stok"
                            body={(row: StockAlertItem) => {
                                const st = getStockStatus(row.stock);
                                return (
                                    <Tag
                                        value={`${row.stock} (${st.label})`}
                                        severity={st.severity}
                                        icon={st.icon}
                                    />
                                );
                            }}
                        />
                        <Column
                            header=""
                            body={(row: StockAlertItem) => (
                                <Button
                                    icon="pi pi-external-link"
                                    size="small"
                                    text
                                    rounded
                                    tooltip="Kelola Produk"
                                    onClick={() => router.push(`/ecommerce/products/${row.productId}/edit`)}
                                    style={{ color: '#D96C91' }}
                                />
                            )}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
