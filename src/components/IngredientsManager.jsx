import React from 'react';
import { Package, Plus, Trash2, Sliders } from 'lucide-react';

const PALETTE = ['#38bdf8', '#eab308', '#ef4444', '#a855f7', '#10b981', '#f97316', '#ec4899'];

export default function IngredientsManager({
  ingredients,
  onChangeIngredients
}) {
  const handleUpdateIngredient = (id, field, value) => {
    const updated = ingredients.map((ing) => {
      if (ing.id === id) {
        return {
          ...ing,
          [field]: field === 'name' || field === 'unit' || field === 'color' ? value : Number(value) || 0
        };
      }
      return ing;
    });
    onChangeIngredients(updated);
  };

  const handleAddIngredient = () => {
    const newIdx = ingredients.length + 1;
    const color = PALETTE[(newIdx - 1) % PALETTE.length];
    const newIng = {
      id: `ing_${Date.now()}`,
      name: `Insumo Nuevo ${newIdx}`,
      unit: 'kg',
      stock: 20,
      costPerUnit: 5.0,
      color,
      usage: {}
    };
    onChangeIngredients([...ingredients, newIng]);
  };

  const handleDeleteIngredient = (id) => {
    if (ingredients.length <= 1) {
      alert('Se requiere al menos 1 ingrediente limitante para acotar la región factible.');
      return;
    }
    onChangeIngredients(ingredients.filter(ing => ing.id !== id));
  };

  return (
    <div className="manager-card">
      <div className="manager-header">
        <div className="flex items-center gap-2">
          <div className="icon-badge-sky">
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="section-title">Ingredientes y Materias Primas (Restricciones de Stock)</h3>
            <p className="section-desc">Ajusta el inventario disponible; mueve los deslizadores para ver el impacto en vivo en el plano</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-sm"
          onClick={handleAddIngredient}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Agregar Insumo
        </button>
      </div>

      <div className="ingredients-grid">
        {ingredients.map((ing) => (
          <div key={ing.id} className="ingredient-card">
            <div className="ingredient-card-top">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="color"
                  className="color-picker-mini"
                  value={ing.color || '#38bdf8'}
                  onChange={(e) => handleUpdateIngredient(ing.id, 'color', e.target.value)}
                  title="Cambiar color de la recta en el plano"
                />
                <input
                  type="text"
                  className="input-ing-name"
                  value={ing.name}
                  onChange={(e) => handleUpdateIngredient(ing.id, 'name', e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn-trash"
                onClick={() => handleDeleteIngredient(ing.id)}
                title="Eliminar ingrediente"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="ingredient-stock-row">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Stock Disponible:</span>
                <span className="font-mono font-bold text-sky-300">
                  {ing.stock} {ing.unit}
                </span>
              </div>

              {/* Slider de simulación rápida en vivo */}
              <input
                type="range"
                min="1"
                max={Math.max(100, Math.ceil(ing.stock * 2))}
                step={ing.stock > 50 ? 5 : 1}
                value={ing.stock}
                onChange={(e) => handleUpdateIngredient(ing.id, 'stock', e.target.value)}
                className="slider-input"
              />
            </div>

            <div className="ingredient-meta-row">
              <div className="meta-field">
                <label>Unidad:</label>
                <input
                  type="text"
                  className="input-mini"
                  value={ing.unit}
                  onChange={(e) => handleUpdateIngredient(ing.id, 'unit', e.target.value)}
                  placeholder="kg, gr, l..."
                />
              </div>

              <div className="meta-field">
                <label>Costo/Unidad ($):</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  className="input-mini"
                  value={ing.costPerUnit || 0}
                  onChange={(e) => handleUpdateIngredient(ing.id, 'costPerUnit', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
