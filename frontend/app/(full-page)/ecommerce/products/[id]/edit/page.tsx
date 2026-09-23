'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { ProductForm } from '@/app/(full-page)/ecommerce/components/ProductForm';
import { EcommerceCategory, EcommerceProduct, ApiErrorResponse } from '@/types/ecommerce';
import { ecommerceService, parseApiError } from '@/services/ecommerce/ecommerceApi';

interface EditProductPageProps {
    params: {
        id: string;
    };
}

export default function EditProductPage({ params }: EditProductPageProps) {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const productId = params.id;

    const [product, setProduct] = useState<EcommerceProduct | null>(null);
    const [categories, setCategories] = useState<EcommerceCategory[]>([]);
    const [loadingProduct, setLoadingProduct] = useState<boolean>(true);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [loadError, setLoadError] = useState<ApiErrorResponse | null>(null);
    const [serverError, setServerError] = useState<ApiErrorResponse | null>(null);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const data = await ecommerceService.getCategories();
                setCategories(data);
            } catch (err) {
                console.warn('Gagal memuat kategori:', err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch product details via admin endpoint (supports inactive products + returns images)
    const loadProductData = useCallback(async () => {
        setLoadingProduct(true);
        setLoadError(null);
        try {
            // Use admin endpoint so inactive products can also be edited, and images are included
            const data = await ecommerceService.getAdminProduct(productId);
            if (data && (data.id || data.name)) {
                setProduct(data);
                return;
            }
            throw new Error('Data produk tidak ditemukan.');
        } catch (err: any) {
            const parsed = parseApiError(err);
            setLoadError(parsed);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal Memuat Produk',
                detail: parsed.message,
                life: 5000
            });
        } finally {
            setLoadingProduct(false);
        }
    }, [productId]);

    useEffect(() => {
        loadProductData();
    }, [loadProductData]);

    const handleSubmit = async (payload: Partial<EcommerceProduct>) => {
        setSubmitting(true);
        setServerError(null);
        try {
            await ecommerceService.updateProduct(productId, payload);
            toast.current?.show({
                severity: 'success',
                summary: 'Berhasil Diperbarui',
                detail: `Perubahan produk "${payload.name}" berhasil disimpan!`,
                life: 3000
            });
            setTimeout(() => {
                router.push('/ecommerce/products');
            }, 1200);
        } catch (err: any) {
            const parsed = parseApiError(err);
            setServerError(parsed);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal Menyimpan Perubahan',
                detail: parsed.message,
                life: 5000
            });
        } finally {
            setSubmitting(false);
        }
    };

    const breadcrumbHome = { icon: 'pi pi-home', url: '/ecommerce' };
    const breadcrumbItems = [
        { label: 'Produk', url: '/ecommerce/products' },
        { label: `Edit: ${product?.name || `ID #${productId}`}` }
    ];

    if (loadingProduct) {
        return (
            <div className="card flex flex-column align-items-center justify-content-center p-6">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                <span className="mt-3 text-700 font-medium">Memuat detail produk...</span>
            </div>
        );
    }

    if (loadError && !product) {
        return (
            <div className="card">
                <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="mb-3 border-none p-0 bg-transparent" />
                <Message
                    severity="error"
                    text={`Tidak dapat memuat produk: ${loadError.message}`}
                    className="w-full mb-3"
                />
                <div className="flex gap-2">
                    <Button
                        label="Coba Lagi"
                        icon="pi pi-refresh"
                        onClick={loadProductData}
                    />
                    <Button
                        label="Kembali ke Daftar Produk"
                        icon="pi pi-arrow-left"
                        severity="secondary"
                        outlined
                        onClick={() => router.push('/ecommerce/products')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="mb-3 border-none p-0 bg-transparent" />

                <div className="mb-4">
                    <h2 className="text-2xl font-bold m-0 flex align-items-center gap-2">
                        <i className="pi pi-file-edit text-primary"></i>
                        Edit Produk: {product?.name}
                    </h2>
                    <span className="text-500 text-sm">
                        ID Produk: #{productId} • Perbarui informasi, harga dasar, ketersediaan, gambar, dan variasi produk.
                    </span>
                </div>

                <ProductForm
                    initialData={product ?? undefined}
                    productId={productId}
                    isEdit={true}
                    categories={categories}
                    loadingCategories={loadingCategories}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    serverError={serverError}
                />
            </div>
        </div>
    );
}
