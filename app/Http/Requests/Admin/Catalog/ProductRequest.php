<?php

namespace App\Http\Requests\Admin\Catalog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    /**
     * Liste des langues supportées (à centraliser idéalement dans un config ou helper)
     */
  protected array $availableLocales = ['fr', 'en', 'ar', 'ru', 'zh'];
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        $rules = [
            // --- DONNÉES COMMUNES ---
            'category_id' => ['required', 'exists:categories,id'],
            'price'       => ['required', 'numeric', 'min:0'],
            'stock'       => ['required', 'integer', 'min:0'],
            'purity'      => ['nullable', 'string', 'max:20'],
            'unit'        => ['required', 'string', 'max:50'],
            'is_active'   => ['boolean'],
            'is_featured' => ['boolean'],
            'slug'        => [
                'required', 
                'string', 
                Rule::unique('products', 'slug')->ignore($productId)
            ],

            // --- RACINES DES TABLEAUX ---
            'name'        => ['required', 'array'],
            'description' => ['required', 'array'],
            'meta'        => ['nullable', 'array'],
            'meta.seo'    => ['nullable', 'array'],
        ];

        // --- GÉNÉRATION DYNAMIQUE DES RÈGLES PAR LANGUE ---
        foreach ($this->availableLocales as $lang) {
            $rules["name.{$lang}"] = ['required', 'string', 'max:255'];
            $rules["description.{$lang}"] = ['required', 'string'];
            $rules["meta.seo.{$lang}.title"] = ['nullable', 'string', 'max:70'];
            $rules["meta.seo.{$lang}.keywords"] = ['nullable', 'string'];
        }

        return $rules;
    }

    public function messages(): array
    {
        $messages = [
            'category_id.required' => __('Please select a category.'),
            'price.required'       => __('Price is required.'),
            'unit.required'        => __('Global unit is required (e.g., Gram).'),
            'slug.unique'          => __('This slug is already in use.'),
        ];

        // --- MESSAGES PRÉCIS PAR LANGUE ---
        $langLabels = [
            'fr' => 'Français',
            'en' => 'English',
            'ar' => 'العربية',
            'ru' => 'Русский',
            'zh' => '中文'
        ];

        foreach ($this->availableLocales as $lang) {
            $label = $langLabels[$lang] ?? strtoupper($lang);
            
            $messages["name.{$lang}.required"] = __("The product name in :lang is required.", ['lang' => $label]);
            $messages["description.{$lang}.required"] = __("The description in :lang is required.", ['lang' => $label]);
        }

        return $messages;
    }

    public function attributes(): array
    {
        return [
            'price'  => __('Price'),
            'stock'  => __('Stock'),
            'unit'   => __('Unit'),
            'purity' => __('Purity Level'),
        ];
    }
}