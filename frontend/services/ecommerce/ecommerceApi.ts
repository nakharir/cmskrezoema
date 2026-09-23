import axios, { AxiosError, AxiosInstance } from 'axios';
import {
    EcommerceCategory,
    EcommerceProduct,
    EcommerceProductImage,
    EcommerceVariant,
    ProductFilterParams,
    ApiErrorResponse
} from '@/types/ecommerce';
import { parseCurrency } from './ecommerceUtils';

// Centralized API URL resolution — set NEXT_PUBLIC_API_URL in Vercel environment variables
// Example: https://absentik.site.je/api
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || '';
// Normalize base url to always have /api (or without trailing slash)
export const ECOMMERCE_API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// Create dedicated axios instance for ecommerce
export const ecommerceApiClient: AxiosInstance = axios.create({
    baseURL: ECOMMERCE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    timeout: 15000
});

// Attach existing auth token if present in document.cookie or localStorage
ecommerceApiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            try {
                // Check user-info cookie (used by existing CMS)
                const cookies = document.cookie.split(';');
                const userInfoCookie = cookies.find((c) => c.trim().startsWith('user-info='));
                if (userInfoCookie) {
                    const parsed = JSON.parse(userInfoCookie.split('=')[1]);
                    const token = parsed.token || parsed.access_token || parsed.api_token;
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
            } catch (e) {
                // Fallback / silent pass
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Centralized error parser
export function parseApiError(error: any): ApiErrorResponse {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as any;

        if (status === 401) {
            return {
                status: 401,
                message: 'Sesi Anda telah berakhir atau belum terautentikasi (401). Silakan login kembali.'
            };
        }
        if (status === 403) {
            return {
                status: 403,
                message: 'Anda tidak memiliki hak akses untuk tindakan ini (403 Forbidden).'
            };
        }
        if (status === 404) {
            return {
                status: 404,
                message: data?.message || 'Data tidak ditemukan (404 Not Found).'
            };
        }
        if (status === 422) {
            return {
                status: 422,
                message: data?.message || 'Validasi gagal. Silakan periksa kembali formulir isian.',
                errors: data?.errors || {}
            };
        }
        if (status && status >= 500) {
            return {
                status,
                message: 'Terjadi kesalahan pada server (500 Server Error). Silakan coba beberapa saat lagi.'
            };
        }
        if (data?.message) {
            return {
                status,
                message: data.message,
                errors: data?.errors
            };
        }
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return {
                message: 'Permintaan ke server memakan waktu terlalu lama (Timeout). Periksa koneksi backend.'
            };
        }
        if (error.message?.includes('Network Error')) {
            return {
                message: `Gagal terhubung ke backend ecommerce di ${ECOMMERCE_API_BASE_URL}. Pastikan backend aktif.`
            };
        }
    }

    return {
        message: error?.message || 'Terjadi kesalahan tidak terduga.'
    };
}

// Ecommerce endpoints definition
export const ECOMMERCE_ENDPOINTS = {
    CATEGORIES: '/ecommerce/categories',
    PRODUCTS: '/ecommerce/products',
    PRODUCT_BY_SLUG_OR_ID: (slugOrId: string | number) => `/ecommerce/products/${slugOrId}`,
    ADMIN_PRODUCTS: '/ecommerce/admin/products',
    ADMIN_PRODUCT_BY_ID: (id: string | number) => `/ecommerce/admin/products/${id}`,
    ADMIN_PRODUCT_IMAGES: (productId: string | number) => `/ecommerce/admin/products/${productId}/images`,
    ADMIN_PRODUCT_IMAGE_BY_ID: (productId: string | number, imageId: string | number) => `/ecommerce/admin/products/${productId}/images/${imageId}`,
    ADMIN_PRODUCT_IMAGE_PRIMARY: (productId: string | number, imageId: string | number) => `/ecommerce/admin/products/${productId}/images/${imageId}/primary`,
    ADMIN_CATEGORIES: '/ecommerce/admin/categories',
    ADMIN_CATEGORY_BY_ID: (id: string | number) => `/ecommerce/admin/categories/${id}`
};

