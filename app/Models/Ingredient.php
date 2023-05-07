<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit',
        'quantity',
        'name'
    ];
    
    public function recette(): BelongsTo
    {
        return $this->belongsTo(Recette::class);
    }
}
