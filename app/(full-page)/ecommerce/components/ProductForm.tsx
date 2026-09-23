'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import {
    EcommerceCategory,
    EcommerceProduct,
    EcommerceVariant,
    ApiErrorResponse
} from '@/types/ecommerce';
import { parseCurrency } from '@/services/ecommerce/ecommerceUtils';
import { ProductVariantManager } from './ProductVariantManager';
import { ProductImageManager, PendingImage } from './ProductImageManager';

interface ProductFormProps {
    initialData?: Partial<EcommerceProduct>;
    /** Numeric product ID — present in edit mode, undefined in create mode */
    productId?: string | number;
    isEdit?: boolean;
    categories: EcommerceCategory[];
    loadingCategories?: boolean;
    onSubmit: (payload: Partial<EcommerceProduct>) => Promise<void>;
    submitting?: boolean;
    serverError?: ApiErrorResponse | null;
    /** Called when pending images change in create mode so the parent can upload them after save */
    onPendingImagesChange?: (pending: PendingImage[]) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    productId,
    isEdit = false,
    categories,
    loadingCategories = false,
    onSubmit,
    submitting = false,
    serverError = null,
    onPendingImagesChange
}) => {
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | string>('');
    const [description, setDescription] = useState('');
    const [material, setMaterial] = useState('');
    const [basePrice, setBasePrice] = useState<number | null>(null);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [variants, setVariants] = useState<EcommerceVariant[]>([]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-populate data on edit or when initialData changes
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setCategoryId(initialData.category_id || initialData.category?.id || '');
            setDescription(initialData.description || '');
            setMaterial(initialData.material || '');
            const initialPrice = initialData.base_price !== undefined
                ? initialData.base_price
                : initialData.price !== undefined
                ? initialData.price
                : null;
            setBasePrice(initialPrice !== null && initialPrice !== undefined ? parseCurrency(initialPrice) : null);
            setIsActive(
                initialData.is_active === undefined
                    ? true
                    : Boolean(initialData.is_active === 1 || initialData.is_active === true)
            );
            if (Array.isArray(initialData.variants)) {
                setVariants(initialData.variants);
            }
        }
    }, [initialData]);

    // Populate server validation errors
    useEffect(() => {
        if (serverError?.errors) {
            const mapped: Record<string, string> = {};
            Object.entries(serverError.errors).forEach(([field, msgs]) => {
                if (Array.isArray(msgs) && msgs.length > 0) {
                    mapped[field] = msgs[0];
                    if (field === 'base_price') {
                        mapped['price'] = msgs[0];
                    }
                }
            });
            setErrors((prev) => ({ ...prev, ...mapped }));
        }
    }, [serverError]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = 'Nama produk wajib diisi.';
        }
        if (!categoryId) {
            newErrors.category_id = 'Kategori produk wajib dipilih.';
        }
        if (basePrice === undefined || basePrice === null || isNaN(Number(basePrice)) || Number(basePrice) < 0) {
            newErrors.base_price = 'Harga dasar wajib diisi dan tidak boleh bernilai negatif.';
            newErrors.price = 'Harga dasar wajib diisi dan tidak boleh bernilai negatif.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Validasi Formulir',
                detail: 'Harap lengkapi field yang diperlukan dengan benar.',
                life: 3000
            });
            return;
        }

        // Safely parse numeric price — ensure it's always a valid number for the API
        const numericBasePrice = parseCurrency(basePrice);

        const payload: Partial<EcommerceProduct> = {
            name: name.trim(),
            category_id: Number(categoryId) || categoryId,
            description: description.trim(),
            material: material.trim(),
            base_price: numericBasePrice,
            is_active: isActive ? 1 : 0,
            variants: variants
        };

        await onSubmit(payload);
    };

    const categoryOptions = categories.map((c) => ({
        label: c.name,
        value: c.id
    }));

    return (
        <form onSubmit={handleSubmit} className="flex flex-column gap-4">
            <Toast ref={toast} />

            {serverError && (
                <Message
                    severity="error"
                    text={serverError.message || 'Terjadi kesalahan pada server.'}
                    className="w-full justify-content-start"
                />
            )}

            {/* Basic Info Card */}
            <div className="surface-card p-4 border-round shadow-1 border-1 surface-border">
                <div className="border-bottom-1 surface-border pb-3 mb-4">
                    <h5 className="m-0 text-xl font-bold flex align-items-center gap-2">
                        <i className="pi pi-box text-primary"></i>
                        Informasi Utama Produk
                    </h5>
                    <p className="text-500 text-sm m-0 mt-1">
                        Masukkan nama, kategori, material, dan harga dasar produk ecommerce.
                    </p>
                </div>

                <div className="grid">
                    {/* Nama Produk */}
                    <div className="col-12 md:col-8 field mb-3">
                        <label htmlFor="product-name" className="font-semibold block mb-1">
                            Nama Produk <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="product-name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) {
                                    setErrors({ ...errors, name: '' });
                                }
                            }}
                            placeholder="Contoh: Manik Kaca Bulat Kerajinan"
                            className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                        />
                        {errors.name && <small className="p-error block mt-1">{errors.name}</small>}
                    </div>

                    {/* Kategori */}
                    <div className="col-12 md:col-4 field mb-3">
                        <label htmlFor="product-category" className="font-semibold block mb-1">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="product-category"
                            value={categoryId}
                            options={categoryOptions}
                            onChange={(e) => {
                                setCategoryId(e.value);
                                if (errors.category_id) {
                                    setErrors({ ...errors, category_id: '' });
                                }
                            }}
                            placeholder={loadingCategories ? 'Memuat kategori...' : 'Pilih Kategori'}
                            disabled={loadingCategories}
                            className={`w-full ${errors.category_id ? 'p-invalid' : ''}`}
                            filter
                            filterPlaceholder="Cari kategori..."
                        />
                        {errors.category_id && (
                            <small className="p-error block mt-1">{errors.category_id}</small>
                        )}
                    </div>

                    {/* Material */}
                    <div className="col-12 md:col-6 field mb-3">
                        <label htmlFor="product-material" className="font-semibold block mb-1">
                            Material / Bahan
                        </label>
                        <InputText
                            id="product-material"
                            value={material}
                            onChange={(e) => setMaterial(e.target.value)}
                            placeholder="Contoh: Kaca Sintesis, Akrilik, Tembaga"
                            className="w-full"
                        />
                    </div>

                    {/* Harga Dasar */}
                    <div className="col-12 md:col-6 field mb-3">
                        <label htmlFor="product-price" className="font-semibold block mb-1">
                            Harga Dasar (Rp) <span className="text-red-500">*</span>
                        </label>
                        <InputNumber
                            id="product-price"
                            value={basePrice}
                            onValueChange={(e) => {
                                setBasePrice(e.value ?? null);
                                if (errors.base_price || errors.price) {
                                    setErrors((prev) => ({ ...prev, base_price: '', price: '' }));
                                }
                            }}
                            onChange={(e) => {
                                if (e.value !== undefined) {
                                    setBasePrice(e.value ?? null);
                                    if (errors.base_price || errors.price) {
                                        setErrors((prev) => ({ ...prev, base_price: '', price: '' }));
                                    }
                                }
                            }}
                            mode="currency"
                            currency="IDR"
                            locale="id-ID"
                            min={0}
                            className={`w-full ${errors.base_price || errors.price ? 'p-invalid' : ''}`}
                            placeholder="Contoh: 15.000"
                        />
                        {(errors.base_price || errors.price) && (
                            <small className="p-error block mt-1">{errors.base_price || errors.price}</small>
                        )}
                        <small className="text-500 block mt-1">
                            Harga acuan atau harga terendah produk sebelum variasi dipilih.
                        </small>
                    </div>

                    {/* Deskripsi */}
                    <div className="col-12 field mb-3">
                        <label htmlFor="product-desc" className="font-semibold block mb-1">
                            Deskripsi Produk
                        </label>
                        <InputTextarea
                            id="product-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            autoResize
                            placeholder="Tuliskan deskripsi lengkap, dimensi, kegunaan kerajinan tangan, dan spesifikasi produk..."
                            className="w-full"
                        />
                    </div>

                    {/* Status Aktif */}
                    <div className="col-12 field mb-0">
                        <div className="flex align-items-center gap-3 p-3 surface-ground border-round">
                            <InputSwitch
                                inputId="product-active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.value ?? true)}
                            />
                            <div>
                                <label
                                    htmlFor="product-active"
                                    className="cursor-pointer font-bold block"
                                >
                                    Status Produk: {isActive ? 'Aktif (Tampil di Toko)' : 'Nonaktif (Disembunyikan)'}
                                </label>
                                <span className="text-sm text-500">
                                    {isActive
                                        ? 'Produk ini dapat dilihat dan dibeli oleh pelanggan di katalog web.'
                                        : 'Produk diarsipkan dan tidak akan muncul pada pencarian pelanggan.'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Manager Section */}
            <ProductImageManager
                productId={productId}
                onPendingChange={onPendingImagesChange}
            />

            {/* Variant Manager Section */}
            <ProductVariantManager
                variants={variants}
                onChange={setVariants}
                basePrice={basePrice ?? 0}
            />

            {/* Action Bar */}
            <div className="surface-card p-3 border-round shadow-1 border-1 surface-border flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
                <Button
                    type="button"
                    label="Kembali ke Daftar Produk"
                    icon="pi pi-arrow-left"
                    text
                    onClick={() => router.push('/ecommerce/products')}
                />
                <div className="flex gap-2 w-full sm:w-auto justify-content-end">
                    <Button
                        type="button"
                        label="Batal"
                        icon="pi pi-times"
                        className="p-button-secondary p-button-outlined"
                        onClick={() => router.push('/ecommerce/products')}
                        disabled={submitting}
                    />
                    <Button
                        type="submit"
                        label={
                            submitting
                                ? 'Menyimpan...'
                                : isEdit
                                ? 'Simpan Perubahan Produk'
                                : 'Simpan Produk Baru'
                        }
                        icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        disabled={submitting}
                    />
                </div>
            </div>
        </form>
    );
};