// Ecommerce API Service Client
export const ecommerceService = {
    /**
     * Get list of active ecommerce categories (public)
     * Endpoint: GET /api/ecommerce/categories
     */
    async getCategories(): Promise<EcommerceCategory[]> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.CATEGORIES);
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    },

    /**
     * Get list of admin categories with optional search / filter params
     * Endpoint: GET /api/ecommerce/admin/categories
     */
    async getAdminCategories(params?: { search?: string; is_active?: boolean | number }): Promise<EcommerceCategory[]> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.ADMIN_CATEGORIES, { params });
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    },

    /**
     * Get single category detail (admin)
     * Endpoint: GET /api/ecommerce/admin/categories/{id}
     */
    async getAdminCategory(id: string | number): Promise<EcommerceCategory> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.ADMIN_CATEGORY_BY_ID(id));
        const data = response.data?.data ?? response.data;
        return data;
    },

    /**
     * Create category (admin)
     * Endpoint: POST /api/ecommerce/admin/categories
     */
    async createCategory(payload: Partial<EcommerceCategory>): Promise<EcommerceCategory> {
        const response = await ecommerceApiClient.post(ECOMMERCE_ENDPOINTS.ADMIN_CATEGORIES, payload);
        const data = response.data?.data ?? response.data;
        return data;
    },

    /**
     * Update category (admin)
     * Endpoint: PUT /api/ecommerce/admin/categories/{id}
     */
    async updateCategory(id: string | number, payload: Partial<EcommerceCategory>): Promise<EcommerceCategory> {
        const response = await ecommerceApiClient.put(ECOMMERCE_ENDPOINTS.ADMIN_CATEGORY_BY_ID(id), payload);
        const data = response.data?.data ?? response.data;
        return data;
    },

    /**
     * Delete category (admin)
     * Endpoint: DELETE /api/ecommerce/admin/categories/{id}
     */
    async deleteCategory(id: string | number): Promise<any> {
        const response = await ecommerceApiClient.delete(ECOMMERCE_ENDPOINTS.ADMIN_CATEGORY_BY_ID(id));
        return response.data;
    },

    /**
     * Get list of ecommerce products with optional search / filter params
     * Endpoint: GET /api/ecommerce/products
     */
    async getProducts(params?: ProductFilterParams): Promise<EcommerceProduct[]> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.PRODUCTS, { params });
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    },

    /**
     * Get single product detail by ID or Slug
     * Endpoint: GET /api/ecommerce/products/{slug}
     */
    async getProduct(slugOrId: string | number): Promise<EcommerceProduct> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.PRODUCT_BY_SLUG_OR_ID(slugOrId));
        const data = response.data?.data ?? response.data;
        return data;
    },

    /**
     * Create product (admin)
     * Endpoint: POST /api/ecommerce/admin/products
     */
    async createProduct(payload: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
        const body: any = { ...payload };
        // Ensure base_price is always a valid numeric value for the backend
        const rawPrice = body.base_price ?? body.price ?? body.basePrice ?? 0;
        body.base_price = parseCurrency(rawPrice);
        // Remove redundant alias keys — backend expects 'base_price' only
        delete body.price;
        delete body.basePrice;
        delete body.base_price_formatted;
        const response = await ecommerceApiClient.post(ECOMMERCE_ENDPOINTS.ADMIN_PRODUCTS, body);
        const data = response.data?.data ?? response.data;
        return data;
    },

    /**
     * Update product (admin)
     * Endpoint: PUT /api/ecommerce/admin/products/{id}
     */
    async updateProduct(id: string | number, payload: Partial<EcommerceProduct>): Promise<EcommerceProduct> {
        const body: any = { ...payload };
        // Ensure base_price is parsed to numeric if present
        if (body.base_price !== undefined || body.price !== undefined || body.basePrice !== undefined) {
            const rawPrice = body.base_price ?? body.price ?? body.basePrice;
            body.base_price = parseCurrency(rawPrice);
        }
        delete body.price;
        delete body.basePrice;
        delete body.base_price_formatted;
        const response = await ecommerceApiClient.put(ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_BY_ID(id), body);
        const data = response.data?.data ?? response.data;
        return data;
    },

    /**
     * Delete product (admin)
     * Endpoint: DELETE /api/ecommerce/admin/products/{id}
     */
    async deleteProduct(id: string | number): Promise<any> {
        const response = await ecommerceApiClient.delete(ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_BY_ID(id));
        return response.data;
    },

    /**
     * Get single product detail via admin endpoint (includes inactive products and images)
     * Endpoint: GET /api/ecommerce/admin/products/{id}
     */
    async getAdminProduct(id: string | number): Promise<EcommerceProduct> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_BY_ID(id));
        return response.data?.data ?? response.data;
    },

    /**
     * Get all images for a product (admin)
     * Endpoint: GET /api/ecommerce/admin/products/{productId}/images
     */
    async getProductImages(productId: string | number): Promise<EcommerceProductImage[]> {
        const response = await ecommerceApiClient.get(ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_IMAGES(productId));
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    },

    /**
     * Upload a product image (admin) — multipart/form-data
     * Endpoint: POST /api/ecommerce/admin/products/{productId}/images
     */
    async uploadProductImage(
        productId: string | number,
        file: File,
        altText?: string,
        isPrimary?: boolean
    ): Promise<EcommerceProductImage> {
        const formData = new FormData();
        formData.append('image', file);
        if (altText) formData.append('alt_text', altText);
        if (isPrimary !== undefined) formData.append('is_primary', isPrimary ? '1' : '0');
        const response = await ecommerceApiClient.post(
            ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_IMAGES(productId),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data?.data ?? response.data;
    },

    /**
     * Delete a product image (admin)
     * Endpoint: DELETE /api/ecommerce/admin/products/{productId}/images/{imageId}
     */
    async deleteProductImage(productId: string | number, imageId: string | number): Promise<void> {
        await ecommerceApiClient.delete(ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_IMAGE_BY_ID(productId, imageId));
    },

    /**
     * Set a product image as primary (admin)
     * Endpoint: PUT /api/ecommerce/admin/products/{productId}/images/{imageId}/primary
     */
    async setProductImagePrimary(
        productId: string | number,
        imageId: string | number
    ): Promise<EcommerceProductImage> {
        const response = await ecommerceApiClient.put(
            ECOMMERCE_ENDPOINTS.ADMIN_PRODUCT_IMAGE_PRIMARY(productId, imageId)
        );
        return response.data?.data ?? response.data;
    }
};

// Standalone function exports matching requested naming
export const getAdminCategories = ecommerceService.getAdminCategories.bind(ecommerceService);
export const createCategory = ecommerceService.createCategory.bind(ecommerceService);
export const updateCategory = ecommerceService.updateCategory.bind(ecommerceService);
export const deleteCategory = ecommerceService.deleteCategory.bind(ecommerceService);
export const createProduct = ecommerceService.createProduct.bind(ecommerceService);
export const updateProduct = ecommerceService.updateProduct.bind(ecommerceService);
export const deleteProduct = ecommerceService.deleteProduct.bind(ecommerceService);
export const getAdminProduct = ecommerceService.getAdminProduct.bind(ecommerceService);
export const getProductImages = ecommerceService.getProductImages.bind(ecommerceService);
export const uploadProductImage = ecommerceService.uploadProductImage.bind(ecommerceService);
export const deleteProductImage = ecommerceService.deleteProductImage.bind(ecommerceService);
export const setProductImagePrimary = ecommerceService.setProductImagePrimary.bind(ecommerceService);
