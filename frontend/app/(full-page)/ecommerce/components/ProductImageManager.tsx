'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ProgressBar } from 'primereact/progressbar';
import { EcommerceProductImage } from '@/types/ecommerce';
import { ecommerceService, parseApiError } from '@/services/ecommerce/ecommerceApi';
import { resolveImageUrl } from '@/services/ecommerce/ecommerceUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingImage {
    /** Locally created object URL for preview */
    previewUrl: string;
    file: File;
    altText: string;
    isPrimary: boolean;
}

interface ProductImageManagerProps {
    /** productId is undefined when creating a new product — pending mode */
    productId?: string | number;
    /** Called in CREATE mode when pending images change so the parent can upload them after save */
    onPendingChange?: (pending: PendingImage[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return `Format tidak didukung: ${file.name}. Gunakan JPG, PNG, atau WEBP.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
        return `Ukuran file terlalu besar: ${file.name}. Maksimal 5 MB.`;
    }
    return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
    productId,
    onPendingChange
}) => {
    const toast = useRef<Toast>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── EDIT mode state ──
    const [existingImages, setExistingImages] = useState<EcommerceProductImage[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [settingPrimaryId, setSettingPrimaryId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);

    // ── CREATE mode state ──
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

    const isEditMode = productId !== undefined;

    // ── Load existing images (edit mode) ──────────────────────────────────────
    const loadImages = useCallback(async () => {
        if (!isEditMode) return;
        setLoadingImages(true);
        try {
            const images = await ecommerceService.getProductImages(productId!);
            setExistingImages(images);
        } catch (err) {
            const parsed = parseApiError(err);
            toast.current?.show({
                severity: 'warn',
                summary: 'Gagal Memuat Gambar',
                detail: parsed.message,
                life: 4000
            });
        } finally {
            setLoadingImages(false);
        }
    }, [isEditMode, productId]);

    useEffect(() => {
        if (isEditMode) loadImages();
    }, [isEditMode, loadImages]);

    // ── Notify parent when pending images change (create mode) ────────────────
    useEffect(() => {
        if (!isEditMode) {
            onPendingChange?.(pendingImages);
        }
    }, [pendingImages, isEditMode, onPendingChange]);

    // ── File picker handler ───────────────────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (fileInputRef.current) fileInputRef.current.value = '';

        for (const file of files) {
            const err = validateFile(file);
            if (err) {
                toast.current?.show({ severity: 'warn', summary: 'File Tidak Valid', detail: err, life: 5000 });
                continue;
            }

            if (isEditMode) {
                // EDIT mode: upload directly
                await uploadSingle(file);
            } else {
                // CREATE mode: add to pending list
                const previewUrl = URL.createObjectURL(file);
                setPendingImages((prev) => {
                    const isPrimary = prev.length === 0; // first image becomes primary
                    return [...prev, { file, previewUrl, altText: file.name.replace(/\.[^.]+$/, ''), isPrimary }];
                });
            }
        }
    };

    // ── Upload single image (edit mode) ───────────────────────────────────────
    const uploadSingle = async (file: File) => {
        setUploading(true);
        try {
            const isFirstImage = existingImages.length === 0;
            const uploaded = await ecommerceService.uploadProductImage(
                productId!,
                file,
                file.name.replace(/\.[^.]+$/, ''),
                isFirstImage
            );
            setExistingImages((prev) => {
                if (isFirstImage) return [{ ...uploaded, is_primary: true }];
                return [...prev, uploaded];
            });
            toast.current?.show({
                severity: 'success',
                summary: 'Gambar Diunggah',
                detail: 'Gambar produk berhasil diunggah.',
                life: 3000
            });
        } catch (err) {
            const parsed = parseApiError(err);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal Upload',
                detail: parsed.message,
                life: 5000
            });
        } finally {
            setUploading(false);
        }
    };

    // ── Delete image ──────────────────────────────────────────────────────────
    const handleDeleteExisting = async (image: EcommerceProductImage) => {
        if (!productId || deletingId !== null) return;
        setDeletingId(Number(image.id));
        try {
            await ecommerceService.deleteProductImage(productId, image.id);
            setExistingImages((prev) => {
                const remaining = prev.filter((img) => img.id !== image.id);
                // If deleted was primary, promote the first remaining
                if (image.is_primary && remaining.length > 0) {
                    remaining[0] = { ...remaining[0], is_primary: true };
                }
                return remaining;
            });
            toast.current?.show({
                severity: 'info',
                summary: 'Gambar Dihapus',
                detail: 'Gambar produk berhasil dihapus.',
                life: 3000
            });
        } catch (err) {
            const parsed = parseApiError(err);
            toast.current?.show({ severity: 'error', summary: 'Gagal Hapus', detail: parsed.message, life: 5000 });
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeletePending = (index: number) => {
        setPendingImages((prev) => {
            const next = prev.filter((_, i) => i !== index);
            // Revoke old object URL to free memory
            URL.revokeObjectURL(prev[index].previewUrl);
            // If removed was primary, promote first
            if (prev[index].isPrimary && next.length > 0) {
                next[0] = { ...next[0], isPrimary: true };
            }
            return next;
        });
    };

    // ── Set primary ───────────────────────────────────────────────────────────
    const handleSetPrimaryExisting = async (image: EcommerceProductImage) => {
        if (!productId || settingPrimaryId !== null || image.is_primary) return;
        setSettingPrimaryId(Number(image.id));
        try {
            await ecommerceService.setProductImagePrimary(productId, image.id);
            setExistingImages((prev) =>
                prev.map((img) => ({ ...img, is_primary: img.id === image.id }))
            );
            toast.current?.show({
                severity: 'success',
                summary: 'Gambar Utama',
                detail: 'Gambar ini sekarang menjadi gambar utama produk.',
                life: 3000
            });
        } catch (err) {
            const parsed = parseApiError(err);
            toast.current?.show({ severity: 'error', summary: 'Gagal', detail: parsed.message, life: 5000 });
        } finally {
            setSettingPrimaryId(null);
        }
    };

    const handleSetPrimaryPending = (index: number) => {
        setPendingImages((prev) =>
            prev.map((img, i) => ({ ...img, isPrimary: i === index }))
        );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border">
            <Toast ref={toast} />

            <div className="border-bottom-1 surface-border pb-3 mb-4">
                <h5 className="m-0 text-xl font-bold flex align-items-center gap-2">
                    <i className="pi pi-images text-primary"></i>
                    Gambar Produk
                </h5>
                <p className="text-500 text-sm m-0 mt-1">
                    Upload foto produk. Satu gambar akan ditandai sebagai gambar utama (primary).
                    Format: JPG, PNG, WEBP — maks. 5 MB per gambar.
                </p>
            </div>

            {/* Upload progress */}
            {uploading && (
                <div className="mb-3">
                    <ProgressBar mode="indeterminate" style={{ height: '4px' }} />
                    <small className="text-500 mt-1 block">Mengunggah gambar...</small>
                </div>
            )}

            {/* Loading existing images */}
            {isEditMode && loadingImages && (
                <div className="flex align-items-center gap-2 text-500 mb-3">
                    <i className="pi pi-spin pi-spinner"></i>
                    <span className="text-sm">Memuat gambar produk...</span>
                </div>
            )}

            {/* Image Grid */}
            <div className="flex flex-wrap gap-3 mb-3">
                {/* Existing images (edit mode) */}
                {isEditMode &&
                    existingImages.map((image) => (
                        <div
                            key={image.id}
                            className="relative border-round overflow-hidden"
                            style={{ width: '140px', height: '140px', border: image.is_primary ? '2px solid var(--primary-color)' : '2px solid var(--surface-border)' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resolveImageUrl(image.image_url)}
                                alt={image.alt_text || 'Product image'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/layout/images/placeholder-product.png';
                                }}
                            />

                            {/* Primary badge */}
                            {image.is_primary && (
                                <span
                                    className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1 border-round-br"
                                    style={{ fontSize: '10px', lineHeight: '1.2' }}
                                >
                                    <i className="pi pi-star-fill mr-1" style={{ fontSize: '9px' }}></i>
                                    Utama
                                </span>
                            )}

                            {/* Overlay actions */}
                            <div
                                className="absolute bottom-0 left-0 right-0 flex justify-content-center gap-1 p-1"
                                style={{ background: 'rgba(0,0,0,0.55)' }}
                            >
                                {!image.is_primary && (
                                    <Button
                                        icon="pi pi-star"
                                        rounded
                                        text
                                        severity="warning"
                                        size="small"
                                        tooltip="Jadikan utama"
                                        tooltipOptions={{ position: 'top' }}
                                        loading={settingPrimaryId === image.id}
                                        disabled={settingPrimaryId !== null || deletingId !== null}
                                        onClick={() => handleSetPrimaryExisting(image)}
                                        style={{ color: '#fff', width: '28px', height: '28px', padding: 0 }}
                                    />
                                )}
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    text
                                    severity="danger"
                                    size="small"
                                    tooltip="Hapus gambar"
                                    tooltipOptions={{ position: 'top' }}
                                    loading={deletingId === image.id}
                                    disabled={deletingId !== null || settingPrimaryId !== null}
                                    onClick={() => handleDeleteExisting(image)}
                                    style={{ color: '#fff', width: '28px', height: '28px', padding: 0 }}
                                />
                            </div>
                        </div>
                    ))}

                {/* Pending images (create mode) */}
                {!isEditMode &&
                    pendingImages.map((pending, index) => (
                        <div
                            key={pending.previewUrl}
                            className="relative border-round overflow-hidden"
                            style={{ width: '140px', height: '140px', border: pending.isPrimary ? '2px solid var(--primary-color)' : '2px solid var(--surface-border)' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={pending.previewUrl}
                                alt={pending.altText}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Primary badge */}
                            {pending.isPrimary && (
                                <span
                                    className="absolute top-0 left-0 bg-primary text-white text-xs px-2 py-1 border-round-br"
                                    style={{ fontSize: '10px', lineHeight: '1.2' }}
                                >
                                    <i className="pi pi-star-fill mr-1" style={{ fontSize: '9px' }}></i>
                                    Utama
                                </span>
                            )}

                            {/* Overlay actions */}
                            <div
                                className="absolute bottom-0 left-0 right-0 flex justify-content-center gap-1 p-1"
                                style={{ background: 'rgba(0,0,0,0.55)' }}
                            >
                                {!pending.isPrimary && (
                                    <Button
                                        icon="pi pi-star"
                                        rounded
                                        text
                                        severity="warning"
                                        size="small"
                                        tooltip="Jadikan utama"
                                        tooltipOptions={{ position: 'top' }}
                                        onClick={() => handleSetPrimaryPending(index)}
                                        style={{ color: '#fff', width: '28px', height: '28px', padding: 0 }}
                                    />
                                )}
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    text
                                    severity="danger"
                                    size="small"
                                    tooltip="Hapus gambar"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={() => handleDeletePending(index)}
                                    style={{ color: '#fff', width: '28px', height: '28px', padding: 0 }}
                                />
                            </div>
                        </div>
                    ))}

                {/* Upload button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex flex-column align-items-center justify-content-center gap-2 border-round cursor-pointer"
                    style={{
                        width: '140px',
                        height: '140px',
                        border: '2px dashed var(--surface-border)',
                        background: 'var(--surface-ground)',
                        color: 'var(--text-color-secondary)',
                        transition: 'border-color 0.2s, color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary-color)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--surface-border)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-color-secondary)';
                    }}
                >
                    <i className="pi pi-plus-circle text-2xl"></i>
                    <span className="text-xs font-medium text-center px-2">
                        {uploading ? 'Mengunggah...' : 'Upload Gambar'}
                    </span>
                </button>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Helper text */}
            {!isEditMode && pendingImages.length === 0 && (
                <small className="text-500 block">
                    Gambar belum bisa diunggah sebelum produk disimpan. Tambahkan gambar sekarang, dan gambar akan diunggah otomatis setelah produk tersimpan.
                </small>
            )}
            {!isEditMode && pendingImages.length > 0 && (
                <small className="text-500 block">
                    {pendingImages.length} gambar siap diunggah. Gambar akan dikirim ke server setelah Anda menekan tombol Simpan.
                </small>
            )}
        </div>
    );
};
