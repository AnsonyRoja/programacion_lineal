import React from 'react';
import { Users, Flame } from 'lucide-react';

export default function DemandManager({
  demand,
  onChangeDemand,
  dishX,
  dishY
}) {
  const handleChange = (field, value) => {
    onChangeDemand({
      ...demand,
      [field]: Math.max(0, Number(value) || 0)
    });
  };

  return (
    <div className="manager-card">
      <div className="manager-header">
        <div className="flex items-center gap-2">
          <div className="icon-badge-purple">
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="section-title">Demanda y Clientes Satisfechos (Restricciones de Mercado)</h3>
            <p className="section-desc">
              Garantiza una cuota mínima de platos servidos para mantener la satisfacción y afluencia de clientes
            </p>
          </div>
        </div>
      </div>

      <div className="demand-inputs-grid">
        <div className="demand-card-item">
          <div className="demand-item-header">
            <span className="font-semibold text-gray-200">Clientes Mínimos Totales (x₁ + x₂)</span>
            <span className="badge-purple">Inecuación ≥</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            El restaurante debe servir como mínimo este total combinado de platos por servicio.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="150"
              className="input-demand"
              value={demand.minTotalClients || 0}
              onChange={(e) => handleChange('minTotalClients', e.target.value)}
            />
            <span className="text-sm font-semibold text-gray-300">clientes / platos</span>
          </div>
        </div>

        <div className="demand-card-item">
          <div className="demand-item-header">
            <span className="font-semibold text-gray-200">Demanda Mín. {dishX?.shortName} (x₁)</span>
            <span className="badge-pink">x₁ ≥ d₁</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Clientes que exigen específicamente este plato en carta.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              className="input-demand"
              value={demand.minDishX || 0}
              onChange={(e) => handleChange('minDishX', e.target.value)}
            />
            <span className="text-sm font-semibold text-gray-300">porciones</span>
          </div>
        </div>

        <div className="demand-card-item">
          <div className="demand-item-header">
            <span className="font-semibold text-gray-200">Demanda Mín. {dishY?.shortName} (x₂)</span>
            <span className="badge-purple">x₂ ≥ d₂</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Clientes que exigen específicamente este segundo plato en carta.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              className="input-demand"
              value={demand.minDishY || 0}
              onChange={(e) => handleChange('minDishY', e.target.value)}
            />
            <span className="text-sm font-semibold text-gray-300">porciones</span>
          </div>
        </div>

        <div className="demand-card-item">
          <div className="demand-item-header">
            <span className="font-semibold text-gray-200">Capacidad Máx. Cocina / Hornos</span>
            <span className="badge-red">x₁ + x₂ ≤ Cap</span>
          </div>
          <p className="text-xs text-gray-400 mb-2">
            Límite físico de preparación de la brigada de cocina y equipamiento.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="200"
              className="input-demand"
              value={demand.maxKitchenCapacity || 0}
              onChange={(e) => handleChange('maxKitchenCapacity', e.target.value)}
            />
            <span className="text-sm font-semibold text-gray-300">platos max</span>
          </div>
        </div>
      </div>
    </div>
  );
}
