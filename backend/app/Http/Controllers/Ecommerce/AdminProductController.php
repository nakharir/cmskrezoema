<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ecommerce\AdminProductStoreRequest;
use App\Http\Requests\Ecommerce\AdminProductUpdateRequest;
use App\Http\Resources\Ecommerce\ProductResource;
use App\Models\Ecommerce\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    /**
     * Store a newly created product in storage.
     */
    public function store(AdminProductStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);

            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Product::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = "{$originalSlug}-{$count}";
                $count++;
            }
        }

        $product = Product::create($validated);
        $product->load(['category', 'primaryImage', 'images', 'variants']);

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified product for admin (including inactive status and all images/variants).
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::with(['category', 'primaryImage', 'images', 'variants'])->find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(AdminProductUpdateRequest $request, int $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        $product->update($request->validated());
        $product->load(['category', 'primaryImage', 'images', 'variants']);

        return (new ProductResource($product))
            ->response()
            ->setStatusCode(200);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::with('images')->find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found',
            ], 404);
        }

        // Clean up physical images from storage
        foreach ($product->images as $img) {
            $relativePath = \Illuminate\Support\Str::after($img->image_url, '/storage/');
            if ($relativePath && \Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($relativePath);
            }
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
