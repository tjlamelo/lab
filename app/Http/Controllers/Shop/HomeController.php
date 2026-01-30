<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
class HomeController extends Controller
{
    public function index(){

    return Inertia::render('shop/home');
    }
}
