'use client';

import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { EcommerceVariant } from '@/types/ecommerce';
import { formatCurrency, getStockStatus } from '@/services/ecommerce/ecommerceUtils';

interface ProductVariantManagerProps {
    variants: EcommerceVariant[];
    onChange: (variants: EcommerceVariant[]) => void;
    basePrice?: number;
}

interface VariantFormData {
    id?: number | string;
    product_id?: number | string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    is_active: boolean;
    optionsKey1: string;
    optionsValue1: string;
    optionsKey2: string;
    optionsValue2: string;
    optionsRawJson: string;
    useRawJson: boolean;
}

const emptyVariantForm: VariantFormData = {
    name: '',
    sku: '',
    price: 0,
    stock: 0,
    is_active: true,
    optionsKey1: 'Warna',
    optionsValue1: '',
    optionsKey2: 'Ukuran',
    optionsValue2: '',
    optionsRawJson: '{}',
    useRawJson: false
};

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
    variants,
    onChange,
    basePrice = 0
}) => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<VariantFormData>(emptyVariantForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const openAddDialog = () => {
        setEditingIndex(null);
        setFormData({
            ...emptyVariantForm,
            price: basePrice > 0 ? basePrice : 0
        });
        setFormErrors({});
        setDialogVisible(true);
    };

    const openEditDialog = (variant: EcommerceVariant, index: number) => {
        setEditingIndex(index);
        let key1 = 'Warna';
        let val1 = '';
        let key2 = 'Ukuran';
        let val2 = '';
        let rawJson = '{}';
        let useJson = false;

        if (variant.options) {
            if (typeof variant.options === 'object') {
                rawJson = JSON.stringify(variant.options, null, 2);
                const entries = Object.entries(variant.options);
                if (entries.length > 0) {
                    key1 = entries[0][0];
                    val1 = String(entries[0][1] ?? '');
                }
                if (entries.length > 1) {
                    key2 = entries[1][0];
                    val2 = String(entries[1][1] ?? '');
                }
            } else if (typeof variant.options === 'string') {
                rawJson = variant.options;
                try {
                    const parsed = JSON.parse(variant.options);
                    const entries = Object.entries(parsed);
                    if (entries.length > 0) {
                        key1 = entries[0][0];
                        val1 = String(entries[0][1] ?? '');
                    }
                    if (entries.length > 1) {
                        key2 = entries[1][0];
                        val2 = String(entries[1][1] ?? '');
                    }
                } catch {
                    useJson = true;
                }
            }
        }

        setFormData({
            id: variant.id,
            product_id: variant.product_id,
            name: variant.name || '',
            sku: variant.sku || '',
            price: Number(variant.price) || 0,
            stock: Number(variant.stock) || 0,
            is_active: Boolean(variant.is_active === 1 || variant.is_active === true),
            optionsKey1: key1,
            optionsValue1: val1,
            optionsKey2: key2,
            optionsValue2: val2,
            optionsRawJson: rawJson,
            useRawJson: useJson
        });
        setFormErrors({});
        setDialogVisible(true);
    };

    const handleDelete = (index: number) => {
        const next = variants.filter((_, i) => i !== index);
        onChange(next);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) {
            errors.name = 'Nama variant wajib diisi';
        }
        if (!formData.sku.trim()) {
            errors.sku = 'SKU variant wajib diisi';
        }
        if (formData.price < 0) {
            errors.price = 'Harga tidak boleh negatif';
        }
        if (formData.stock < 0) {
            errors.stock = 'Stok tidak boleh negatif';
        }

        if (formData.useRawJson) {
            try {
                JSON.parse(formData.optionsRawJson);
            } catch {
                errors.optionsRawJson = 'Format JSON options tidak valid';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveVariant = () => {
        if (!validateForm()) return;

        let optionsPayload: any = {};
        if (formData.useRawJson) {
            try {
                optionsPayload = JSON.parse(formData.optionsRawJson);
            } catch {
                optionsPayload = {};
            }
        } else {
            if (formData.optionsKey1.trim() && formData.optionsValue1.trim()) {
                optionsPayload[formData.optionsKey1.trim()] = formData.optionsValue1.trim();
            }
            if (formData.optionsKey2.trim() && formData.optionsValue2.trim()) {
                optionsPayload[formData.optionsKey2.trim()] = formData.optionsValue2.trim();
            }
        }

        const newVariant: EcommerceVariant = {
            id: formData.id,
            product_id: formData.product_id,
            name: formData.name.trim(),
            sku: formData.sku.trim(),
            price: Number(formData.price),
            stock: Number(formData.stock),
            is_active: formData.is_active ? 1 : 0,
            options: optionsPayload
        };

        if (editingIndex !== null && editingIndex >= 0) {
            const next = [...variants];
            next[editingIndex] = newVariant;
            onChange(next);
        } else {
            onChange([...variants, newVariant]);
        }

        setDialogVisible(false);
    };

    const stockTemplate = (rowData: EcommerceVariant) => {
        const stockInfo = getStockStatus(rowData.stock);
        return (
            <div className="flex align-items-center gap-2">
                <span className="font-semibold text-lg">{rowData.stock}</span>
                <Tag
                    value={stockInfo.label}
                    severity={stockInfo.severity}
                    icon={stockInfo.icon}
                    style={{ fontSize: '0.75rem' }}
                />
            </div>
        );
    };

    const statusTemplate = (rowData: EcommerceVariant) => {
        const active = rowData.is_active === 1 || rowData.is_active === true;
        return (
            <Tag
                value={active ? 'Aktif' : 'Nonaktif'}
                severity={active ? 'success' : 'danger'}
            />
        );
    };

    const optionsTemplate = (rowData: EcommerceVariant) => {
        if (!rowData.options) return <span className="text-gray-400 italic">-</span>;
        if (typeof rowData.options === 'object') {
            const entries = Object.entries(rowData.options);
            if (entries.length === 0) return <span className="text-gray-400 italic">-</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {entries.map(([k, v], idx) => (
                        <span
                            key={idx}
                            className="bg-blue-50 text-blue-800 text-xs px-2 py-1 border-round border-1 border-blue-200"
                        >
                            <strong>{k}:</strong> {String(v)}
                        </span>
                    ))}
                </div>
            );
        }
        return <span className="text-xs font-mono">{String(rowData.options)}</span>;
    };

    const actionTemplate = (rowData: EcommerceVariant, options: any) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="info"
                    rounded
                    text
                    tooltip="Edit Variant"
                    onClick={() => openEditDialog(rowData, options.rowIndex)}
                />
                <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    rounded
                    text
                    tooltip="Hapus Variant"
                    onClick={() => handleDelete(options.rowIndex)}
                />
            </div>
        );
    };

    return (
        <div className="surface-card p-4 border-round shadow-1 border-1 surface-border">
            <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-3 gap-2">
                <div>
                    <h5 className="m-0 text-xl font-bold flex align-items-center gap-2">
                        <i className="pi pi-sitemap text-primary"></i>
                        Variant Produk
                    </h5>
                    <p className="text-5xl text-500 text-sm m-0 mt-1">
                        Kelola variasi produk seperti warna, ukuran, SKU, stok, dan harga masing-masing variant.
                    </p>
                </div>
                <Button
                    type="button"
                    label="Tambah Variant"
                    icon="pi pi-plus"
                    size="small"
                    severity="success"
                    onClick={openAddDialog}
                />
            </div>

            <DataTable
                value={variants}
                emptyMessage="Belum ada variant untuk produk ini. Klik 'Tambah Variant' untuk menambahkan variasi warna/ukuran."
                responsiveLayout="scroll"
                className="p-datatable-sm"
                stripedRows
            >
                <Column
                    header="No"
                    body={(_, opt) => opt.rowIndex + 1}
                    style={{ width: '4rem' }}
                />
                <Column field="name" header="Nama Variant" style={{ minWidth: '12rem' }} />
                <Column field="sku" header="SKU" style={{ minWidth: '10rem' }} />
                <Column
                    header="Options"
                    body={optionsTemplate}
                    style={{ minWidth: '12rem' }}
                />
                <Column
                    field="price"
                    header="Harga"
                    body={(row) => <span className="font-medium">{formatCurrency(row.price)}</span>}
                    style={{ minWidth: '10rem' }}
                />
                <Column
                    field="stock"
                    header="Stok"
                    body={stockTemplate}
                    style={{ minWidth: '11rem' }}
                />
                <Column
                    field="is_active"
                    header="Status"
                    body={statusTemplate}
                    style={{ width: '7rem' }}
                />
                <Column
                    header="Aksi"
                    body={actionTemplate}
                    style={{ width: '7rem', textAlign: 'center' }}
                />
            </DataTable>

            {/* Dialog Form Variant */}
            <Dialog
                header={editingIndex !== null ? 'Edit Variant' : 'Tambah Variant Baru'}
                visible={dialogVisible}
                style={{ width: '90vw', maxWidth: '560px' }}
                modal
                onHide={() => setDialogVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            type="button"
                            label="Batal"
                            icon="pi pi-times"
                            text
                            onClick={() => setDialogVisible(false)}
                        />
                        <Button
                            type="button"
                            label={editingIndex !== null ? 'Simpan Perubahan' : 'Tambahkan'}
                            icon="pi pi-check"
                            onClick={handleSaveVariant}
                        />
                    </div>
                }
            >
                <div className="flex flex-column gap-3 pt-2">
                    <div className="field m-0">
                        <label htmlFor="variant-name" className="font-semibold block mb-1">
                            Nama Variant <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="variant-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Contoh: Merah / 4mm"
                            className={`w-full ${formErrors.name ? 'p-invalid' : ''}`}
                        />
                        {formErrors.name && (
                            <small className="p-error block mt-1">{formErrors.name}</small>
                        )}
                    </div>

                    <div className="field m-0">
                        <label htmlFor="variant-sku" className="font-semibold block mb-1">
                            SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="variant-sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Contoh: MNK-BLT-MRH-4MM"
                            className={`w-full ${formErrors.sku ? 'p-invalid' : ''}`}
                        />
                        {formErrors.sku && (
                            <small className="p-error block mt-1">{formErrors.sku}</small>
                        )}
                    </div>

                    <div className="grid">
                        <div className="col-12 sm:col-6 field m-0">
                            <label htmlFor="variant-price" className="font-semibold block mb-1">
                                Harga (Rp) <span className="text-red-500">*</span>
                            </label>
                            <InputNumber
                                id="variant-price"
                                value={formData.price}
                                onValueChange={(e) => setFormData({ ...formData, price: e.value ?? 0 })}
                                mode="currency"
                                currency="IDR"
                                locale="id-ID"
                                min={0}
                                className={`w-full ${formErrors.price ? 'p-invalid' : ''}`}
                            />
                            {formErrors.price && (
                                <small className="p-error block mt-1">{formErrors.price}</small>
                            )}
                        </div>

                        <div className="col-12 sm:col-6 field m-0">
                            <label htmlFor="variant-stock" className="font-semibold block mb-1">
                                Stok <span className="text-red-500">*</span>
                            </label>
                            <InputNumber
                                id="variant-stock"
                                value={formData.stock}
                                onValueChange={(e) => setFormData({ ...formData, stock: e.value ?? 0 })}
                                min={0}
                                className={`w-full ${formErrors.stock ? 'p-invalid' : ''}`}
                            />
                            {formErrors.stock && (
                                <small className="p-error block mt-1">{formErrors.stock}</small>
                            )}
                            <div className="mt-1">
                                {(() => {
                                    const st = getStockStatus(formData.stock);
                                    return (
                                        <Tag
                                            value={`Status: ${st.label}`}
                                            severity={st.severity}
                                            icon={st.icon}
                                            style={{ fontSize: '0.7rem' }}
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Options section */}
                    <div className="p-3 border-round border-1 surface-border bg-gray-50">
                        <div className="flex justify-content-between align-items-center mb-2">
                            <span className="font-semibold text-sm">Options / Atribut Variant</span>
                            <div className="flex align-items-center gap-2">
                                <label htmlFor="toggle-json" className="text-xs text-600">Mode JSON</label>
                                <InputSwitch
                                    inputId="toggle-json"
                                    checked={formData.useRawJson}
                                    onChange={(e) => setFormData({ ...formData, useRawJson: e.value ?? false })}
                                />
                            </div>
                        </div>

                        {!formData.useRawJson ? (
                            <div className="grid">
                                <div className="col-6 field m-0 mb-2">
                                    <small className="text-600">Atribut 1</small>
                                    <InputText
                                        value={formData.optionsKey1}
                                        onChange={(e) => setFormData({ ...formData, optionsKey1: e.target.value })}
                                        placeholder="Kunci (e.g. Warna)"
                                        className="w-full p-inputtext-sm mb-1"
                                    />
                                    <InputText
                                        value={formData.optionsValue1}
                                        onChange={(e) => setFormData({ ...formData, optionsValue1: e.target.value })}
                                        placeholder="Nilai (e.g. Merah)"
                                        className="w-full p-inputtext-sm"
                                    />
                                </div>
                                <div className="col-6 field m-0 mb-2">
                                    <small className="text-600">Atribut 2</small>
                                    <InputText
                                        value={formData.optionsKey2}
                                        onChange={(e) => setFormData({ ...formData, optionsKey2: e.target.value })}
                                        placeholder="Kunci (e.g. Ukuran)"
                                        className="w-full p-inputtext-sm mb-1"
                                    />
                                    <InputText
                                        value={formData.optionsValue2}
                                        onChange={(e) => setFormData({ ...formData, optionsValue2: e.target.value })}
                                        placeholder="Nilai (e.g. 4mm)"
                                        className="w-full p-inputtext-sm"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="field m-0">
                                <textarea
                                    rows={3}
                                    value={formData.optionsRawJson}
                                    onChange={(e) => setFormData({ ...formData, optionsRawJson: e.target.value })}
                                    className={`w-full p-2 font-mono text-sm border-round border-1 surface-border ${formErrors.optionsRawJson ? 'p-invalid border-red-500' : ''}`}
                                    placeholder='{"color": "Merah", "size": "4mm"}'
                                />
                                {formErrors.optionsRawJson && (
                                    <small className="p-error block mt-1">{formErrors.optionsRawJson}</small>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex align-items-center gap-3 pt-1">
                        <InputSwitch
                            inputId="variant-active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.value ?? true })}
                        />
                        <label htmlFor="variant-active" className="cursor-pointer font-medium text-sm">
                            Status Aktif ({formData.is_active ? 'Aktif dijual' : 'Nonaktif'})
                        </label>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
