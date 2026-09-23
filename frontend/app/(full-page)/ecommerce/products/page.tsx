'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import {
    EcommerceCategory,
    EcommerceProduct,
    ApiErrorResponse
} from '@/types/ecommerce';
import { ecommerceService, parseApiError } from '@/services/ecommerce/ecommerceApi';
import { formatCurrency } from '@/services/ecommerce/ecommerceUtils';

export default function EcommerceProductsPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [products, setProducts] = useState<EcommerceProduct[]>([]);
    const [categories, setCategories] = useState<EcommerceCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiErrorResponse | null>(null);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<number | string | null>(null);

    // Fetch categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await ecommerceService.getCategories();
                setCategories(data);
            } catch (err) {
                console.warn('Gagal memuat kategori:', err);
            }
        };
        loadCategories();
    }, []);

    // Fetch products
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: any = {};
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            if (selectedCategory !== null && selectedCategory !== '') {
                params.category_id = selectedCategory;
            }

            const data = await ecommerceService.getProducts(params);
            setProducts(data);
        } catch (err: any) {
            const parsed = parseApiError(err);
            setError(parsed);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal Memuat Produk',
                detail: parsed.message,
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    // Initial load
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Search submit handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    // Reset filter
    const handleResetFilter = () => {
        setSearchQuery('');
        setSelectedCategory(null);
    };

    // Confirm and Delete product
    const confirmDeleteProduct = (product: EcommerceProduct) => {
        confirmDialog({
            message: `Apakah Anda yakin ingin menghapus produk "${product.name}"?`,
            header: 'Konfirmasi Penghapusan Produk',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Ya, Hapus',
            rejectLabel: 'Batal',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await ecommerceService.deleteProduct(product.id);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Berhasil',
                        detail: `Produk "${product.name}" berhasil dihapus.`,
                        life: 3000
                    });
                    loadProducts();
                } catch (err: any) {
                    const parsed = parseApiError(err);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Gagal Menghapus',
                        detail: parsed.message,
                        life: 5000
                    });
                }
            }
        });
    };

    // Column templates
    const nameBodyTemplate = (rowData: EcommerceProduct) => {
        return (
            <div>
                <div className="font-semibold text-900">{rowData.name}</div>
                {rowData.slug && (
                    <span className="text-xs text-500 font-mono">/{rowData.slug}</span>
                )}
            </div>
        );
    };

    const categoryBodyTemplate = (rowData: EcommerceProduct) => {
        const catName =
            rowData.category?.name ||
            categories.find((c) => String(c.id) === String(rowData.category_id))?.name;

        return catName ? (
            <span className="inline-flex align-items-center px-2 py-1 bg-primary-50 text-primary-900 border-round text-xs font-medium">
                <i className="pi pi-tag mr-1 text-xs"></i>
                {catName}
            </span>
        ) : (
            <span className="text-400 italic text-sm">Tidak ada</span>
        );
    };

    const materialBodyTemplate = (rowData: EcommerceProduct) => {
        return rowData.material ? (
            <span className="text-700 text-sm">{rowData.material}</span>
        ) : (
            <span className="text-400 italic text-xs">-</span>
        );
    };

    const priceBodyTemplate = (rowData: EcommerceProduct) => {
        return (
            <span className="font-bold text-900">
                {formatCurrency(rowData.base_price ?? rowData.price ?? 0)}
            </span>
        );
    };

    const statusBodyTemplate = (rowData: EcommerceProduct) => {
        const active = rowData.is_active === 1 || rowData.is_active === true;
        return (
            <Tag
                value={active ? 'Aktif' : 'Nonaktif'}
                severity={active ? 'success' : 'danger'}
            />
        );
    };

    const variantCountBodyTemplate = (rowData: EcommerceProduct) => {
        const count =
            Array.isArray(rowData.variants)
                ? rowData.variants.length
                : rowData.variants_count ?? '-';

        return (
            <div className="flex align-items-center gap-1">
                <i className="pi pi-sitemap text-500 text-xs"></i>
                <span className="font-medium text-sm">{count}</span>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: EcommerceProduct) => {
        return (
            <div className="flex gap-2 justify-content-center">
                <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="info"
                    rounded
                    text
                    tooltip="Edit Produk"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => router.push(`/ecommerce/products/${rowData.id}/edit`)}
                />
                <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    rounded
                    text
                    tooltip="Hapus Produk"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => confirmDeleteProduct(rowData)}
                />
            </div>
        );
    };

    const categoryOptions = [
        { label: 'Semua Kategori', value: '' },
        ...categories.map((c) => ({ label: c.name, value: c.id }))
    ];

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="col-12">
                <div className="card">
                    {/* Header title & Add button */}
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-4 gap-3">
                        <div>
                            <h2 className="text-2xl font-bold m-0 flex align-items-center gap-2">
                                <i className="pi pi-box text-primary"></i>
                                Manajemen Produk Ecommerce
                            </h2>
                            <span className="text-500 text-sm">
                                Kelola katalog produk kerajinan, harga, variasi, dan ketersediaan toko KREZOEMA.
                            </span>
                        </div>
                        <Button
                            label="Tambah Produk"
                            icon="pi pi-plus"
                            onClick={() => router.push('/ecommerce/products/create')}
                        />
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="surface-ground p-3 border-round mb-4 border-1 surface-border">
                        <form onSubmit={handleSearch} className="grid align-items-center">
                            <div className="col-12 md:col-5">
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama produk, material..."
                                        className="w-full"
                                    />
                                </span>
                            </div>
                            <div className="col-12 md:col-4">
                                <Dropdown
                                    value={selectedCategory}
                                    options={categoryOptions}
                                    onChange={(e) => setSelectedCategory(e.value)}
                                    placeholder="Filter Berdasarkan Kategori"
                                    className="w-full"
                                    showClear
                                />
                            </div>
                            <div className="col-12 md:col-3 flex gap-2 justify-content-end">
                                <Button
                                    type="submit"
                                    label="Terapkan"
                                    icon="pi pi-filter"
                                    size="small"
                                />
                                {(searchQuery || selectedCategory) && (
                                    <Button
                                        type="button"
                                        label="Reset"
                                        icon="pi pi-refresh"
                                        size="small"
                                        severity="secondary"
                                        outlined
                                        onClick={handleResetFilter}
                                    />
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-4">
                            <Message
                                severity="error"
                                text={`Gagal memuat produk: ${error.message}`}
                                className="w-full justify-content-start"
                            />
                            <div className="mt-2">
                                <Button
                                    label="Coba Lagi"
                                    icon="pi pi-refresh"
                                    size="small"
                                    severity="danger"
                                    outlined
                                    onClick={loadProducts}
                                />
                            </div>
                        </div>
                    )}

                    {/* Table View */}
                    <DataTable
                        value={products}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        tableStyle={{ minWidth: '60rem' }}
                        emptyMessage={
                            loading ? (
                                <div className="flex flex-column align-items-center justify-content-center p-4">
                                    <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                                    <span className="mt-2 text-500">Memuat data produk...</span>
                                </div>
                            ) : (
                                <div className="text-center p-4 text-500">
                                    <i className="pi pi-inbox text-4xl block mb-2"></i>
                                    Tidak ada data produk yang ditemukan.
                                </div>
                            )
                        }
                        responsiveLayout="scroll"
                        stripedRows
                    >
                        <Column
                            header="No"
                            body={(_, opt) => opt.rowIndex + 1}
                            style={{ width: '4rem', textAlign: 'center' }}
                        />
                        <Column
                            field="name"
                            header="Nama Produk"
                            body={nameBodyTemplate}
                            sortable
                            style={{ minWidth: '16rem' }}
                        />
                        <Column
                            header="Kategori"
                            body={categoryBodyTemplate}
                            style={{ minWidth: '10rem' }}
                        />
                        <Column
                            field="material"
                            header="Material"
                            body={materialBodyTemplate}
                            style={{ minWidth: '10rem' }}
                        />
                        <Column
                            field="price"
                            header="Harga"
                            body={priceBodyTemplate}
                            sortable
                            style={{ minWidth: '10rem' }}
                        />
                        <Column
                            field="is_active"
                            header="Status"
                            body={statusBodyTemplate}
                            sortable
                            style={{ width: '8rem', textAlign: 'center' }}
                        />
                        <Column
                            header="Jml Variant"
                            body={variantCountBodyTemplate}
                            style={{ width: '8rem', textAlign: 'center' }}
                        />
                        <Column
                            header="Aksi"
                            body={actionBodyTemplate}
                            style={{ width: '8rem', textAlign: 'center' }}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
}
