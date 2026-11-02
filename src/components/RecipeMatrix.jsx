import React from 'react';
import { ChefHat, Info } from 'lucide-react';

export default function RecipeMatrix({
  dishes,
  ingredients,
  onChangeIngredients
}) {
  const handleUsageChange = (ingredientId, dishId, value) => {
    const valNum = Math.max(0, Number(value) || 0);
    const updated = ingredients.map((ing) => {
      if (ing.id === ingredientId) {
        return {
          ...ing,
          usage: {
            ...ing.usage,
            [dishId]: valNum
          }
        };
      }
      return ing;
    });
    onChangeIngredients(updated);
  };

  return (
    <div className="manager-card">
      <div className="manager-header">
        <div className="flex items-center gap-2">
          <div className="icon-badge-amber">
            <ChefHat className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="section-title">Matriz de Recetas y Consumo Tecnológico (Coeficientes aᵢⱼ)</h3>
            <p className="section-desc">
              Define cuánto de cada ingrediente consume exactamente cada plato para calcular las restricciones de producción
            </p>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="recipe-matrix-table">
          <thead>
            <tr>
              <th>Ingrediente / Materia Prima</th>
              <th>Stock Disponible</th>
              {dishes.map((d) => (
                <th key={`head-${d.id}`}>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-2xs text-gray-400 font-normal">Gasto por porción</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => (
              <tr key={`matrix-${ing.id}`}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: ing.color || '#38bdf8' }} />
                    <span className="font-medium text-gray-200">{ing.name}</span>
                    <span className="text-2xs text-gray-400">({ing.unit})</span>
                  </div>
                </td>
                <td>
                  <span className="font-mono font-semibold text-sky-400">
                    {ing.stock} {ing.unit}
                  </span>
                </td>
                {dishes.map((dish) => {
                  const val = ing.usage?.[dish.id] ?? 0;
                  return (
                    <td key={`cell-${ing.id}-${dish.id}`}>
                      <div className="flex items-center gap-1 justify-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input-matrix-cell"
                          value={val}
                          onChange={(e) => handleUsageChange(ing.id, dish.id, e.target.value)}
                        />
                        <span className="text-2xs text-gray-400">{ing.unit}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="matrix-hint">
        <Info className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          Cada fila representa una inecuación lineal del tipo:{' '}
          <code className="text-sky-300">
            {dishes.map((d, i) => `(a_${i+1} · x_${i+1})`).join(' + ')} ≤ Stock
          </code>
          . Al modificar el consumo, se recalculan automáticamente las pendientes en el plano cartesiano.
        </span>
      </div>
    </div>
  );
}
