<?php

namespace App\Http\Requests\Admin\Catalog;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    /**
     * Liste des langues supportées.
     */
    protected array $availableLocales = ['fr', 'en', 'ar', 'ru', 'zh'];

    public function authorize(): bool
    {
        return true; 
    }
protected function prepareForValidation(): void
{
    $this->merge([
        // Si parent_id est une chaîne vide ou "null", on le force à null
        'parent_id' => ($this->parent_id === '' || $this->parent_id === 'null') ? null : $this->parent_id,
        
        // Bonus : S'assurer que is_active est un vrai booléen
        'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
    ]);
}
public function rules(): array
{
    $categoryId = $this->route('category')?->id;

    $rules = [
        'parent_id' => ['nullable', 'exists:categories,id'],
        'is_active' => ['boolean'],
        'slug'      => [
            'nullable', 'string', 'max:255', 
            Rule::unique('categories', 'slug')->ignore($categoryId)
        ],
        // Correction ici : 'sometimes' est une chaîne de caractères
        'image'     => ['nullable', 'sometimes'], 
    ];

    // On affine la règle de l'image dynamiquement
    if ($this->hasFile('image')) {
        $rules['image'] = ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'];
    } else {
        $rules['image'] = ['nullable', 'string'];
    }

    foreach ($this->availableLocales as $lang) {
        $rules["name.{$lang}"] = ($lang === 'fr') ? ['required', 'string', 'max:255'] : ['nullable', 'string', 'max:255'];
        $rules["description.{$lang}"] = ['nullable', 'string'];
    }

    return $rules;
}
    public function messages(): array
    {
        $messages = [
            'parent_id.exists' => __('The selected parent category is invalid.'),
            'slug.unique'      => __('This slug is already in use.'),
        ];

        $langLabels = [
            'fr' => 'Français', 'en' => 'English', 'ar' => 'العربية', 'ru' => 'Русский', 'zh' => '中文'
        ];

        foreach ($this->availableLocales as $lang) {
            $label = $langLabels[$lang] ?? strtoupper($lang);
            $messages["name.{$lang}.required"] = __("The category name in :lang is required.", ['lang' => $label]);
        }

        return $messages;
    }
    
}