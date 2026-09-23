'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { BreadCrumb } from 'primereact/breadcrumb';
import { ProductForm } from '@/app/(full-page)/ecommerce/components/ProductForm';
import { PendingImage } from '@/app/(full-page)/ecommerce/components/ProductImageManager';
import { EcommerceCategory, EcommerceProduct, ApiErrorResponse } from '@/types/ecommerce';
import { ecommerceService, parseApiError } from '@/services/ecommerce/ecommerceApi';

export default function CreateProductPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [categories, setCategories] = useState<EcommerceCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [serverError, setServerError] = useState<ApiErrorResponse | null>(null);

    // Pending images from ProductImageManager (create mode)
    const pendingImagesRef = useRef<PendingImage[]>([]);

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

    const handleSubmit = async (payload: Partial<EcommerceProduct>) => {
        setSubmitting(true);
        setServerError(null);
        try {
            // 1. Create the product
            const product = await ecommerceService.createProduct(payload);
            const productId = product.id;

            // 2. Upload pending images (best-effort: don't block redirect on failure)
            const pending = pendingImagesRef.current;
            if (pending.length > 0 && productId) {
                let uploadErrors = 0;
                for (const img of pending) {
                    try {
                        await ecommerceService.uploadProductImage(
                            productId,
                            img.file,
                            img.altText,
                            img.isPrimary
                        );
                    } catch (imgErr) {
                        uploadErrors++;
                        console.warn('Gagal upload gambar:', imgErr);
                    }
                }

                if (uploadErrors > 0) {
                    toast.current?.show({
                        severity: 'warn',
                        summary: 'Produk Tersimpan',
                        detail: `Produk berhasil disimpan, tetapi ${uploadErrors} gambar gagal diunggah. Anda dapat menambahkan gambar dari halaman edit.`,
                        life: 6000
                    });
                } else {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Berhasil',
                        detail: `Produk berhasil disimpan dengan ${pending.length} gambar.`,
                        life: 3000
                    });
                }
            } else {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Produk ecommerce baru berhasil disimpan!',
                    life: 3000
                });
            }

            setTimeout(() => {
                router.push('/ecommerce/products');
            }, 1200);
        } catch (err: any) {
            const parsed = parseApiError(err);
            setServerError(parsed);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal Menyimpan Produk',
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
        { label: 'Tambah Produk Baru' }
    ];

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="mb-3 border-none p-0 bg-transparent" />

                <div className="mb-4">
                    <h2 className="text-2xl font-bold m-0 flex align-items-center gap-2">
                        <i className="pi pi-plus-circle text-primary"></i>
                        Tambah Produk Baru
                    </h2>
                    <span className="text-500 text-sm">
                        Lengkapi formulir di bawah ini untuk menambahkan produk kerajinan ke katalog KREZOEMA.
                    </span>
                </div>

                <ProductForm
                    categories={categories}
                    loadingCategories={loadingCategories}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    serverError={serverError}
                    onPendingImagesChange={(pending) => {
                        pendingImagesRef.current = pending;
                    }}
                />
            </div>
        </div>
    );
}
