'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { EcommerceCategory, ApiErrorResponse } from '@/types/ecommerce';
import { ecommerceService, parseApiError } from '@/services/ecommerce/ecommerceApi';

interface CategoryFormData {
    id?: number | string;
    name: string;
    slug?: string;
    description: string;
    is_active: boolean;
    sort_order: number;
}

const defaultFormData: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
    sort_order: 0,
};

export default function EcommerceCategoriesPage() {
    const toast = useRef<Toast>(null);

    // Categories data
    const [categories, setCategories] = useState<EcommerceCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ApiErrorResponse | null>(null);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog state for Create / Edit
    const [formDialogVisible, setFormDialogVisible] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
    const [formGeneralError, setFormGeneralError] = useState<string | null>(null);

    // Detail dialog
    const [selectedCategory, setSelectedCategory] = useState<EcommerceCategory | null>(null);
    const [detailVisible, setDetailVisible] = useState<boolean>(false);

    // Fetch categories from backend admin endpoint
    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ecommerceService.getAdminCategories();
            setCategories(data);
        } catch (err: any) {
            const parsed = parseApiError(err);
            setError(parsed);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal Memuat Kategori',
                detail: parsed.message,
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    // Filter categories based on search query and status filter
    const filteredCategories = categories.filter((c) => {
        // Status filter
        if (statusFilter === 'active' && !(c.is_active === true || c.is_active === 1)) {
            return false;
        }
        if (statusFilter === 'inactive' && (c.is_active === true || c.is_active === 1)) {
            return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.slug?.toLowerCase().includes(q) ||
            c.description?.toLowerCase().includes(q)
        );
    });

    // Open form dialog for Create
    const openCreateDialog = () => {
        setFormData({
            ...defaultFormData,
            sort_order: categories.length > 0
                ? Math.max(...categories.map(c => Number(c.sort_order || c.order || 0))) + 1
                : 1
        });
        setIsEditMode(false);
        setFormErrors({});
        setFormGeneralError(null);
        setFormDialogVisible(true);
    };

    // Open form dialog for Edit
    const openEditDialog = (cat: EcommerceCategory) => {
        setFormData({
            id: cat.id,
            name: cat.name || '',
            slug: cat.slug || '',
            description: cat.description || '',
            is_active: cat.is_active === 1 || cat.is_active === true,
            sort_order: Number(cat.sort_order ?? cat.order ?? 0),
        });
        setIsEditMode(true);
        setFormErrors({});
        setFormGeneralError(null);
        setFormDialogVisible(true);
    };

    // Open detail dialog
    const openDetail = (cat: EcommerceCategory) => {
        setSelectedCategory(cat);
        setDetailVisible(true);
    };

    // Submit handler for Create or Edit
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});
        setFormGeneralError(null);

        // Client-side quick check
        if (!formData.name.trim()) {
            setFormErrors({ name: ['Nama kategori wajib diisi.'] });
            setSubmitting(false);
            return;
        }

        const payload: Partial<EcommerceCategory> = {
            name: formData.name.trim(),
            description: formData.description?.trim() || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order ?? 0,
        };

        if (formData.slug?.trim()) {
            payload.slug = formData.slug.trim();
        }

        try {
            if (isEditMode && formData.id) {
                await ecommerceService.updateCategory(formData.id, payload);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Berhasil Diperbarui',
                    detail: `Kategori "${formData.name}" berhasil diperbarui.`,
                    life: 3000
                });
            } else {
                await ecommerceService.createCategory(payload);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Berhasil Ditambahkan',
                    detail: `Kategori baru "${formData.name}" berhasil dibuat.`,
                    life: 3000
                });
            }

            setFormDialogVisible(false);
            loadCategories();
        } catch (err: any) {
            const parsed = parseApiError(err);
            if (parsed.errors && Object.keys(parsed.errors).length > 0) {
                setFormErrors(parsed.errors);
            }
            setFormGeneralError(parsed.message || 'Gagal menyimpan kategori.');
            toast.current?.show({
                severity: 'error',
                summary: isEditMode ? 'Gagal Memperbarui Kategori' : 'Gagal Menambah Kategori',
                detail: parsed.message,
                life: 5000
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Confirm and Delete Category
    const confirmDeleteCategory = (cat: EcommerceCategory) => {
        confirmDialog({
            message: `Apakah Anda yakin ingin menghapus kategori "${cat.name}"? Kategori yang sudah memiliki produk tidak dapat dihapus.`,
            header: 'Konfirmasi Penghapusan Kategori',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Ya, Hapus',
            rejectLabel: 'Batal',
            acceptClassName: 'p-button-danger',
            accept: async () => {
                try {
                    await ecommerceService.deleteCategory(cat.id);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Berhasil Dihapus',
                        detail: `Kategori "${cat.name}" berhasil dihapus.`,
                        life: 3000
                    });
                    loadCategories();
                } catch (err: any) {
                    const parsed = parseApiError(err);
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Hapus Gagal',
                        detail: parsed.message || 'Kategori tidak dapat dihapus.',
                        life: 6000
                    });
                }
            }
        });
    };

    // Table Column Templates
    const nameBodyTemplate = (rowData: EcommerceCategory) => {
        return (
            <div>
                <div className="font-semibold text-900">{rowData.name}</div>
                {rowData.products_count !== undefined && (
                    <small className="text-500 block">
                        <i className="pi pi-box mr-1 text-xs"></i>
                        {rowData.products_count} produk
                    </small>
                )}
            </div>
        );
    };

    const slugBodyTemplate = (rowData: EcommerceCategory) => {
        return (
            <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 border-round font-mono">
                {rowData.slug || '-'}
            </code>
        );
    };

    const descriptionBodyTemplate = (rowData: EcommerceCategory) => {
        if (!rowData.description) {
            return <span className="text-400 italic text-sm">-</span>;
        }
        return (
            <span
                className="text-600 text-sm block"
                style={{
                    maxWidth: '18rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}
                title={rowData.description}
            >
                {rowData.description}
            </span>
        );
    };

    const statusBodyTemplate = (rowData: EcommerceCategory) => {
        const isActive =
            rowData.is_active === undefined ||
            rowData.is_active === 1 ||
            rowData.is_active === true;

        return (
            <Tag
                value={isActive ? 'Aktif' : 'Nonaktif'}
                severity={isActive ? 'success' : 'danger'}
            />
        );
    };

    const orderBodyTemplate = (rowData: EcommerceCategory) => {
        const orderVal = rowData.sort_order ?? rowData.order ?? 0;
        return <span className="font-mono text-sm">{orderVal}</span>;
    };

    const actionBodyTemplate = (rowData: EcommerceCategory) => {
        return (
            <div className="flex gap-1 justify-content-center">
                <Button
                    icon="pi pi-pencil"
                    tooltip="Edit Kategori"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                    severity="warning"
                    outlined
                    onClick={() => openEditDialog(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    tooltip="Hapus Kategori"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                    severity="danger"
                    outlined
                    onClick={() => confirmDeleteCategory(rowData)}
                />
                <Button
                    icon="pi pi-eye"
                    tooltip="Lihat Detail"
                    tooltipOptions={{ position: 'top' }}
                    size="small"
                    severity="secondary"
                    outlined
                    onClick={() => openDetail(rowData)}
                />
            </div>
        );
    };

    const statusOptions = [
        { label: 'Semua Status', value: 'all' },
        { label: 'Aktif Saja', value: 'active' },
        { label: 'Nonaktif Saja', value: 'inactive' },
    ];

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="col-12">
                <div className="card">
                    {/* Header bar */}
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center mb-4 gap-3">
                        <div>
                            <h2 className="text-2xl font-bold m-0 flex align-items-center gap-2">
                                <i className="pi pi-tags text-primary"></i>
                                Manajemen Kategori Ecommerce
                            </h2>
                            <span className="text-500 text-sm">
                                Kelola klasifikasi produk kerajinan tangan KREZOEMA (Manik Kaca, Akrilik, Mutiara, Tali & Kawat, dll).
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Refresh"
                                icon="pi pi-refresh"
                                severity="secondary"
                                outlined
                                onClick={loadCategories}
                                disabled={loading}
                            />
                            <Button
                                label="+ Tambah Kategori"
                                icon="pi pi-plus"
                                onClick={openCreateDialog}
                            />
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="surface-ground p-3 border-round mb-4 border-1 surface-border flex flex-column sm:flex-row justify-content-between align-items-center gap-3">
                        <div className="flex flex-column sm:flex-row gap-2 w-full sm:w-auto">
                            <span className="p-input-icon-left w-full sm:w-20rem">
                                <i className="pi pi-search" />
                                <InputText
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama, slug, atau deskripsi..."
                                    className="w-full"
                                />
                            </span>
                            <Dropdown
                                value={statusFilter}
                                options={statusOptions}
                                onChange={(e) => setStatusFilter(e.value)}
                                className="w-full sm:w-12rem"
                            />
                        </div>
                        <span className="text-500 text-sm font-medium">
                            Menampilkan {filteredCategories.length} dari {categories.length} kategori
                        </span>
                    </div>

                    {error && (
                        <div className="mb-4">
                            <Message
                                severity="error"
                                text={`Gagal memuat kategori: ${error.message}`}
                                className="w-full justify-content-start"
                            />
                            <div className="mt-2">
                                <Button
                                    label="Coba Lagi"
                                    icon="pi pi-refresh"
                                    size="small"
                                    severity="danger"
                                    outlined
                                    onClick={loadCategories}
                                />
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <DataTable
                        value={filteredCategories}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                        tableStyle={{ minWidth: '55rem' }}
                        emptyMessage={
                            loading ? (
                                <div className="flex flex-column align-items-center justify-content-center p-4">
                                    <ProgressSpinner style={{ width: '40px', height: '40px' }} />
                                    <span className="mt-2 text-500">Memuat data kategori...</span>
                                </div>
                            ) : (
                                <div className="text-center p-4 text-500">
                                    <i className="pi pi-tags text-4xl block mb-2"></i>
                                    Tidak ada data kategori ditemukan.
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
                            header="Nama"
                            body={nameBodyTemplate}
                            sortable
                            style={{ minWidth: '13rem' }}
                        />
                        <Column
                            field="slug"
                            header="Slug"
                            body={slugBodyTemplate}
                            sortable
                            style={{ minWidth: '11rem' }}
                        />
                        <Column
                            field="description"
                            header="Deskripsi"
                            body={descriptionBodyTemplate}
                            style={{ minWidth: '16rem' }}
                        />
                        <Column
                            field="is_active"
                            header="Status"
                            body={statusBodyTemplate}
                            sortable
                            style={{ width: '8rem', textAlign: 'center' }}
                        />
                        <Column
                            field="sort_order"
                            header="Urutan"
                            body={orderBodyTemplate}
                            sortable
                            style={{ width: '7rem', textAlign: 'center' }}
                        />
                        <Column
                            header="Aksi"
                            body={actionBodyTemplate}
                            style={{ width: '10rem', textAlign: 'center' }}
                        />
                    </DataTable>
                </div>
            </div>

            {/* Modal Dialog Form Tambah / Edit Kategori */}
            <Dialog
                header={isEditMode ? 'Edit Kategori Ecommerce' : 'Tambah Kategori Ecommerce Baru'}
                visible={formDialogVisible}
                style={{ width: '90vw', maxWidth: '540px' }}
                modal
                onHide={() => !submitting && setFormDialogVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            severity="secondary"
                            outlined
                            onClick={() => setFormDialogVisible(false)}
                            disabled={submitting}
                        />
                        <Button
                            label={submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Buat Kategori'}
                            icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                            onClick={handleFormSubmit}
                            disabled={submitting}
                        />
                    </div>
                }
            >
                <form onSubmit={handleFormSubmit} className="flex flex-column gap-3 pt-2">
                    {formGeneralError && (
                        <Message
                            severity="error"
                            text={formGeneralError}
                            className="w-full justify-content-start"
                        />
                    )}

                    {/* Field: Nama Kategori */}
                    <div className="flex flex-column gap-1">
                        <label htmlFor="cat_name" className="font-semibold text-900 text-sm">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="cat_name"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (formErrors.name) {
                                    setFormErrors({ ...formErrors, name: [] });
                                }
                            }}
                            placeholder="Contoh: Manik Kaca"
                            className={`w-full ${formErrors.name?.length ? 'p-invalid' : ''}`}
                            disabled={submitting}
                            autoFocus
                        />
                        {formErrors.name?.map((msg, i) => (
                            <small key={i} className="text-red-500 text-xs">
                                {msg}
                            </small>
                        ))}
                    </div>

                    {/* Field: Slug (Opsional manual override) */}
                    <div className="flex flex-column gap-1">
                        <label htmlFor="cat_slug" className="font-semibold text-700 text-sm flex justify-content-between">
                            <span>Slug URL (Opsional)</span>
                            <small className="text-400 font-normal">Otomatis digenerate jika dikosongkan</small>
                        </label>
                        <InputText
                            id="cat_slug"
                            value={formData.slug || ''}
                            onChange={(e) => {
                                setFormData({ ...formData, slug: e.target.value });
                                if (formErrors.slug) {
                                    setFormErrors({ ...formErrors, slug: [] });
                                }
                            }}
                            placeholder={formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'contoh: manik-kaca'}
                            className={`w-full font-mono text-sm ${formErrors.slug?.length ? 'p-invalid' : ''}`}
                            disabled={submitting}
                        />
                        {formErrors.slug?.map((msg, i) => (
                            <small key={i} className="text-red-500 text-xs">
                                {msg}
                            </small>
                        ))}
                    </div>

                    {/* Field: Deskripsi */}
                    <div className="flex flex-column gap-1">
                        <label htmlFor="cat_description" className="font-semibold text-900 text-sm">
                            Deskripsi
                        </label>
                        <InputTextarea
                            id="cat_description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tuliskan deskripsi singkat kategori ini..."
                            rows={3}
                            className="w-full text-sm"
                            disabled={submitting}
                        />
                        {formErrors.description?.map((msg, i) => (
                            <small key={i} className="text-red-500 text-xs">
                                {msg}
                            </small>
                        ))}
                    </div>

                    {/* Field: Urutan Tampilan & Status Aktif */}
                    <div className="grid">
                        <div className="col-12 sm:col-6 flex flex-column gap-1">
                            <label htmlFor="cat_sort_order" className="font-semibold text-900 text-sm">
                                Urutan Tampilan
                            </label>
                            <InputNumber
                                id="cat_sort_order"
                                value={formData.sort_order}
                                onValueChange={(e) => setFormData({ ...formData, sort_order: e.value ?? 0 })}
                                showButtons
                                min={0}
                                max={9999}
                                className={`w-full ${formErrors.sort_order?.length ? 'p-invalid' : ''}`}
                                disabled={submitting}
                            />
                            {formErrors.sort_order?.map((msg, i) => (
                                <small key={i} className="text-red-500 text-xs">
                                    {msg}
                                </small>
                            ))}
                        </div>

                        <div className="col-12 sm:col-6 flex flex-column justify-content-center pt-3">
                            <span className="font-semibold text-900 text-sm mb-2">Status Kategori</span>
                            <div className="flex align-items-center gap-2">
                                <InputSwitch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.value ?? true })}
                                    disabled={submitting}
                                />
                                <span className={`text-sm font-medium ${formData.is_active ? 'text-green-700' : 'text-red-600'}`}>
                                    {formData.is_active ? 'Aktif (Ditampilkan di Katalog)' : 'Nonaktif (Disembunyikan)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </Dialog>

            {/* Modal Detail Kategori */}
            <Dialog
                header="Detail Kategori Ecommerce"
                visible={detailVisible}
                style={{ width: '90vw', maxWidth: '480px' }}
                modal
                onHide={() => setDetailVisible(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        {selectedCategory && (
                            <Button
                                label="Edit"
                                icon="pi pi-pencil"
                                severity="warning"
                                outlined
                                onClick={() => {
                                    setDetailVisible(false);
                                    openEditDialog(selectedCategory);
                                }}
                            />
                        )}
                        <Button
                            label="Tutup"
                            icon="pi pi-check"
                            onClick={() => setDetailVisible(false)}
                        />
                    </div>
                }
            >
                {selectedCategory && (
                    <div className="flex flex-column gap-3 pt-2">
                        <div className="border-bottom-1 surface-border pb-2">
                            <span className="text-500 text-xs uppercase font-bold block">ID Kategori</span>
                            <span className="text-sm font-mono text-700">#{selectedCategory.id}</span>
                        </div>
                        <div className="border-bottom-1 surface-border pb-2">
                            <span className="text-500 text-xs uppercase font-bold block">Nama Kategori</span>
                            <span className="text-xl font-bold text-900">{selectedCategory.name}</span>
                        </div>
                        <div className="border-bottom-1 surface-border pb-2">
                            <span className="text-500 text-xs uppercase font-bold block">Slug URL</span>
                            <code className="text-sm bg-gray-100 px-2 py-1 border-round font-mono">
                                {selectedCategory.slug || '-'}
                            </code>
                        </div>
                        <div className="border-bottom-1 surface-border pb-2">
                            <span className="text-500 text-xs uppercase font-bold block">Status Ketersediaan</span>
                            <div className="mt-1">
                                <Tag
                                    value={
                                        selectedCategory.is_active === 0 || selectedCategory.is_active === false
                                            ? 'Nonaktif'
                                            : 'Aktif'
                                    }
                                    severity={
                                        selectedCategory.is_active === 0 || selectedCategory.is_active === false
                                            ? 'danger'
                                            : 'success'
                                    }
                                />
                            </div>
                        </div>
                        <div className="border-bottom-1 surface-border pb-2">
                            <span className="text-500 text-xs uppercase font-bold block">Urutan Tampilan</span>
                            <span className="text-900 font-medium">
                                {selectedCategory.sort_order ?? selectedCategory.order ?? 0}
                            </span>
                        </div>
                        <div className="border-bottom-1 surface-border pb-2">
                            <span className="text-500 text-xs uppercase font-bold block">Jumlah Produk Terkait</span>
                            <span className="text-900 font-medium">
                                {selectedCategory.products_count ?? 0} produk
                            </span>
                        </div>
                        <div>
                            <span className="text-500 text-xs uppercase font-bold block">Deskripsi</span>
                            <p className="text-700 text-sm mt-1 m-0">
                                {selectedCategory.description || 'Tidak ada deskripsi tambahan.'}
                            </p>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
