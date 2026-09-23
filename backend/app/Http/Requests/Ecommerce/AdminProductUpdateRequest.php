<?php

namespace App\Http\Requests\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminProductUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            'category_id' => ['sometimes', 'required', 'exists:ecommerce_categories,id'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('ecommerce_products', 'slug')->ignore($productId)],
            'description' => ['nullable', 'string'],
            'material' => ['nullable', 'string', 'max:255'],
            'base_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
