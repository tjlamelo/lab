<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

use Illuminate\Support\Facades\App;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (session()->has('locale') && in_array(session('locale'), array_keys(LaravelLocalization::getSupportedLocales()))) {
            App::setLocale(session('locale'));
        } else {
            App::setLocale(LaravelLocalization::getCurrentLocale());
        }

        return $next($request);
    }
}
