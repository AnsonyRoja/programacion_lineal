import React from 'react';
import { Utensils, Plus, Trash2, DollarSign, AlertTriangle } from 'lucide-react';

export default function DishesManager({
  dishes,
  onChangeDishes,
  selectedPair,
  onSelectPair
}) {
  const handleUpdateDish = (id, field, value) => {
    const updated = dishes.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          [field]: field === 'name' || field === 'shortName' || field === 'color' ? value : Number(value) || 0
        };
      }
      return d;
    });
    onChangeDishes(updated);
  };

  const handleAddDish = () => {
    const newIdx = dishes.length + 1;
    const newDish = {
      id: `p_${Date.now()}`,
      name: `Plato Especial ${newIdx} (x${newIdx})`,
      shortName: `Plato ${newIdx}`,
      price: 18.0,
      cost: 6.0,
      risk: 2.0,
      targetDemand: 10,
      color: '#3b82f6'
    };
    onChangeDishes([...dishes, newDish]);
  };

  const handleDeleteDish = (id) => {
    if (dishes.length <= 2) {
      alert('Se requieren al menos 2 platos para el método de optimización gráfica.');
      return;
    }
    onChangeDishes(dishes.filter(d => d.id !== id));
  };

  return (
    <div className="manager-card">
      <div className="manager-header">
        <div className="flex items-center gap-2">
          <div className="icon-badge-emerald">
            <Utensils className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="section-title">Platos del Menú (Variables de Decisión xⱼ)</h3>
            <p className="section-desc">Configura precios, costos y riesgo de merma por plato</p>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-sm"
          onClick={handleAddDish}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Agregar Plato
        </button>
      </div>

      {/* Selector de qué platos graficar en el plano si hay más de 2 */}
      {dishes.length > 2 && (
        <div className="axis-selector-bar">
          <span className="text-xs font-semibold text-gray-300">Variables en el Plano:</span>
          <div className="flex items-center gap-3">
            <label className="text-xs flex items-center gap-1">
              <span className="text-emerald-400 font-bold">Eje X (x₁):</span>
              <select
                className="select-mini"
                value={selectedPair[0]}
                onChange={(e) => onSelectPair([e.target.value, selectedPair[1]])}
              >
                {dishes.map(d => (
                  <option key={`opt-x-${d.id}`} value={d.id} disabled={d.id === selectedPair[1]}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs flex items-center gap-1">
              <span className="text-cyan-400 font-bold">Eje Y (x₂):</span>
              <select
                className="select-mini"
                value={selectedPair[1]}
                onChange={(e) => onSelectPair([selectedPair[0], e.target.value])}
              >
                {dishes.map(d => (
                  <option key={`opt-y-${d.id}`} value={d.id} disabled={d.id === selectedPair[0]}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      <div className="dishes-grid">
        {dishes.map((dish, idx) => {
          const margin = (dish.price || 0) - (dish.cost || 0);
          const isDishX = selectedPair[0] === dish.id;
          const isDishY = selectedPair[1] === dish.id;

          return (
            <div
              key={dish.id}
              className={`dish-item-card ${isDishX ? 'border-dish-x' : isDishY ? 'border-dish-y' : ''}`}
            >
              <div className="dish-item-top">
                <div className="flex items-center gap-2">
                  <span className={`dish-badge ${isDishX ? 'badge-x' : isDishY ? 'badge-y' : 'badge-general'}`}>
                    {isDishX ? 'Eje X (x₁)' : isDishY ? 'Eje Y (x₂)' : `x${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    className="input-dish-name"
                    value={dish.name}
                    onChange={(e) => handleUpdateDish(dish.id, 'name', e.target.value)}
                  />
                </div>

                {dishes.length > 2 && (
                  <button
                    type="button"
                    className="btn-trash"
                    onClick={() => handleDeleteDish(dish.id)}
                    title="Eliminar plato"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="dish-params-row">
                <div className="param-field">
                  <label>Precio Venta ($)</label>
                  <div className="input-with-icon">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={dish.price}
                      onChange={(e) => handleUpdateDish(dish.id, 'price', e.target.value)}
                    />
                  </div>
                </div>

                <div className="param-field">
                  <label>Costo Insumo ($)</label>
                  <div className="input-with-icon">
                    <DollarSign className="w-3 h-3 text-red-400" />
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={dish.cost}
                      onChange={(e) => handleUpdateDish(dish.id, 'cost', e.target.value)}
                    />
                  </div>
                </div>

                <div className="param-field">
                  <label>Riesgo / Merma ($)</label>
                  <div className="input-with-icon">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <input
                      type="number"
                      step="0.2"
                      min="0"
                      value={dish.risk}
                      onChange={(e) => handleUpdateDish(dish.id, 'risk', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="dish-footer-calc">
                <div className="profit-margin">
                  Margen Unitario (cⱼ): <strong className="text-emerald-400">+${margin.toFixed(2)}</strong>
                </div>
                <div className="text-xs text-gray-400">
                  Rentabilidad: {dish.cost > 0 ? `${((margin / dish.cost) * 100).toFixed(0)}%` : '100%'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
