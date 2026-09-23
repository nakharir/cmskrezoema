export interface EcommerceCategory {
    id: number | string;
    name: string;
    slug?: string;
    description?: string | null;
    is_active?: boolean | number;
    order?: number | null;
    sort_order?: number | null;
    products_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface EcommerceVariant {
    id?: number | string;
    product_id?: number | string;
    sku: string;
    name: string;
    options?: Record<string, any> | string | null;
    price: number;
    stock: number;
    is_active: boolean | number;
}

export interface EcommerceProductImage {
    id: number | string;
    product_id?: number | string;
    variant_id?: number | string | null;
    image_url: string;
    alt_text?: string | null;
    sort_order?: number;
    is_primary?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface EcommerceProduct {
    id: number | string;
    category_id: number | string;
    category?: EcommerceCategory | null;
    name: string;
    slug?: string;
    description?: string | null;
    material?: string | null;
    base_price?: number;
    price?: number;
    is_active: boolean | number;
    image?: string | null;
    images?: EcommerceProductImage[];
    variants?: EcommerceVariant[];
    variants_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ProductFilterParams {
    search?: string;
    category_id?: number | string;
    is_active?: boolean | number;
    page?: number;
    per_page?: number;
}

export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}
