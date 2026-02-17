<?php

namespace App\Http\Requests\Ordering;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'shipping_method' => ['nullable', 'string', Rule::in(['standard', 'express', 'overnight'])],

            // Shipping address
            'shipping_address' => ['required', 'array'],
            'shipping_address.first_name' => ['required', 'string', 'max:100'],
            'shipping_address.last_name' => ['required', 'string', 'max:100'],
            'shipping_address.email' => ['required', 'email', 'max:255'],
            'shipping_address.phone' => ['required', 'string', 'max:30'],
            'shipping_address.country' => ['required', 'string', 'size:2'],
            'shipping_address.state' => ['required', 'string', 'max:100'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.street' => ['required', 'string', 'max:255'],
            'shipping_address.zip_code' => ['required', 'string', 'max:20'],
            'shipping_address.apartment' => ['nullable', 'string', 'max:100'],
            'shipping_address.company' => ['nullable', 'string', 'max:150'],

            // Billing address
            'billing_address' => ['nullable', 'array'],
            'billing_address.same_as_shipping' => ['required', 'boolean'],
            // When same_as_shipping is true, completely ignore these fields (no errors).
            'billing_address.first_name' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:100',
            ],
            'billing_address.last_name' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:100',
            ],
            'billing_address.email' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'email',
                'max:255',
            ],
            'billing_address.phone' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:30',
            ],
            'billing_address.country' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'size:2',
            ],
            'billing_address.state' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:100',
            ],
            'billing_address.city' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:100',
            ],
            'billing_address.street' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:255',
            ],
            'billing_address.zip_code' => [
                'exclude_if:billing_address.same_as_shipping,true',
                'required_if:billing_address.same_as_shipping,false',
                'string',
                'max:20',
            ],
            'billing_address.apartment' => ['nullable', 'string', 'max:100'],
            'billing_address.company' => ['nullable', 'string', 'max:150'],

            'notes' => ['nullable', 'string', 'max:1000'],

            // Payment proof: image or PDF, up to 10MB
            'payment_proof' => ['required', 'file', 'max:10240', 'mimes:jpeg,jpg,png,webp,pdf'],
        ];
    }

    public function messages(): array
    {
        return [
            'payment_method_id.required' => __('Please select a payment method.'),
            'payment_method_id.exists' => __('The selected payment method is invalid.'),

            'shipping_address.first_name.required' => __('First name for shipping is required.'),
            'shipping_address.last_name.required' => __('Last name for shipping is required.'),
            'shipping_address.email.required' => __('Email for shipping is required.'),
            'shipping_address.email.email' => __('Please provide a valid email address.'),
            'shipping_address.phone.required' => __('Phone number for shipping is required.'),
            'shipping_address.country.required' => __('Please select a shipping country.'),
            'shipping_address.city.required' => __('City for shipping is required.'),
            'shipping_address.street.required' => __('Street address for shipping is required.'),
            'shipping_address.zip_code.required' => __('ZIP/Postal code for shipping is required.'),

            'billing_address.first_name.required_if' => __('First name for billing is required when billing address differs from shipping.'),
            'billing_address.last_name.required_if' => __('Last name for billing is required when billing address differs from shipping.'),
            'billing_address.email.required_if' => __('Email for billing is required when billing address differs from shipping.'),
            'billing_address.email.email' => __('Please provide a valid billing email address.'),
            'billing_address.phone.required_if' => __('Phone number for billing is required when billing address differs from shipping.'),
            'billing_address.country.required_if' => __('Please select a billing country when billing address differs from shipping.'),
            'billing_address.city.required_if' => __('City for billing is required when billing address differs from shipping.'),
            'billing_address.street.required_if' => __('Street address for billing is required when billing address differs from shipping.'),
            'billing_address.zip_code.required_if' => __('ZIP/Postal code for billing is required when billing address differs from shipping.'),

            'payment_proof.required' => __('Please upload a payment proof.'),
            'payment_proof.file' => __('The payment proof must be a file.'),
            'payment_proof.mimes' => __('The payment proof must be an image or PDF (jpeg, jpg, png, webp, pdf).'),
            'payment_proof.max' => __('The payment proof may not be greater than 10MB.'),
        ];
    }

    public function attributes(): array
    {
        return [
            'shipping_address.first_name' => __('First name'),
            'shipping_address.last_name' => __('Last name'),
            'shipping_address.email' => __('Email'),
            'shipping_address.phone' => __('Phone'),
            'shipping_address.country' => __('Country'),
            'shipping_address.city' => __('City'),
            'shipping_address.street' => __('Street'),
            'shipping_address.zip_code' => __('ZIP/Postal code'),
        ];
    }
}

