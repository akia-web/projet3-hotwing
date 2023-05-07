<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Recette;
use App\Models\Step;
use Illuminate\Http\Request;
use stdClass;

class RecetteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $result =  Recette::with(['ingredients', 'steps'])->get();
        return response()->json($result);
    }   

    /**
     * Store a newly created resource in storage.
     */
    public function store()
    {
        $jsonData = file_get_contents('../scrapper/menu.json');
        $recettes = json_decode($jsonData, true);

        foreach ($recettes as $recetteData) {
            $recette = Recette::create([
                'name' => $recetteData['name'],
                'url' => $recetteData['link'],
            ]);
    
            foreach ($recetteData['ingredients'] as $ingredientData) {
                $ingredient = new Ingredient([
                    'unit' => $ingredientData['unit'],
                    'quantity' => $ingredientData['quantity'],
                    'name' => $ingredientData['ingredientName'],
                ]);
                $recette->ingredients()->save($ingredient);
            }
    
            foreach ($recetteData['step'] as $stepData) {
                $step = new Step([
                    'description' => $stepData['indication'],
                ]);
                $recette->steps()->save($step);
            }
        }






        // $recette = Recette::create([
        //     'name' => 'lolo',
        //     'url' => 'dsqdqdqsd',
        // ]);

        // $ingredient = new Ingredient([
        //     'unit' => 'L',
        //     'quantity' => '15',
        //     'name' => 'poulet',
        // ]);
        // $recette->ingredients()->save($ingredient);

        // $step = new Step([
        //     'description' => 'truc',
        // ]);
        // $recette->steps()->save($step);
    }

    /**
     * Display the specified resource.
     */
    public function show(Recette $recette)
    {
    $recette = Recette::with(['steps', 'ingredients'])->findOrFail($recette->id);
    return response()->json($recette);
    }

    public function showByName(string $name){
        $recette = Recette::with(['steps', 'ingredients'])->where('name', $name)->firstOrFail();

        $data = [
            'name' => $recette->name,
            'url' => $recette->url,
            'steps' => $recette->steps,
            'ingredients' => $recette->ingredients
        ];
    
        return response()->json($data);
    }


    public function showByIngredient($ingredient){
        

        $recettes = Recette::whereHas('ingredients', function ($query) use ($ingredient) {
            $query->where('name', 'LIKE', '%' . $ingredient . '%');
        })->with('ingredients', 'steps')->get();
    
        return response()->json($recettes);
    
    }


}
